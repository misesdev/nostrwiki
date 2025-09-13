<?php

namespace App\Http\Middleware;


class ApiDocsAuthenticate
{
    public function handle($request, \Closure $next)
    {
        if (app()->environment('local')) {
            return $next($request);
        }
        return $next($request);
    }
}
