<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Account extends Model
{
      use HasFactory, SoftDeletes;

    protected $fillable = [
        'uuid' ,
        "user_id" ,
        "name" ,
        "type" ,
        "balance" ,
        "currency" ,
        "color_hex" ,
        "is_active"
    ];

        protected $hidden = [
        'is_active',
    ];
    protected $casts = [
    'balance' => 'decimal:2',
    'is_active' => 'boolean',
];

    protected static function booted(): void
    {
        static::creating(function (Account $account) {
            if (empty($account->uuid)) {
                $account->uuid = (string) Str::uuid();
            }
        });
    }

    public function user ()
    {
        return $this->belongsTo(User::class) ;
    }

    public function transactions ()
    {
        return $this->hasMany(Transaction::class) ;
    }
}
