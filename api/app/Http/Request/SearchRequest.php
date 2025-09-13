<?php

namespace App\Http\Request;

use Illuminate\Foundation\Http\FormRequest;

class SearchRequest extends FormRequest
{
    public function rules()
    {
        return [
            'term' => 'required|string|min:2',
            'skip' => 'nullable|integer|min:0',
            'take' => 'nullable|integer|min:1|max:75',
        ];
    }
}
