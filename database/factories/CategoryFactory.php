<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Category>
 */
class CategoryFactory extends Factory
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
            'name' => fake()->randomElement(['Salary', 'Groceries & Dining', 'Utilities & Bills', 'Healthcare', 'Transportation', 'Entertainment']),
            'icon' => fake()->randomElement(['wallet', 'shopping-cart', 'bolt', 'heart', 'car', 'film']),
            'color_hex' => fake()->hexColor(),
            'is_system' => false,
        ];
    }
}
