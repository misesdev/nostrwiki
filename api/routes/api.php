<?php

use App\Http\Controllers\NoteController;
use Illuminate\Support\Facades\Route;

use \App\Http\Controllers\UserController;
use \App\Http\Controllers\RelaysController;
use App\Http\Controllers\SearchController;

Route::get('/search/autocomplete', [SearchController::class, 'autocomplete']);

Route::middleware('cache.response')->group(function () {

    # Users
    Route::get('/search/users', [SearchController::class, 'search_users']);
    Route::get('/search/user/notes', [SearchController::class, 'search_user_notes']);
    Route::get('/search/user/follows', [SearchController::class, 'search_user_follows']);
    Route::get('/search/user/followers', [SearchController::class, 'search_user_followers']);
    Route::get('/users/profile/{pubkey}', [UserController::class, 'profile']);
    Route::get('/users/followers', [UserController::class, 'followers']);
    Route::get('/users/follows', [UserController::class, 'follows']);
    Route::get('/users/notes', [UserController::class, 'notes']);
    
    # Relays
    Route::get('/search/relays', [SearchController::class, 'search_relays']);
    Route::get('/relays/relay', [RelaysController::class, 'relay']);
    Route::get('/relays/from/{pubkey}', [RelaysController::class, 'from']);

    # Notes
    Route::get('/search/notes', [SearchController::class, 'search_notes']);
    Route::get('/notes/note/{id}', [NoteController::class, 'note']);

    # Files
    Route::get('/search/images', [SearchController::class, 'search_images']);
    Route::get('/search/videos', [SearchController::class, 'search_videos']);
    Route::get('/search/files', [SearchController::class, 'search_files']);

});

