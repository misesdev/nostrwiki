<?php

namespace App\Http\Controllers;

use App\Http\Request\UserDataRequest;
use Illuminate\Support\Facades\Validator;
use App\Note;
use App\User;

class UserController extends Controller
{
    /**
     * @response User // 1 - PHPDoc
     */
    function profile(string $pubkey)
    {
        $validate = Validator::make([ 'pubkey' => $pubkey ], [
            'pubkey' => ['required', 'size:64', 'regex:/^[a-fA-F0-9]+$/'],
        ]);

        if($validate->fails())
            return response()->json($validate->errors(), 403);

        $user = User::find($pubkey);

        if(!$user) return response()->json(['message' => 'user not found'], 404);

        return response()->json($user, 200);
    }

    /**
     * @response User[] // 1 - PHPDoc
     */
    function friends(UserDataRequest $request)
    {
        $user = User::find($request->pubkey);

        if(!$user) return response()->json(['message' => 'user not found'], 404);

        $friends = $user->friends()->get();

        return response()->json($friends, 200);
    }

    /**
     * @response Note[] // 1 - PHPDoc
     */
    function notes(UserDataRequest $request)
    {      
        $skip = $request->skip; 
        $take = $request->take; 
        $user = User::find($request->pubkey);

        if(!$user) return response()->json(['message' => 'user not found'], 404);

        $notes = $user->notes()
            ->with('author')
            ->orderByDesc('published_at')
            ->skip($skip)->take($take)->get();

        return response()->json($notes, 200);
    }
}



