<?php

namespace App\Http\Controllers;

use App\Http\Request\SearchRequest;
use App\Note;

class NoteController extends Controller
{
    /**
     * @response Note[] // 1 - PHPDoc
     */
    function search(SearchRequest $request)
    {
        $term = $request->term;
        $skip = $request->input('skip', 0);
        $take = $request->input('take', 50);

        $notes = Note::search($term, $skip, $take)->get();

        return response()->json($notes, 200);
    }
}
