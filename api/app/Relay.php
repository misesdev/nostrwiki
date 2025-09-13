<?php

namespace App;

use App\Traits\RelaySearchable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Relay extends Model
{
    use HasFactory;
    use RelaySearchable;

    protected $hidden = ['search_vector'];

    protected $fillable = [
        'id',
        'url',
        'name',
        'pubkey',
        'description',
        'contact',
        'supported_nips',
        'software',
        'version',
        'active',
        'ref_count',
        'icon'
    ];

    public function author()
    {
        return $this->belongsTo(User::class, 'pubkey', 'pubkey');
    }
}
