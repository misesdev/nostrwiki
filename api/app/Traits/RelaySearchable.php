<?php

namespace App\Traits;

use Illuminate\Database\Eloquent\Builder;

trait RelaySearchable
{
    public function scopeSearch(
        Builder $query, string $term, int $skip, int $take
    ): Builder {
        $term = trim($term);

        return $query->with('author')
            ->where('active', true)
            ->where(function ($q) use ($term) {
                // full-text search multilíngue (sempre português + inglês)
                $q->orWhereRaw("relays.search_vector @@ plainto_tsquery('portuguese', unaccent(?))",[$term])
                    ->orWhereRaw("relays.search_vector @@ plainto_tsquery('english', unaccent(?))",[$term])
                    // Fallback para termos curtos ou parciais usando search_vector::text
                    ->orWhereRaw("relays.search_vector::text ILIKE unaccent(?)",["%{$term}%"]);

                // $q->orWhereHas('author', function ($q2) use ($term) {
                //     $q2->orWhereRaw("users.search_vector @@ plainto_tsquery('portuguese', unaccent(?))",[$term])
                //         ->orWhereRaw("users.search_vector @@ plainto_tsquery('english', unaccent(?))",[$term])
                //         // fallback para termos curtos/parciais
                //         ->orWhereRaw("users.search_vector::text ILIKE unaccent(?)", ["%{$term}%"]);
                // });
            })
            ->orderByDesc('relays.ref_count')
            ->skip($skip)
            ->take($take);
    }
}
