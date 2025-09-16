<?php

namespace App\Http\Request;

use Illuminate\Foundation\Http\FormRequest;

class NoteRequest extends FormRequest
{
    public function rules()
    {
        return [
            'id' => 'required|size:64|regex:/^[a-fA-F0-9]+$/',
        ];
    }
}
