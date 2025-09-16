<?php

namespace App\Http\Request;

use Illuminate\Foundation\Http\FormRequest;

class UserPubkeyRequest extends FormRequest
{
    public function rules()
    {
        return [
            'pubkey' => 'required|size:64|regex:/^[a-fA-F0-9]+$/',
        ];
    }
}
