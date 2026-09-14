<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class DataImportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'backup_file' => ['required', 'file', 'mimes:json,txt', 'max:10240'], 
        ];
    }

    public function messages(): array
    {
        return [
            'backup_file.required' => 'يجب اختيار ملف النسخة الاحتياطية.',
            'backup_file.file' => 'المدخل يجب أن يكون ملفاً.',
            'backup_file.mimes' => 'صيغة الملف يجب أن تكون JSON.',
            'backup_file.max' => 'حجم الملف يتجاوز 10 ميجابايت.',
        ];
    }
}