<?php

use App\Http\Controllers\FileController;
use App\Http\Controllers\NoteController;
use Illuminate\Support\Facades\Route;

use \App\Http\Controllers\UserController;
use \App\Http\Controllers\RelaysController;

Route::middleware('cache.response')->group(function () {

    Route::get('/users/{pubkey}', [UserController::class, 'index']);

    Route::get('/users/friends/{pubkey}', [UserController::class, 'friends']);

    Route::post('/users/search', [UserController::class, 'search']);

    Route::post('/users/friends/search', [UserController::class, 'searchFriends']);

    Route::post('/relays/search', [RelaysController::class, 'search']);

    Route::post('/notes/search', [NoteController::class, 'search']);

    Route::post('/images/search', [FileController::class, 'search_images']);

    Route::post('/videos/search', [FileController::class, 'search_videos']);

    Route::post('/files/search', [FileController::class, 'search_files']);

});

