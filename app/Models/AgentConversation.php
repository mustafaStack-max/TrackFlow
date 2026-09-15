<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class AgentConversation extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'uuid',
        'user_id',
        'title',
        'gemini_interaction_id',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    protected static function booted(): void
    {
        static::creating(function (AgentConversation $conversation) {
            if (empty($conversation->uuid)) {
                $conversation->uuid = (string) Str::uuid();
            }
        });
    }

    /* ★ العلاقات */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function messages()
    {
        return $this->hasMany(AgentMessage::class, 'conversation_id');
    }


    public function lastMessage()
    {
        return $this->hasOne(AgentMessage::class, 'conversation_id')->latestOfMany();
    }

    /* ★ Scopes */
    public function scopeActive(Builder $q): Builder
    {
        return $q->where('is_active', true);
    }

    public function scopeForUser(Builder $q, int $userId): Builder
    {
        return $q->where('user_id', $userId);
    }

    public function hasPendingActions(): bool
    {
        return PendingAction::where('user_id', $this->user_id)
            ->where('status', 'pending')
            ->where('expires_at', '>', now())
            ->whereHas('message', fn ($q) => $q->where('conversation_id', $this->id))
            ->exists();
    }

    /* ★ إغلاق المحادثة */
    public function close(): void
    {
        $this->update(['is_active' => false]);
    }
}