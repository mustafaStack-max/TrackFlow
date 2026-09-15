<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Str;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'username',
        'uuid' ,
        'email',
        "avatar_url" ,
        'password',
       'avatar_url',
       'role' ,
       'currency',

    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'role',   

    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (User $user) {
            if (empty($user->uuid)) {
                $user->uuid = (string) Str::uuid();
            }
        });
    }

    public function accounts () 
    {
        return $this->hasMany(Account::class) ;
    }


    public function transactions()
    {
        return $this->hasMany(Transaction::class) ;
    }

    public function categories ()
    {
        return $this->hasMany(Category::class) ;
    }
    public function budgets()
    {
        return $this->hasMany(Budget::class);
    }



    public function conversations(): HasMany
    {
        return $this->hasMany(AgentConversation::class)
            ->orderByDesc('updated_at');
    }

 
    public function activeConversations(): HasMany
    {
        return $this->conversations()->where('is_active', true);
    }

  
    public function pendingActions(): HasMany
    {
        return $this->hasMany(PendingAction::class)
            ->where('status', PendingAction::STATUS_PENDING)
            ->where('expires_at', '>', now())
            ->orderByDesc('created_at');
    }


    public function latestConversation(): ?AgentConversation
    {
        return $this->activeConversations()->first();
    }

 
    public function hasPendingActions(): bool
    {
        return $this->pendingActions()->exists();
    }


    public function pendingActionsCount(): int
    {
        return $this->pendingActions()->count();
    }

}

