<?php

namespace App\Http\Controllers;

use App\Http\Request\SearchFriendsRequest;
use App\Http\Request\SearchRequest;
use Illuminate\Support\Facades\Validator;
use App\User;

class UserController extends Controller
{
    /**
     * @response User // 1 - PHPDoc
     */
    function index(string $pubkey)
    {
        $validate = Validator::make([ 'pubkey' => $pubkey ], [
            'pubkey' => ['required', 'size:64', 'regex:/^[a-fA-F0-9]+$/'],
        ]);

        if($validate->fails())
            return response()->json($validate->errors(), 403);

        $user = User::find($pubkey);

        if(empty($user))
            return response()->json(['message' => 'user not found'], 404);

        return response()->json($user, 200);
    }

    /**
     * @response User[] // 1 - PHPDoc
     */
    function friends(string $pubkey)
    {
        $validate = Validator::make([ 'pubkey' => $pubkey ], [
            'pubkey' => ['required', 'size:64', 'regex:/^[a-fA-F0-9]+$/'],
        ]);

        if($validate->fails())
            return response()->json($validate->errors(), 403);

        $user = User::find($pubkey);

        if(empty($user))
            return response()->json(['message' => 'user not found'], 404);

        $friends = $user->friends()->get();

        return response()->json($friends, 200);
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

        return $users;
    }

    /**
     * @response User[] // 1 - PHPDoc
     */
    function searchFriends(SearchFriendsRequest $request)
    {
        $term = $request->term;
        $pubkey = $request->pubkey;
        $skip = $request->input('skip', 0);
        $take = $request->input('take', 50);

        $user = User::find($pubkey);

        if(empty($user))
            return response()->json(['message' => 'user not found'], 404);

        $friends = $user->searchFriends($term, $skip, $take);

        return response()->json($friends, 200);
    }
}



