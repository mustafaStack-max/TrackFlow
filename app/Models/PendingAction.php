<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class PendingAction extends Model
{
    use HasFactory;


    public const TYPE_CREATE_TRANSACTION = 'create_transaction';
    public const TYPE_CREATE_CATEGORY = 'create_category';
    public const TYPE_CREATE_BUDGET = 'create_budget';
    public const TYPE_UPDATE_TRANSACTION = 'update_transaction';
    public const TYPE_UPDATE_BUDGET = 'update_budget';


    public const STATUS_PENDING = 'pending';
    public const STATUS_APPROVED = 'approved';
    public const STATUS_REJECTED = 'rejected';
    public const STATUS_EXPIRED = 'expired';

    protected $fillable = [
        'token',
        'user_id',
        'message_id',
        'action_type',
        'payload',
        'impact_analysis',
        'status',
        'expires_at',
        'executed_at',
    ];

    protected $casts = [
        'payload' => 'array',
        'impact_analysis' => 'array',
        'expires_at' => 'datetime',
        'executed_at' => 'datetime',
    ];

    protected static function booted(): void
    {
        static::creating(function (PendingAction $action) {
            if (empty($action->token)) {
                $action->token = (string) Str::uuid();
            }
   
            if (empty($action->expires_at)) {
                $action->expires_at = now()->addMinutes(30);
            }
        });
    }

    /* ★ العلاقات */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function message()
    {
        return $this->belongsTo(AgentMessage::class, 'message_id');
    }

    /* ★ Scopes */
    public function scopePending(Builder $q): Builder
    {
        return $q->where('status', self::STATUS_PENDING)
            ->where('expires_at', '>', now());
    }

    public function scopeForUser(Builder $q, int $userId): Builder
    {
        return $q->where('user_id', $userId);
    }

    public function isPending(): bool
    {
        return $this->status === self::STATUS_PENDING
            && $this->expires_at->isFuture();
    }

    public function isExpired(): bool
    {
        return $this->expires_at->isPast();
    }
    public function approve(): void
    {
        $this->update(['status' => self::STATUS_APPROVED]);
    }

    public function reject(): void
    {
        $this->update(['status' => self::STATUS_REJECTED]);
    }

    public function markExecuted(): void
    {
        $this->update(['executed_at' => now()]);
    }
}