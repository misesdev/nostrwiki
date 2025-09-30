<?php

namespace App;

use App\Traits\FileSearchable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class File extends Model
{
    use HasFactory;
    use FileSearchable;
    public $incrementing = false;
    protected $keyType = 'string';
    protected $primaryKey = 'url';
    
    protected $hidden = [
        'search_vector', 
        'search_text',
        'created_at',
        'update_at'
    ];

    protected $fillable = [
        'url',
        'pubkey',
        'note_id',
        'description',
        'published_at',
        'ref_count',
        'type',
        'tags'
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

    public function note()
    {
        return $this->belongsTo(Note::class, 'note_id', 'id');
    }
}
