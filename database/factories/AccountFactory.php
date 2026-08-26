<?php

namespace Database\Factories;

use App\Models\Account;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;


/**
 * @extends Factory<Account>
 */
class AccountFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'uuid' => Str::uuid() ,
            'name' => fake()->randomElement(['Main Bank Account', 'Cash Wallet', 'Credit Card', 'Savings Account']),
            'type' => fake()->randomElement(['bank', 'cash', 'card', 'savings' , "other"]),
            'balance' => fake()->randomFloat(2, 500, 15000),
            'currency' => 'MAD',
            'color_hex' => fake()->hexColor(),
            'is_active' => true,
        ];
    }
}
