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
}
