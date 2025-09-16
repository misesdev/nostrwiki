<?php

namespace App\Http\Request;

use Illuminate\Foundation\Http\FormRequest;

class RelayRequest extends FormRequest
{
    public function rules()
    {
        return [
            'url' => 'required|string|regex:/^wss?:\/\/[^\s\/]+(?:\/[^\s\/]+)*$/i',
        ];
    }

    protected function prepareForValidation()
    {
        if ($this->has('url')) {
            $url = trim($this->input('url'));

            // remove barra no final, se houver
            $url = rtrim($url, '/');

            $this->merge([
                'url' => $url,
            ]);
        }
    }

    public function messages()
    {
        return [
            'url.regex' => 'The URL must start with ws:// or wss://.',
        ];
    }
}
