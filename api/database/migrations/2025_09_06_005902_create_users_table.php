<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->string('pubkey', 64)->primary();
            $table->string('name', 100)->nullable();
            $table->string('display_name', 100)->nullable();
            $table->string('picture', 512)->nullable();
            $table->text('about')->nullable();
            $table->string('banner', 512)->nullable();
            $table->string('website', 512)->nullable();
            $table->string('nip05', 512)->nullable();
            $table->string('lud06', 512)->nullable();
            $table->string('lud16', 512)->nullable();
            $table->string('zap_service', 512)->nullable();
            $table->boolean('available')->default(false);
            $table->bigInteger('ref_count')
                ->default(0)->index();
            $table->timestamps();
        });

        // extensões necessárias
        DB::statement("CREATE EXTENSION IF NOT EXISTS pg_trgm");
        DB::statement("CREATE EXTENSION IF NOT EXISTS unaccent");

        // coluna normal para full-text search
        DB::statement("ALTER TABLE users ADD COLUMN search_vector tsvector");

        // trigger function para atualizar search_vector
        DB::statement("
            CREATE OR REPLACE FUNCTION users_search_vector_trigger() RETURNS trigger AS \$\$
            BEGIN
                NEW.search_vector :=
                    setweight(to_tsvector('portuguese', unaccent(coalesce(NEW.display_name,''))), 'A') ||
                    setweight(to_tsvector('english',   unaccent(coalesce(NEW.display_name,''))), 'A') ||
                    setweight(to_tsvector('portuguese', unaccent(coalesce(NEW.name,''))), 'B') ||
                    setweight(to_tsvector('english',   unaccent(coalesce(NEW.name,''))), 'B') ||
                    setweight(to_tsvector('portuguese', unaccent(coalesce(NEW.about,''))), 'C') ||
                    setweight(to_tsvector('english',   unaccent(coalesce(NEW.about,''))), 'C');
                RETURN NEW;
            END;
            \$\$ LANGUAGE plpgsql;
        ");

        // trigger for insert/update
        DB::statement("
            CREATE TRIGGER users_search_vector_update
            BEFORE INSERT OR UPDATE ON users
            FOR EACH ROW EXECUTE FUNCTION users_search_vector_trigger();
        ");

        // índices
        DB::statement("CREATE INDEX users_search_vector_idx ON users USING GIN (search_vector)"); // full-text
        DB::statement("CREATE INDEX users_search_vector_trgm_idx ON users USING gin ((search_vector::text) gin_trgm_ops)"); // fallback ILIKE
    }

    public function down(): void
    {
        DB::statement("DROP TRIGGER IF EXISTS users_search_vector_update ON users");
        DB::statement("DROP FUNCTION IF EXISTS users_search_vector_trigger()");
        Schema::dropIfExists('users');
    }
};
