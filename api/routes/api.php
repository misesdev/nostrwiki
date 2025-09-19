<?php

use App\Http\Controllers\NoteController;
use Illuminate\Support\Facades\Route;

use \App\Http\Controllers\UserController;
use \App\Http\Controllers\RelaysController;
use App\Http\Controllers\SearchController;

Route::get('/search/autocomplete', [SearchController::class, 'autocomplete']);

Route::middleware('cache.response')->group(function () {

    # Users
    Route::post('/search/users', [SearchController::class, 'search_users']);
    
    Route::post('/search/user/notes', [SearchController::class, 'search_user_notes']);
   
    Route::post('/search/user/friends', [SearchController::class, 'search_user_friends']);
    
    Route::get('/users/profile/{pubkey}', [UserController::class, 'profile']);

    Route::get('/users/friends', [UserController::class, 'friends']);
    
    Route::post('/users/notes', [UserController::class, 'notes']);
    
    # Relays
    Route::post('/search/relays', [SearchController::class, 'search_relays']);
    
    Route::get('/relays/relay', [RelaysController::class, 'relay']);
    
    Route::get('/relays/from/{pubkey}', [RelaysController::class, 'from']);

    # Notes
    Route::post('/search/notes', [SearchController::class, 'search_notes']);
    
    Route::get('/notes/note/{id}', [NoteController::class, 'note']);

    # Files
    Route::post('/search/images', [SearchController::class, 'search_images']);

    Route::post('/search/videos', [SearchController::class, 'search_videos']);

    Route::post('/search/files', [SearchController::class, 'search_files']);

});

