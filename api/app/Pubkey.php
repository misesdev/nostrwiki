<?php

namespace App;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pubkey extends Model
{
    use HasFactory;
    public $incrementing = false;
    protected $keyType = 'string';
    protected $primaryKey = 'pubkey';

    protected $fillable = [
        'pubkey',
        'ref_count',
    ];

    public function user()
    {
        return $this->hasOne(User::class, 'pubkey', 'pubkey');
    }
}
