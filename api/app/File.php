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

    protected $fillable = [
        'pubkey',
        'note_id',
        'url',
        'ref_count',
        'type',
        'tags'
    ];

    protected $casts = [
        'tags' => 'array',
    ];

    public function author()
    {
        // relacionamento lógico: tenta buscar user se existir
        return $this->belongsTo(User::class, 'pubkey', 'pubkey');
    }

    public function note()
    {
        return $this->belongsTo(Note::class, 'note_id', 'id');
    }
}
