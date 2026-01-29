<?php

use App\Http\Controllers\NoteController;
use Illuminate\Support\Facades\Route;

use \App\Http\Controllers\UserController;
use \App\Http\Controllers\RelaysController;
use App\Http\Controllers\SearchController;

Route::get('/search/autocomplete', [SearchController::class, 'autocomplete']);

Route::middleware('cache.response')->group(function () {

    # Search
    Route::get('/search/users', [SearchController::class, 'search_users']);
    Route::get('/search/relays', [SearchController::class, 'search_relays']);
    Route::get('/search/notes', [SearchController::class, 'search_notes']);
    Route::get('/search/articles', [SearchController::class, 'search_articles']);
    Route::get('/search/images', [SearchController::class, 'search_images']);
    Route::get('/search/videos', [SearchController::class, 'search_videos']);
    Route::get('/search/files', [SearchController::class, 'search_files']);
    
    # Users
    Route::get('/user/notes/search', [SearchController::class, 'search_user_notes']);
    Route::get('/user/follows/search', [SearchController::class, 'search_user_follows']);
    Route::get('/user/followers/search', [SearchController::class, 'search_user_followers']);
    Route::get('/user/followers', [UserController::class, 'followers']);
    Route::get('/user/follows', [UserController::class, 'follows']);
    Route::get('/user/notes', [UserController::class, 'notes']);
    Route::get('/user/{pubkey}', [UserController::class, 'profile']);
    
    # Relays
    Route::get('/relays/from/{pubkey}', [RelaysController::class, 'from']);
    Route::get('/relay/{url}', [RelaysController::class, 'relay']);

    # Notes
    Route::get('/note/{id}', [NoteController::class, 'note']);

});

