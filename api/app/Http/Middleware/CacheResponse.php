<?php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\Cache;

class CacheResponse
{
    public function handle($request, Closure $next)
    {
        // Generate cache key based in method + URL + body of request
        $body = $request->isMethod('post') ? json_encode($request->all()) : '';
        $key = 'response|' . md5($request->method() . '|' . $request->fullUrl() . '|' . $body);

        // return from cache if exists
        if (Cache::has($key)) {
            return response()->json(Cache::get($key));
        }

        $response = $next($request);

        // save in cache for 3 minutes
        Cache::put($key, $response->getData(true), 180);

        return $response;
    }
}

