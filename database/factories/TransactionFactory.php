<?php

namespace Database\Factories;

use App\Models\Account;
use App\Models\Category;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;


/**
 * @extends Factory<Transaction>
 */
class TransactionFactory extends Factory
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
            'account_id' => Account::factory(),
            'category_id' => Category::factory(),
            'type' => fake()->randomElement(['income', 'expense']),
            'description' => fake()->sentence(3),
            'amount' => fake()->randomFloat(2, 10, 2000),
            'currency' => 'USD',
            'transaction_date' => fake()->dateTimeBetween('-1 month', 'now'),
            'notes' => fake()->optional()->sentence(),
            'receipt_url' => null,
            'location' => fake()->optional()->city(),
            'payment_method' => fake()->randomElement(['card', 'cash', 'transfer']),
            'tags' => fake()->optional()->words(2, true),
        ];
    }
}
