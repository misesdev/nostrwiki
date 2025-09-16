<?php

use App\Http\Controllers\FileController;
use App\Http\Controllers\NoteController;
use Illuminate\Support\Facades\Route;

use \App\Http\Controllers\UserController;
use \App\Http\Controllers\RelaysController;

Route::middleware('cache.response')->group(function () {

    # Users
    Route::post('/users/search', [UserController::class, 'search']);
    
    Route::get('/users/profile/{pubkey}', [UserController::class, 'profile']);

    Route::get('/users/friends/{pubkey}', [UserController::class, 'friends']);
    
    Route::post('/users/friends/search', [UserController::class, 'search_friends']);

    Route::get('/users/notes/{pubkey}', [UserController::class, 'notes']);
    
    Route::post('/users/notes/search', [UserController::class, 'search_notes']);

    # Relays
    Route::get('/relays/relay', [RelaysController::class, 'relay']);
    
    Route::get('/relays/from/{pubkey}', [RelaysController::class, 'from']);
    
    Route::post('/relays/search', [RelaysController::class, 'search']);

    # Notes
    Route::get('/notes/{id}', [NoteController::class, 'note']);

    Route::post('/notes/search', [NoteController::class, 'search']);

    # Files
    Route::post('/images/search', [FileController::class, 'search_images']);

    Route::post('/videos/search', [FileController::class, 'search_videos']);

    Route::post('/files/search', [FileController::class, 'search_files']);

});

