<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('files', function (Blueprint $table) {
            $table->string('url', 512)->primary();

            $table->string('pubkey', 64);
            $table->foreign('pubkey')
                ->references('pubkey')->on('users')
                ->onDelete('cascade');

            $table->string('note_id', 64);
            $table->foreign('note_id')
                  ->references('id')->on('notes')
                ->onDelete('cascade');

            $table->string('title', 255);
            $table->string('description', 512)->nullable();
            $table->enum('type', ['image', 'video', 'audio'])
                ->default('image')
                ->index();
            $table->string('tags', 512)->nullable();
            $table->string('published_by', 150);
            $table->bigInteger('published_at')->index();

            $table->bigInteger('ref_count')
                ->default(1)->index();
            $table->timestamps();
        });

        // extensões necessárias
        DB::statement("CREATE EXTENSION IF NOT EXISTS pg_trgm");
        DB::statement("CREATE EXTENSION IF NOT EXISTS unaccent");

        // coluna normal para full-text search
        DB::statement("ALTER TABLE files ADD COLUMN search_vector tsvector");

        // trigger function para atualizar search_vector
        DB::statement("
            CREATE OR REPLACE FUNCTION files_search_vector_trigger() RETURNS trigger AS \$\$
            BEGIN
                NEW.search_vector :=
                    setweight(to_tsvector('portuguese', unaccent(coalesce(NEW.title,''))), 'A') ||
                    setweight(to_tsvector('english',   unaccent(coalesce(NEW.title,''))), 'A') ||
                    setweight(to_tsvector('portuguese', unaccent(coalesce(NEW.tags,''))), 'B') ||
                    setweight(to_tsvector('english',   unaccent(coalesce(NEW.tags,''))), 'B') ||
                    setweight(to_tsvector('portuguese', unaccent(coalesce(NEW.published_by,''))), 'C') ||
                    setweight(to_tsvector('english',   unaccent(coalesce(NEW.published_by,''))), 'C');
                RETURN NEW;
            END;
            \$\$ LANGUAGE plpgsql;
        ");

        // trigger para insert/update
        DB::statement("
            CREATE TRIGGER files_search_vector_update
            BEFORE INSERT OR UPDATE ON files
            FOR EACH ROW EXECUTE FUNCTION files_search_vector_trigger();
        ");

        // índices
        DB::statement("CREATE INDEX files_search_vector_idx ON files USING GIN (search_vector)"); // full-text
        DB::statement("CREATE INDEX files_search_vector_trgm_idx ON files USING gin ((search_vector::text) gin_trgm_ops)"); // fallback ILIKE
    }

    public function down(): void
    {
        DB::statement("DROP TRIGGER IF EXISTS files_search_vector_update ON files");
        DB::statement("DROP FUNCTION IF EXISTS files_search_vector_trigger()");
        Schema::dropIfExists('files');
    }
};
