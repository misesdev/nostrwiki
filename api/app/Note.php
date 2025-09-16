<?php

namespace App;

use App\Traits\NoteSearchable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Note extends Model
{
    use HasFactory;
    use NoteSearchable;
    public $incrementing = false;
    protected $keyType = 'string';
    protected $primaryKey = 'id';

    protected $hidden = ['search_vector', 'search_text'];

    protected $fillable = [
        'id',
        'kind',
        'pubkey',
        'title',
        'content',
        'published_at',
        'tags',
        'created_at',
        'ref_count'
    ];

    // Accessor para sempre retornar array
    public function getTagsAttribute(?string $value): array
    {
        if (!$value) return [];
        // separar por espaço
        return preg_split('/\s+/', $value, -1, PREG_SPLIT_NO_EMPTY);
    }

    // Opcional: mutator para salvar array como string
    public function setTagsAttribute(array $value): void
    {
        $this->attributes['tags'] = implode(' ', $value);
    }

    public function author()
    {
        return $this->belongsTo(User::class, 'pubkey', 'pubkey');
    }

    public function files()
    {
        return $this->hasMany(File::class, 'note_id', 'id');
    }
}
