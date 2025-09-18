<?php

namespace App\Http\Controllers;

use App\Http\Request\RelayRequest;
use App\Http\Request\UserPubkeyRequest;
use App\Relay;

class RelaysController extends Controller
{
    /**
     * @response Relay|null // 1 - PHPDoc
     */
    function relay(RelayRequest $request)
    {
        $url = strtolower($request->url);

        $relay = Relay::with('author')
            ->where('url', 'ILIKE', "%{$url}%")
            ->first();

        return response()->json($relay);
    }

    /**
     * @response Relay[] // 1 - PHPDoc
     */
    function from(UserPubkeyRequest $request)
    {
        $relays = Relay::where('pubkey', $request->pubkey)->get();

        return response()->json($relays);
    }
}


