<?php 

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {        
        // Ajustes em users
        DB::statement("ALTER TABLE users ALTER COLUMN pubkey TYPE char(64)");
        // pubkey já é PK, mas vamos garantir índice único explícito também
        DB::statement("CREATE UNIQUE INDEX IF NOT EXISTS users_pubkey_idx ON users (pubkey)");

        // Alterar colunas para char(64)
        DB::statement("ALTER TABLE friends ALTER COLUMN user_pubkey TYPE char(64)");
        DB::statement("ALTER TABLE friends ALTER COLUMN friend_pubkey TYPE char(64)");

        // Índices e constraints
        DB::statement("CREATE UNIQUE INDEX IF NOT EXISTS friends_user_friend_idx ON friends (user_pubkey, friend_pubkey)");
        DB::statement("CREATE INDEX IF NOT EXISTS friends_friend_pubkey_idx ON friends (friend_pubkey)");
        DB::statement("CREATE INDEX IF NOT EXISTS friends_user_pubkey_idx ON friends (user_pubkey)");
   
        // notes
        DB::statement("ALTER TABLE notes ALTER COLUMN id TYPE char(64)");
        DB::statement("ALTER TABLE notes ALTER COLUMN pubkey TYPE char(64)");
        // garantir que id é PK única e pubkey indexado para busca rápida
        DB::statement("CREATE UNIQUE INDEX IF NOT EXISTS notes_id_idx ON notes (id)");
        DB::statement("CREATE INDEX IF NOT EXISTS notes_pubkey_published_idx ON notes (pubkey, published_at DESC)");

        Schema::table('files', function (Blueprint $table) {
            $table->char('pubkey', 64)->change();
            $table->char('note_id', 64)->change();
            $table->index('pubkey', 'files_pubkey_idx');
            $table->index('note_id', 'files_note_id_idx');
        });

        Schema::table('relays', function (Blueprint $table) {
            $table->char('pubkey', 64)->nullable()->change();
            $table->index('pubkey', 'relays_pubkey_idx');
        });
    }

    public function down(): void
    {
        // Reverter users
        DB::statement("DROP INDEX IF EXISTS users_pubkey_idx");
        DB::statement("ALTER TABLE users ALTER COLUMN pubkey TYPE varchar(64)");

        // friends
        DB::statement("DROP INDEX IF EXISTS friends_user_friend_idx");
        DB::statement("DROP INDEX IF EXISTS friends_friend_pubkey_idx");
        DB::statement("DROP INDEX IF EXISTS friends_user_pubkey_idx");
        DB::statement("ALTER TABLE friends ALTER COLUMN user_pubkey TYPE varchar(64)");
        DB::statement("ALTER TABLE friends ALTER COLUMN friend_pubkey TYPE varchar(64)");

        // notes 
        DB::statement("DROP INDEX IF EXISTS notes_id_idx");
        DB::statement("DROP INDEX IF EXISTS notes_pubkey_published_idx");
        DB::statement("ALTER TABLE notes ALTER COLUMN id TYPE varchar(64)");
        DB::statement("ALTER TABLE notes ALTER COLUMN pubkey TYPE varchar(64)");

        Schema::table('files', function (Blueprint $table) {
            $table->string('pubkey', 64)->change();
            $table->string('note_id', 64)->change();
            $table->dropIndex('files_pubkey_idx');
            $table->dropIndex('files_note_id_idx');
        });

        Schema::table('relays', function (Blueprint $table) {
            $table->string('pubkey', 64)->nullable()->change();
            $table->dropIndex('relays_pubkey_idx');
        });
    }
};
