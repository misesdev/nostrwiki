<?php

namespace App\Http\Controllers;

use App\Http\Request\NoteRequest;
use App\Note;
use App\User;

class NoteController extends Controller
{
    /**
     * @response Note // 1 - PHPDoc
     */
    function note(NoteRequest $request)
    {
        $note = Note::with('author')->find($request->id);

        if(!$note) return response()->json(['message' => 'note not found'], 404);

        return response()->json($note);
    }
}
