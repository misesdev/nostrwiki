<?php

namespace App\Http\Controllers;

use App\Note;
use App\User;
use Illuminate\Support\Facades\Validator;

class NoteController extends Controller
{
    /**
     * @response Note // 1 - PHPDoc
     */
    function note(string $id)
    {
        $validate = Validator::make([ 'id' => $id ], [
            'id' => ['required', 'size:64', 'regex:/^[a-fA-F0-9]+$/'],
        ]);

        if($validate->fails())
            return response()->json($validate->errors(), 403);

        $note = Note::with('author')->find($id);

        if(!$note) {
            return response()->json([
                'message' => 'no note found'
            ], 204);
        }

        return response()->json($note);
    }
}
