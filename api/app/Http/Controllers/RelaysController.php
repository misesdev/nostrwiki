<?php

namespace App\Http\Controllers;

use App\Http\Request\UserPubkeyRequest;
use Illuminate\Support\Facades\Validator;
use App\Relay;

class RelaysController extends Controller
{
    /**
     * @response Relay|null // 1 - PHPDoc
     */
    function relay(string $url)
    {
        $validate = Validator::make([ 'url' => $url ], [
            'url' => 'required|string|regex:/^wss?:\/\/[^\s\/]+(?:\/[^\s\/]+)*$/i',
        ]);

        if($validate->fails())
            return response()->json($validate->errors(), 403);

        $relayUrl = strtolower($url);
        $relay = Relay::with('author')
            ->where('url', 'ILIKE', "%{$relayUrl}%")
            ->first();
        
        if(!$relay) {
            return response()->json([
                'message' => 'relay not found'
            ], 204);
        }

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


