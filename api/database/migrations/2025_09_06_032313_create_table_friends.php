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
            $table->string('user_pubkey', 64);
            $table->string('friend_pubkey', 64);
            
            $table->unique(['user_pubkey', 'friend_pubkey']);

            $table->index('friend_pubkey');

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
