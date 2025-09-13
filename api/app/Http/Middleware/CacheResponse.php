<?php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\Cache;

class CacheResponse
{
    public function handle($request, Closure $next)
    {
        // Gerar chave de cache baseada em método + URL + corpo da requisição
        $body = $request->isMethod('post') ? json_encode($request->all()) : '';
        $key = 'response|' . md5($request->method() . '|' . $request->fullUrl() . '|' . $body);

        // Retorna do cache se existir
        if (Cache::has($key)) {
            return response()->json(Cache::get($key));
        }

        $response = $next($request);

        // Armazena a resposta no cache (60 segundos por padrão)
        Cache::put($key, $response->getData(true), 300);

        return $response;
    }
}

