<?php

namespace App\Traits;

use Illuminate\Database\Eloquent\Builder;

trait NoteSearchable
{
    public function scopeSearch(
        Builder $query, string $term, int $skip, int $take
    ): Builder
    {
        $term = trim($term);

        return $query
            ->with(['author'])
            ->where(function ($q) use ($term) {
                $q->orWhereRaw("notes.search_vector @@ plainto_tsquery('portuguese', unaccent(?))", [$term])
                    ->orWhereRaw("notes.search_vector @@ plainto_tsquery('english', unaccent(?))", [$term])
                    // Fallback para termos curtos ou parciais usando search_vector::text
                    ->orWhereRaw("notes.search_vector::text ILIKE unaccent(?)", ["%{$term}%"]);

                // Busca em autor (full-text + ILIKE)
                // $q->orWhereHas('author', function ($q2) use ($term) {
                //     $q2->orWhereRaw("users.search_vector @@ plainto_tsquery('portuguese', unaccent(?))",[$term])
                //     ->orWhereRaw("users.search_vector @@ plainto_tsquery('english', unaccent(?))", [$term])
                //     ->orWhereRaw("(users.search_vector::text) ILIKE unaccent(?)", ["%{$term}%"]);
                // });
            })
            ->orderByDesc('notes.ref_count')
            ->skip($skip)
            ->take($take);
    }
}
