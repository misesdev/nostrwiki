<?php

namespace App\Http\Controllers;

use App\Http\Request\SearchRequest;
use App\Relay;

class RelaysController extends Controller
{
    /**
     * @response Relay[] // 1 - PHPDoc
     */
    function search(SearchRequest $request)
    {
        $term = $request->term;
        $skip = $request->input('skip', 0);
        $take = $request->input('take', 50);

        $relays = Relay::search($term, $skip, $take)->get();

        return response()->json($relays, 200);
    }
}


