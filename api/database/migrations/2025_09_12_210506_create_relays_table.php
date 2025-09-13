<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('relays', function (Blueprint $table) {
            $table->string('url', 100)->primary();
            $table->string('name', 100)->nullable();
            $table->string('icon', 512)->nullable();
            $table->string('pubkey', 64)->nullable();
            $table->text('description')->nullable();
            $table->string('contact', 250)->nullable();
            $table->string('supported_nips', 250)->nullable();
            $table->string('software', 250)->nullable();
            $table->string('version', 50)->nullable();
            $table->boolean('available')->index()->default(false);
            $table->bigInteger('ref_count')
                ->default(1)
                ->index();
            $table->timestamps();
        });

        // extensões necessárias
        DB::statement("CREATE EXTENSION IF NOT EXISTS pg_trgm");
        DB::statement("CREATE EXTENSION IF NOT EXISTS unaccent");

        // coluna normal para full-text search
        DB::statement("ALTER TABLE relays ADD COLUMN search_vector tsvector");

        // trigger function para atualizar o tsvector
        DB::statement("
            CREATE OR REPLACE FUNCTION relays_search_vector_trigger() RETURNS trigger AS \$\$
            BEGIN
                NEW.search_vector :=
                    setweight(to_tsvector('portuguese', unaccent(coalesce(NEW.name,''))), 'A') ||
                    setweight(to_tsvector('english',   unaccent(coalesce(NEW.name,''))), 'A') ||
                    setweight(to_tsvector('portuguese', unaccent(coalesce(NEW.description,''))), 'B') ||
                    setweight(to_tsvector('english',   unaccent(coalesce(NEW.description,''))), 'B') ||
                    setweight(to_tsvector('portuguese', unaccent(coalesce(NEW.url,''))), 'C') ||
                    setweight(to_tsvector('english',   unaccent(coalesce(NEW.url,''))), 'C');
                RETURN NEW;
            END;
            \$\$ LANGUAGE plpgsql;
        ");

        // trigger para insert/update
        DB::statement("
            CREATE TRIGGER relays_search_vector_update
            BEFORE INSERT OR UPDATE ON relays
            FOR EACH ROW EXECUTE FUNCTION relays_search_vector_trigger();
        ");

        // índices GIN para acelerar busca
        DB::statement("CREATE INDEX relays_search_vector_idx ON relays USING GIN (search_vector)");
        DB::statement("CREATE INDEX IF NOT EXISTS relays_search_vector_trgm_idx ON relays USING gin ((search_vector::text) gin_trgm_ops)");
        DB::statement("CREATE INDEX IF NOT EXISTS relays_ref_count_trgm_idx ON relays (ref_count)");
        DB::statement("CREATE INDEX IF NOT EXISTS relays_available_trgm_idx ON relays (available)");
    }

    public function down(): void
    {
        DB::statement("DROP TRIGGER IF EXISTS relays_search_vector_update ON relays");
        DB::statement("DROP FUNCTION IF EXISTS relays_search_vector_trigger()");
        Schema::dropIfExists('relays');
    }
};
