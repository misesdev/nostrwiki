<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notes', function (Blueprint $table) {
            $table->string('id', 64)->primary();
            $table->string('pubkey', 64);

            $table->foreign('pubkey')
                ->references('pubkey') 
                ->on('users')
                ->onDelete('cascade');

            $table->string('title', 255);
            $table->text('content')->nullable(true);
            $table->integer('kind');
            $table->string('tags', 512)->nullable(); // antes era jsonb
            $table->string('published_by', 100);
            $table->bigInteger('published_at');
            $table->bigInteger('ref_count')
                ->default(1)->index();
            $table->timestamps();
        });

        // extensões necessárias
        DB::statement("CREATE EXTENSION IF NOT EXISTS pg_trgm");
        DB::statement("CREATE EXTENSION IF NOT EXISTS unaccent");

        // coluna normal para full-text search
        DB::statement("ALTER TABLE notes ADD COLUMN search_vector tsvector");

        // coluna auxiliar para substring search
        DB::statement("ALTER TABLE notes ADD COLUMN search_text text");

        // trigger function para atualizar search_vector
        DB::statement("
            CREATE OR REPLACE FUNCTION notes_search_vector_trigger() RETURNS trigger AS \$\$
            BEGIN
                NEW.search_vector :=
                    setweight(to_tsvector('portuguese', unaccent(coalesce(NEW.title,''))), 'A') ||
                    setweight(to_tsvector('english', unaccent(coalesce(NEW.title,''))), 'A') ||
                    setweight(to_tsvector('portuguese', unaccent(coalesce(NEW.published_by,''))), 'B') ||
                    setweight(to_tsvector('english', unaccent(coalesce(NEW.published_by,''))), 'B') ||
                    setweight(to_tsvector('portuguese', unaccent(coalesce(NEW.tags,''))), 'C') ||
                    setweight(to_tsvector('english', unaccent(coalesce(NEW.tags,''))), 'C') ||
                    setweight(to_tsvector('portuguese', unaccent(coalesce(NEW.content,''))), 'D') ||
                    setweight(to_tsvector('english', unaccent(coalesce(NEW.content,''))), 'D');
            
                -- versão plain text normalizada (para ILIKE/trgm)
                NEW.search_text :=
                    lower(
                        unaccent(
                            coalesce(NEW.title,'') || ' ' ||
                            coalesce(NEW.tags,'') || ' ' || 
                            coalesce(NEW.published_by,'') || ' ' 
                        )
                    );
                RETURN NEW;
            END;
            \$\$ LANGUAGE plpgsql;
        ");

        // trigger para insert/update
        DB::statement("
            CREATE TRIGGER notes_search_vector_update
            BEFORE INSERT OR UPDATE ON notes
            FOR EACH ROW EXECUTE FUNCTION notes_search_vector_trigger();
        ");

        // índices
        DB::statement("CREATE INDEX notes_search_vector_idx ON notes USING GIN (search_vector)"); // full-text
        DB::statement("CREATE INDEX notes_search_text_trgm_idx ON notes USING gin (search_text gin_trgm_ops)");
    }

    public function down(): void
    {
        DB::statement("DROP TRIGGER IF EXISTS notes_search_vector_update ON notes");
        DB::statement("DROP FUNCTION IF EXISTS notes_search_vector_trigger()");
        Schema::dropIfExists('notes');
    }
};
