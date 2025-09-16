<?php

namespace App;

use App\Traits\RelaySearchable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Relay extends Model
{
    use HasFactory;
    use RelaySearchable;

    protected $hidden = ['search_vector', 'search_text'];

    protected $fillable = [
        'id',
        'url',
        'icon',
        'name',
        'pubkey',
        'description',
        'contact',
        'supported_nips',
        'software',
        'version',
        'available',
        'ref_count'
    ];

    public function author()
    {
        return $this->belongsTo(User::class, 'pubkey', 'pubkey');
    }
}
