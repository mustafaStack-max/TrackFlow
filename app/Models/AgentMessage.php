<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class AgentMessage extends Model
{
    use HasFactory;


    public const ROLE_USER = 'user';
    public const ROLE_ASSISTANT = 'assistant';
    public const ROLE_TOOL = 'tool';

    protected $fillable = [
        'uuid',
        'conversation_id',
        'role',
        'content',
        'tool_calls',
        'tool_results',
        'metadata',
        'tokens_used',
    ];

    protected $casts = [
        'tool_calls' => 'array',
        'tool_results' => 'array',
        'metadata' => 'array',
        'tokens_used' => 'integer',
    ];

    protected static function booted(): void
    {
        static::creating(function (AgentMessage $message) {
            if (empty($message->uuid)) {
                $message->uuid = (string) Str::uuid();
            }
        });
    }


    public function conversation()
    {
        return $this->belongsTo(AgentConversation::class, 'conversation_id');
    }

    public function pendingActions()
    {
        return $this->hasMany(PendingAction::class, 'message_id');
    }


    public function isFromUser(): bool
    {
        return $this->role === self::ROLE_USER;
    }

    public function isFromAssistant(): bool
    {
        return $this->role === self::ROLE_ASSISTANT;
    }

    public function hasToolCalls(): bool
    {
        return ! empty($this->tool_calls);
    }


    public static function add(AgentConversation $conversation, string $role, string $content, array $extra = []): self
    {
        return $conversation->messages()->create(array_merge([
            'role' => $role,
            'content' => $content,
        ], $extra));
    }
}