<?php

namespace App\Traits;

use Illuminate\Database\Eloquent\Builder;

trait UserSearchable
{
    /**
     * Executa uma busca full-text multilíngue (portuguese + english)
     * com fallback para ILIKE quando o termo é curto ou parcial.
     */
    public function scopeSearch(
        Builder $query, string $term, int $skip, int $take
    ): Builder {
        $term = trim($term);

        return $query
            ->select('users.*')
            ->addSelect('pubkeys.ref_count')
            ->join('pubkeys', 'users.pubkey', '=', 'pubkeys.pubkey')
            ->where(function ($q) use ($term) {
                // full-text search multilíngue
                $q->orWhereRaw("users.search_vector @@ plainto_tsquery('portuguese', unaccent(?))", [$term])
                    ->orWhereRaw("users.search_vector @@ plainto_tsquery('english', unaccent(?))", [$term])
                    // fallback para ILIKE (curto ou substring)
                    ->orWhereRaw("users.search_vector::text ILIKE unaccent(?)",["%{$term}%"]);
            })
            ->orderByDesc('pubkeys.ref_count')
            ->skip($skip)
            ->take($take);
    }
}
