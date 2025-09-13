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

    protected $hidden = ['search_vector'];

    protected $fillable = [
        'id',
        'kind',
        'pubkey',
        'title',
        'content',
        'tags',
        'created_at',
        'ref_count'
    ];

    protected $casts = [
        'tags' => 'array', // tags como json
    ];

    public function author()
    {
        return $this->belongsTo(User::class, 'pubkey', 'pubkey');
    }
}
