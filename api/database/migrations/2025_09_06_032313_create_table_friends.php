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
        Schema::create('friends', function (Blueprint $table) {
            $table->string('user_pubkey', 64)->primary();
            $table->string('friend_pubkey', 64)->index();
            
            $table->unique(['user_pubkey', 'friend_pubkey']);

            $table->foreign('user_pubkey')
                ->references('pubkey')
                ->on('users')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('friends');
    }
};
