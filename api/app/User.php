<?php

namespace App;

use App\Traits\UserSearchable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class User extends Model
{
    use HasFactory;
    use UserSearchable;
    public $incrementing = false;
    protected $keyType = 'string';
    protected $primaryKey = 'pubkey';

    protected $hidden = ['search_vector', 'search_text', 'available'];

    protected $fillable = [
        'name',
        'pubkey',
        'display_name',
        'picture',
        'about',
        'banner',
        'website',
        'nip05',
        'lud06',
        'lud16',
        'zap_service',
    ];

    public function notes()
    {
        return $this->hasMany(Note::class, 'pubkey', 'pubkey');
    }

    public function searchNotes(string $term, int $skip, int $take)
    {
        return $this->notes()             
                    ->search($term, $skip, $take)  
                    ->get();
    }

    public function follows(): BelongsToMany
    {
        return $this->belongsToMany(
            User::class,
            'friends',
            'user_pubkey',
            'friend_pubkey',
            'pubkey',
            'pubkey'
        )->join('users as u', 'friends.friend_pubkey', '=', 'u.pubkey')
            ->select('u.*');
    }

    public function followers(): BelongsToMany
    {
        return $this->belongsToMany(
            User::class,
            'friends',
            'friend_pubkey', 
            'user_pubkey',   
            'pubkey',
            'pubkey'
        );
    }

    public function searchFollows(string $term, int $skip, $take, string $lang)
    {
        return $this->follows()
            ->getQuery()
            ->search($term, $skip, $take, $lang)
            ->get();
    }

    public function searchFolowers(string $term, int $skip, $take, string $lang)
    {
        return $this->followers()
            ->getQuery()
            ->search($term, $skip, $take, $lang)
            ->get();
    }
}
