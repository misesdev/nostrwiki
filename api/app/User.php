<?php

namespace App;

use App\Traits\UserSearchable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class User extends Model
{
    use HasFactory;
    use UserSearchable;
    public $incrementing = false;
    protected $keyType = 'string';
    protected $primaryKey = 'pubkey';

    protected $hidden = ['search_vector'];

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

    public function pubkey(): BelongsTo
    {
        return $this->belongsTo(Pubkey::class, 'pubkey', 'pubkey');
    }

    public function searchFriends(string $term, int $skip, $take, string $lang)
    {
        return $this->friends()
            ->getQuery()
            ->search($term, $skip, $take, $lang)
            ->get();
    }

    /**
     * Friends of user (1 → N via pivot)
     */
    public function friends(): BelongsToMany
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
}
