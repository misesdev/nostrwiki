<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("DROP TRIGGER IF EXISTS notes_search_vector_update ON notes");
        DB::statement("DROP FUNCTION IF EXISTS notes_search_vector_trigger()");

        DB::statement("
            CREATE OR REPLACE FUNCTION notes_search_vector_trigger() RETURNS trigger AS $$
            BEGIN
                NEW.search_vector :=
                    setweight(to_tsvector('portuguese', unaccent(coalesce(NEW.published_by,''))), 'A') ||
                    setweight(to_tsvector('english', unaccent(coalesce(NEW.published_by,''))), 'A') ||
                    setweight(to_tsvector('portuguese', unaccent(coalesce(NEW.content,''))), 'B') ||
                    setweight(to_tsvector('english', unaccent(coalesce(NEW.content,''))), 'B') ||
                    setweight(to_tsvector('portuguese', unaccent(coalesce(NEW.tags,''))), 'C') ||
                    setweight(to_tsvector('english', unaccent(coalesce(NEW.tags,''))), 'C');
            
                NEW.search_text :=
                    lower(
                        unaccent(
                            coalesce(NEW.tags,'') || ' ' || 
                            coalesce(NEW.published_by,'') || ' '
                        )
                    );
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;
        ");

        DB::statement("
            CREATE TRIGGER notes_search_vector_update
            BEFORE INSERT OR UPDATE ON notes
            FOR EACH ROW EXECUTE FUNCTION notes_search_vector_trigger();
        ");

        Schema::table('notes', function (Blueprint $table) {
            $table->dropColumn('title');
        });
    }

    public function down(): void
    {
        Schema::table('notes', function (Blueprint $table) {
            $table->string('title', 255)->nullable();
        });

        DB::statement("DROP TRIGGER IF EXISTS notes_search_vector_update ON notes");
        DB::statement("DROP FUNCTION IF EXISTS notes_search_vector_trigger()");

        DB::statement("
            CREATE OR REPLACE FUNCTION notes_search_vector_trigger() RETURNS trigger AS $$
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
            $$ LANGUAGE plpgsql;
        ");

        DB::statement("
            CREATE TRIGGER notes_search_vector_update
            BEFORE INSERT OR UPDATE ON notes
            FOR EACH ROW EXECUTE FUNCTION notes_search_vector_trigger();
        ");
    }
};
