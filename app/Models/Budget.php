<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Budget extends Model
{
    use HasFactory, SoftDeletes;

    public const PERIODS = ['monthly', 'weekly', 'yearly'];
    public const LEVELS = ['none', 'warn', 'critical'];

    protected $fillable = [
        'user_id', 'category_id', 'name', 'amount', 'period',
        'rollover_enabled', 'warn_pct', 'critical_pct',
        'starts_at', 'ends_at', 'is_active', 'alerted_period', 'alerted_level',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'warn_pct' => 'decimal:2',
        'critical_pct' => 'decimal:2',
        'rollover_enabled' => 'boolean',
        'is_active' => 'boolean',
        'starts_at' => 'date',
        'ends_at' => 'date',
    ];

    protected static function booted(): void
    {
        static::creating(fn (Budget $b) => $b->uuid ??= (string) Str::uuid());
    }

    /* ★ العلاقات — كانت ناقصة */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function category()
    {
        // withTrashed: نعرض اسم التصنيف حتى لو حُذف soft
        return $this->belongsTo(Category::class)->withTrashed();
    }

    public function scopeActive(Builder $q): Builder
    {
        return $q->where('is_active', true);
    }

    public function scopeForUser(Builder $q, int $userId): Builder
    {
        return $q->where('user_id', $userId);
    }

    public function isOverall(): bool
    {
        return $this->category_id === null;
    }

public function spentQuery()
{
    return Transaction::query()
        ->where('user_id', $this->user_id)
        ->where('type', 'expense')
        ->when($this->category_id, fn ($q) => $q->where('category_id', $this->category_id));
}
}
