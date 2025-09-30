<?php

namespace App\Traits;

use Illuminate\Database\Eloquent\Builder;

trait RelaySearchable
{
    public function scopeSearch(
        Builder $query, string $term, int $skip, int $take
    ): Builder {
        $term = trim($term);
        $bindings = [$term, $term];
        return $query->with('author')
            ->selectRaw("
                relays.url, relays.name, relays.icon, relays.pubkey, relays.description, 
                relays.contact, relays.supported_nips, relays.software, relays.version, 
                relays.available, relays.ref_count,
                (
                    greatest(
                        ts_rank(relays.search_vector, websearch_to_tsquery('portuguese', unaccent(?))),
                        ts_rank(relays.search_vector, websearch_to_tsquery('english', unaccent(?)))
                    ) * 0.7
                    +
                    ln(relays.ref_count + 1) * 0.3
                ) as relevance
            ", $bindings)
            ->where(function ($q) use ($term) {
                // full-text search multilíngue (sempre português + inglês)
                $q->orWhereRaw("relays.search_vector @@ websearch_to_tsquery('portuguese', unaccent(?))",[$term])
                    ->orWhereRaw("relays.search_vector @@ websearch_to_tsquery('english', unaccent(?))",[$term])
                    // Fallback para termos curtos ou parciais usando search_vector::text
                    ->orWhereRaw("relays.search_text ILIKE unaccent(?)",["%{$term}%"]);
            })
            ->where('available', true)
            ->orderByDesc('relevance')
            ->skip($skip)
            ->take($take);
    }
}
