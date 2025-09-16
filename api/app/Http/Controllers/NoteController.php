<?php

namespace App\Http\Controllers;

use App\Http\Request\NoteRequest;
use App\Http\Request\SearchRequest;
use App\Note;

class NoteController extends Controller
{
    /**
     * @response Note // 1 - PHPDoc
     */
    function note(NoteRequest $request)
    {
        $note = Note::find($request->id);

        if(!$note) return response()->json(['message' => 'user not found'], 404);

        return response()->json($note);
    }

    /**
     * @response Note[] // 1 - PHPDoc
     */
    function search(SearchRequest $request)
    {
        $term = $request->term;
        $skip = $request->input('skip', 0);
        $take = $request->input('take', 50);

        $notes = Note::search($term, $skip, $take)->get();

        return response()->json($notes);
    }
}
