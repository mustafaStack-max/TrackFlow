<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateTransactionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'category_id' => 'required|exists:categories,id',
            'account_id' => 'required|exists:accounts,id',
            'type' => 'required|in:expense,income',
            'description' => 'nullable|string|max:255',
            'amount' => 'required|numeric',
            'currency' => 'nullable|string|size:3',
            'transaction_date' => 'nullable|date',
            'payment_method' => 'required|in:cash,card,transfer,other',
        ];
    }
}
