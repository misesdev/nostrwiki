<?php

namespace App\Http\Request;

use Illuminate\Foundation\Http\FormRequest;

class AutoCompleteRequest extends FormRequest
{
    public function rules()
    {
        return [
            'term' => 'required|string|min:2'
        ];
    }
}
