<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('app_settings', function (Blueprint $table) {
            $table->string("initial_pubkey", 64);

            $table->integer("pubkey_index")->default(0);
            $table->integer("user_pubkey_index")->default(0);
            $table->integer("note_pubkey_index")->default(0);
            $table->integer("file_pubkey_index")->default(0);
            $table->integer("relay_pubkey_index")->default(0);

            $table->integer("pubkeys_per_process")->default(30000);
            $table->integer("max_fetch_notes")->default(800);
            $table->integer("pubkeys_per_notes")->default(25);

            $table->integer("relay_index")->default(0);
            $table->integer("pubkey_relay_index")->default(0);
            $table->integer("user_relay_index")->default(0);
            $table->integer("note_relay_index")->default(0);
            $table->integer("file_relay_index")->default(0);

            $table->integer("relays_connections")->default(80);
            $table->integer("max_fetch_events")->default(120);
            $table->integer("relays_betch_size")->default(15);
            $table->integer("indexer_interval")->default(5);

            $table->bigInteger("note_since")->nullable();
            $table->bigInteger("file_since")->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('app_settings');
    }
};
