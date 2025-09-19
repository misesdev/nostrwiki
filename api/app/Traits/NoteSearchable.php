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
        $bindings = [$term, $term];
        return $query->with(['author'])
            ->selectRaw("
                notes.id, notes.kind, notes.pubkey, notes.title, notes.content,
                notes.tags, notes.published_at, notes.created_at, notes.updated_at,
                (
                    greatest(
                        ts_rank(notes.search_vector, websearch_to_tsquery('portuguese', unaccent(?))),
                        ts_rank(notes.search_vector, websearch_to_tsquery('english', unaccent(?)))
                    ) * 0.7
                    +
                    ln(notes.ref_count + 1) * 0.3
                ) as relevance
            ", $bindings)
            ->where(function ($q) use ($term) {
                $q->orWhereRaw("notes.search_vector @@ websearch_to_tsquery('portuguese', unaccent(?))", [$term])
                    ->orWhereRaw("notes.search_vector @@ websearch_to_tsquery('english', unaccent(?))", [$term])
                    // Fallback para termos curtos ou parciais usando search_text
                    ->orWhereRaw("notes.search_text ILIKE unaccent(?)", ["%{$term}%"]);
            })
            ->orderByDesc('published_at')
            ->orderByDesc('relevance')
            ->orderByDesc('kind')
            ->skip($skip)
            ->take($take);
    }
}
