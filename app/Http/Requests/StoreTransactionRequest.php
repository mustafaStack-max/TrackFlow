<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTransactionRequest extends FormRequest
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
            'category_id'      => ['required', 'integer', 'exists:categories,id'],
            'account_id'       => ['required', 'integer', 'exists:accounts,id'],
            'type'             => ['required', 'string', Rule::in(['expense', 'income'])],
            'description'      => ['nullable', 'string', 'max:255'],
            'amount'           => ['required', 'numeric', 'gt:0'],
            'currency'         => ['nullable', 'string', 'size:3'],
            'transaction_date' => ['required', 'date'],
            'notes'            => ['nullable', 'string'],
            'receipt_url'      => ['nullable', 'url', 'max:255'],
            'location'         => ['nullable', 'string', 'max:255'],
            'payment_method'   => ['required', 'string', Rule::in(['cash', 'card', 'transfer', 'other'])],
            'tags'             => ['nullable', 'array'],
            'tags.*'           => ['string', 'max:50'],
    ];
    }
}
