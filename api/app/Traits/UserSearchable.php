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
        $bindings = [$term, $term];
        return $query
            ->selectRaw("
                users.pubkey, users.name, users.display_name, users.picture, 
                users.about, users.banner, users.website, users.nip05, users.lud06, 
                users.lud16, users.zap_service, users.ref_count, users.created_at, users.updated_at,
                (
                    GREATEST(
                        ts_rank(users.search_vector, websearch_to_tsquery('portuguese', unaccent(?))),
                        ts_rank(users.search_vector, websearch_to_tsquery('english', unaccent(?)))
                    ) * 0.7
                    +
                    ln(users.ref_count + 1) * 0.3
                ) AS relevance
            ", $bindings)
            ->where(function ($q) use ($term) {
                // full-text search multilíngue
                $q->orWhereRaw("users.search_vector @@ websearch_to_tsquery('portuguese', unaccent(?))", [$term])
                    ->orWhereRaw("users.search_vector @@ websearch_to_tsquery('english', unaccent(?))", [$term])
                    // fallback para ILIKE (curto ou substring)
                    ->orWhereRaw("users.search_text ILIKE unaccent(?)",["%{$term}%"]);
            })
            ->where('available', true)
            ->orderByDesc('relevance')
            ->skip($skip)
            ->take($take);
    }
}
