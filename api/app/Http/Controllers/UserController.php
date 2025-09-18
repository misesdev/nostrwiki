<?php

namespace App\Http\Controllers;

use App\Http\Request\UserPubkeyRequest;
use App\Note;
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
}



