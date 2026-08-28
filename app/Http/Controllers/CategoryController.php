<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CategoryController extends Controller
{
    public function index (Request $request)
    {
        $categories = Category::where('is_system' , true)
        ->orWhere('user_id' , $request->user()->id)
        ->get() ;

        return Inertia::render('categories' ,[ 'Categories' => $categories]) ;
    }

    public function store(Request $request)
    {
     $validated = $request->validate([
        'name'      => ['required', 'string', 'max:30'],
        'icon'      => ['nullable', 'string'],
        'color_hex' => ['nullable', 'string', 'hex_color'],
    ]);

     $request->user()->categories()->create($validated);

     return redirect()->back()->with([
        'success' => true,
        'message' => 'Category created successfully.',
    ]);
    }

    public function update(Request $request)
    {
     $validated = $request->validate([
        'name'      => ['nullable', 'string', 'max:30'],
        'icon'      => ['nullable', 'string'],
        'color_hex' => ['nullable', 'string', 'hex_color'],
    ]);

     $request->user()->categories()->create($validated);

     return redirect()->back()->with([
        'success' => true,
        'message' => 'Category update successfully.',
    ]);
    }

    public function destroy (Request $request ,  Category $category ) 
    {
            if( $request->user()->id  === $category->user_id )
                {
                    $account = $category->delete() ;
                    return redirect()->back()->with(['succes' => true , 'message' => 'Category deleted successfuly']) ;

                }
    }
}
