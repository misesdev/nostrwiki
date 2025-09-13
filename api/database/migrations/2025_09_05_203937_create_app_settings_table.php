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
            $table->integer("pubkey_index");
            $table->integer("pubkeys_per_process");
            $table->integer("max_fetch_notes");
            $table->integer("pubkeys_per_notes");
            $table->integer("relay_index");
            $table->integer("relays_connections");
            $table->integer("max_fetch_events");
            $table->integer("relays_betch_size");
            $table->integer("indexer_interval");
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
