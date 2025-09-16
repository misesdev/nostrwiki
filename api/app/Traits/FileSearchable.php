<?php

namespace App\Traits;

use Illuminate\Database\Eloquent\Builder;

trait FileSearchable
{
    public function scopeSearch(
        Builder $query, string $term, ?string $type, int $skip, int $take
    ): Builder
    {
        $term = trim($term);
        $bindings = [$term, $term];
        return $query
            ->with(['author', 'note'])
            ->when($type, fn($q) => $q->where('type', $type))
            ->selectRaw("
                files.url, files.note_id, files.pubkey, files.title, 
                notes.description, files.type, files.tags, files.published_at, 
                files.created_at, files.updated_at,
                (
                    greatest(
                        ts_rank(files.search_vector, websearch_to_tsquery('portuguese', unaccent(?))),
                        ts_rank(files.search_vector, websearch_to_tsquery('english', unaccent(?)))
                    ) * 0.7
                    +
                    ln(files.ref_count + 1) * 0.3
                ) as relevance
            ", $bindings)
            ->where(function ($q) use ($term) {
                // full-text multilíngue
                $q->orWhereRaw("files.search_vector @@ websearch_to_tsquery('portuguese', unaccent(?))", [$term])
                    ->orWhereRaw("files.search_vector @@ websearch_to_tsquery('english', unaccent(?))", [$term])
                    // fallback ILIKE no search_vector
                    ->orWhereRaw("files.search_text ILIKE unaccent(?)", ["%{$term}%"]);
            })
            ->orderByDesc('relevance')
            ->skip($skip)
            ->take($take);
    }

    public function scopeSearchfile(
        Builder $query, string $term, int $skip, int $take
    ): Builder
    {
        return $query
            ->with(['author', 'note'])
            //->join('notes', 'files.note_id', '=', 'notes.id')
            ->selectRaw("
                files.url, files.note_id, files.pubkey, files.title, 
                notes.description, files.type, files.tags, files.published_at, 
                files.created_at, files.updated_at,
                (
                    greatest(
                        ts_rank(files.search_vector, websearch_to_tsquery('portuguese', unaccent(?))),
                        ts_rank(files.search_vector, websearch_to_tsquery('english', unaccent(?)))
                    ) * 0.7
                    +
                    ln(files.ref_count + 1) * 0.3
                ) as relevance
            ", [$term, $term])
            ->where(function ($q) use ($term) {
                // full-text multilíngue
                $q->orWhereRaw("files.search_vector @@ websearch_to_tsquery('portuguese', unaccent(?))", [$term])
                    ->orWhereRaw("files.search_vector @@ websearch_to_tsquery('english', unaccent(?))", [$term])
                    // fallback ILIKE no search_vector
                    ->orWhereRaw("files.search_text ILIKE unaccent(?)", ["%{$term}%"]);
            })
            ->orderByDesc('relevance')
            ->skip($skip)
            ->take($take);
    }
}
