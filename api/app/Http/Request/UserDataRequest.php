<?php

namespace App\Http\Request;

use Illuminate\Foundation\Http\FormRequest;

class UserDataRequest extends FormRequest
{
    public function rules()
    {
        return [
            'pubkey' => 'required|size:64|regex:/^[a-fA-F0-9]+$/',
            'skip' => 'nullable|integer|min:0',
            'take' => 'nullable|integer|min:1|max:50'
        ];
    }
}
