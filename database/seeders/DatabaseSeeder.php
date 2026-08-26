<?php

namespace Database\Seeders;


use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Account;
use App\Models\Category;
use App\Models\Transaction;
use App\Models\User;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        $user = User::factory()->create([

            'username' => 'Mustafa',
            'email' => 'mustafa.Email@example.com',

        ]);

        $accounts = Account::factory(3)->create(['user_id' => $user->id]);
        $categories = Category::factory(5)->create(['user_id' => $user->id]);


    Transaction::factory(20)->create([
        'user_id' => $user->id,
        'account_id' => fn() => $accounts->random()->id,
        'category_id' => fn() => $categories->random()->id,
    ]);
    }
}
