<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class BudgetFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'category_id' => Category::factory(),
            'name' => null,
            'amount' => $this->faker->randomFloat(2, 500, 8000),
            'period' => 'monthly',
            'rollover_enabled' => $this->faker->boolean(30),
            'warn_pct' => 80,
            'critical_pct' => 100,
            'starts_at' => null,
            'ends_at' => null,
            'is_active' => true,
            'alerted_period' => null,
            'alerted_level' => 'none',
        ];
    }

    public function overall(): static
    {
        return $this->state(fn () => ['category_id' => null, 'name' => 'الميزانية الشاملة']);
    }

    public function inactive(): static
    {
        return $this->state(fn () => ['is_active' => false]);
    }
}