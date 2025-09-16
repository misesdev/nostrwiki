<?php

namespace App\Http\Controllers;

use App\Http\Request\SearchRequest;
use App\Http\Request\UserPubkeyRequest;
use App\Http\Request\UserSearchRequest;
use App\User;

class UserController extends Controller
{
    /**
     * @response User // 1 - PHPDoc
     */
    function profile(UserPubkeyRequest $request)
    {
        $user = User::find($request->pubkey);

        if(!$user) return response()->json(['message' => 'user not found'], 404);

        return response()->json($user, 200);
    }

    /**
     * @response User[] // 1 - PHPDoc
     */
    function friends(UserPubkeyRequest $request)
    {
        $user = User::find($request->pubkey);

        if(!$user) return response()->json(['message' => 'user not found'], 404);

        $friends = $user->friends()->get();

        return response()->json($friends, 200);
    }

    /**
     * @response Note[] // 1 - PHPDoc
     */
    function notes(UserPubkeyRequest $request)
    {       
        $user = User::find($request->pubkey);

        if(!$user) return response()->json(['message' => 'user not found'], 404);

        $notes = $user->notes()->get();

        return response()->json($notes, 200);
    }

    /**
     * @response User[] // 1 - PHPDoc
     */
    function search(SearchRequest $request)
    {
        $term = $request->term;
        $skip = $request->input('skip', 0);
        $take = $request->input('take', 50);

        $users = User::search($term, $skip, $take)->get();

        return response()->json($users, 200);
    }

    /**
     * @response User[] // 1 - PHPDoc
     */
    function search_friends(UserSearchRequest $request)
    {
        $term = $request->term;
        $pubkey = $request->pubkey;
        $skip = $request->input('skip', 0);
        $take = $request->input('take', 50);

        $user = User::find($pubkey);

        if(!$user) return response()->json(['message' => 'user not found'], 404);

        $friends = $user->searchFriends($term, $skip, $take)->get();

        return response()->json($friends, 200);
    }

    /**
     * @response Note[] // 1 - PHPDoc
     */
    function search_notes(UserSearchRequest $request)
    {
        $term = $request->term;
        $pubkey = $request->pubkey;
        $skip = $request->input('skip', 0);
        $take = $request->input('take', 75);

        $user = User::find($pubkey);

        if(!$user) return response()->json(['message' => 'user not found'], 404);

        $notes = $user->searchNotes($term, $skip, $take)->get();

        return response()->json($notes, 200);
    }
}



