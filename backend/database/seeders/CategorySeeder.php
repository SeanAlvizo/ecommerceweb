<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $categories = [
            [
                'slug' => 'living-room',
                'name' => 'Living Room',
                'description' => 'Premium sofas, coffee tables, and TV stands for your perfect living space.',
                'image' => 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=800'
            ],
            [
                'slug' => 'bedroom',
                'name' => 'Bedroom',
                'description' => 'Comfortable beds, mattresses, and nightstands for a restful sleep.',
                'image' => 'https://images.unsplash.com/photo-1505693314120-0d443867891c?auto=format&fit=crop&q=80&w=800'
            ],
            [
                'slug' => 'dining-room',
                'name' => 'Dining Room',
                'description' => 'Elegant dining tables, chairs, and cabinets for family gatherings.',
                'image' => 'https://images.unsplash.com/photo-1617806118233-18e1c0945594?auto=format&fit=crop&q=80&w=800'
            ],
            [
                'slug' => 'office',
                'name' => 'Workspace & Office',
                'description' => 'Ergonomic chairs and spacious desks for maximum productivity.',
                'image' => 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&q=80&w=800'
            ],
            [
                'slug' => 'outdoor',
                'name' => 'Outdoor',
                'description' => 'Durable patio furniture and decor for outdoor relaxation.',
                'image' => 'https://images.unsplash.com/photo-1595514535316-2ce9d5f0ebf1?auto=format&fit=crop&q=80&w=800'
            ]
        ];

        foreach ($categories as $cat) {
            Category::updateOrCreate(
                ['slug' => $cat['slug']],
                $cat
            );
        }
    }
}
