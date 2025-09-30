<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("DROP TRIGGER IF EXISTS files_search_vector_update ON files");
        DB::statement("DROP FUNCTION IF EXISTS files_search_vector_trigger()");

        DB::statement("
            CREATE OR REPLACE FUNCTION files_search_vector_trigger() RETURNS trigger AS \$\$
            BEGIN
                NEW.search_vector :=
                    setweight(to_tsvector('portuguese', unaccent(coalesce(NEW.published_by,''))), 'A') ||
                    setweight(to_tsvector('english',   unaccent(coalesce(NEW.published_by,''))), 'A') ||
                    setweight(to_tsvector('portuguese', unaccent(coalesce(NEW.tags,''))), 'B') ||
                    setweight(to_tsvector('english',   unaccent(coalesce(NEW.tags,''))), 'B') ||
                    setweight(to_tsvector('portuguese', unaccent(coalesce(NEW.description,''))), 'C') ||
                    setweight(to_tsvector('english',   unaccent(coalesce(NEW.description,''))), 'C');
                
                NEW.search_text :=
                    lower(
                        unaccent(
                            coalesce(NEW.published_by,'') || ' ' || 
                            coalesce(NEW.tags,'') || ' '
                        )
                    );
                RETURN NEW;
            END;
            \$\$ LANGUAGE plpgsql;
        ");

        DB::statement("
            CREATE TRIGGER files_search_vector_update
            BEFORE INSERT OR UPDATE ON files
            FOR EACH ROW EXECUTE FUNCTION files_search_vector_trigger();
        ");

        Schema::table('files', function (Blueprint $table) {
            $table->dropColumn('title');
        });
    }

    public function down(): void
    {
        Schema::table('files', function (Blueprint $table) {
            $table->string('title', 255)->nullable();
        });

        DB::statement("DROP TRIGGER IF EXISTS files_search_vector_update ON files");
        DB::statement("DROP FUNCTION IF EXISTS files_search_vector_trigger()");

        DB::statement("
            CREATE OR REPLACE FUNCTION files_search_vector_trigger() RETURNS trigger AS \$\$
            BEGIN
                NEW.search_vector :=
                    setweight(to_tsvector('portuguese', unaccent(coalesce(NEW.title,''))), 'A') ||
                    setweight(to_tsvector('english',   unaccent(coalesce(NEW.title,''))), 'A') ||
                    setweight(to_tsvector('portuguese', unaccent(coalesce(NEW.published_by,''))), 'B') ||
                    setweight(to_tsvector('english',   unaccent(coalesce(NEW.published_by,''))), 'B') ||
                    setweight(to_tsvector('portuguese', unaccent(coalesce(NEW.tags,''))), 'C') ||
                    setweight(to_tsvector('english',   unaccent(coalesce(NEW.tags,''))), 'C');
                
                NEW.search_text :=
                    lower(
                        unaccent(
                            coalesce(NEW.title,'') || ' ' ||
                            coalesce(NEW.published_by,'') || ' ' || 
                            coalesce(NEW.tags,'') || ' '
                        )
                    );
                RETURN NEW;
            END;
            \$\$ LANGUAGE plpgsql;
        ");

        DB::statement("
            CREATE TRIGGER files_search_vector_update
            BEFORE INSERT OR UPDATE ON files
            FOR EACH ROW EXECUTE FUNCTION files_search_vector_trigger();
        ");
    }
};
