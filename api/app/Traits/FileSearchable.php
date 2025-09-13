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

        return $query
            ->with(['author', 'note'])
            ->when($type, fn($q) => $q->where('type', $type))
            ->join('notes', 'files.note_id', '=', 'notes.id')
            ->select('files.*', 'notes.ref_count')
            ->selectRaw(
                "ts_rank(files.search_vector, plainto_tsquery('simple', unaccent(?))) AS fulltext_rank",
                [$term]
            )
            ->where(function ($q) use ($term) {
                // full-text multilíngue
                $q->orWhereRaw("files.search_vector @@ plainto_tsquery('portuguese', unaccent(?))", [$term])
                    ->orWhereRaw("files.search_vector @@ plainto_tsquery('english', unaccent(?))", [$term])
                    // fallback ILIKE no search_vector
                    ->orWhereRaw("files.search_vector::text ILIKE unaccent(?)", ["%{$term}%"]);
            })
            ->orderByDesc('fulltext_rank')
            ->orderByDesc('notes.ref_count')
            ->skip($skip)
            ->take($take);
    }

    public function scopeSearchfile(
        Builder $query, string $term, int $skip, int $take
    ): Builder
    {
        return $query
            ->with(['author', 'note'])
            ->join('notes', 'files.note_id', '=', 'notes.id')
            ->select('files.*', 'notes.ref_count')
            ->selectRaw(
                "ts_rank(files.search_vector, plainto_tsquery('simple', unaccent(?))) AS fulltext_rank",
                [$term]
            )
            ->where(function ($q) use ($term) {
                // full-text multilíngue
                $q->orWhereRaw("files.search_vector @@ plainto_tsquery('portuguese', unaccent(?))", [$term])
                    ->orWhereRaw("files.search_vector @@ plainto_tsquery('english', unaccent(?))", [$term])
                    // fallback ILIKE no search_vector
                    ->orWhereRaw("files.search_vector::text ILIKE unaccent(?)", ["%{$term}%"]);
            })
            ->orderByDesc('fulltext_rank')
            ->orderByDesc('notes.ref_count')
            ->skip($skip)
            ->take($take);
    }
}
