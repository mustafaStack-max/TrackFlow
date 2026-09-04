<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
use App\Events\TransactionChanged;
use Illuminate\Database\Eloquent\SoftDeletes;

class Transaction extends Model
{
      use HasFactory, SoftDeletes;

    protected $fillable = [
        'uuid',
        "user_id" ,
        "category_id" ,
        "account_id" ,
        'type',
        "description", 
        "amount" ,
        "currency" ,
        "transaction_date" ,
        "notes" ,
        "receipt_url" ,
        "location",
        "payment_method" ,
        "tags"

    ];


    protected $casts = [
    'transaction_date' => 'datetime',
    'amount' => 'decimal:2',
    'tags' => 'array',
];

        protected static function booted(): void
    {
        static::creating(function (Transaction $t) {
            if (empty($t->uuid)) {
                $t->uuid = (string) Str::uuid();
            }
        });
        $fire = fn (Transaction $t) => event(new TransactionChanged($t));

        static::created($fire);
        static::updated($fire);
        static::deleted($fire);
    }

    public function user ()
    {
        return $this->belongsTo(User::class) ;
    }
    public function account ()
    {
        return $this->belongsTo(Account::class) ;
    }
    public function category ()
    {
        return $this->belongsTo(Category::class) ;
    }
}
