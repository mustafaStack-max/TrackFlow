<?php

namespace App\Http\Controllers;

use App\Http\Requests\DataImportRequest;
use App\Services\DataExportService;
use App\Services\DataImportService;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log ;

class DataBackupController extends Controller
{
    public function __construct(
        protected DataExportService $exportService,
        protected DataImportService $importService
    ) {}
    public function export(Request $request)
    {
        $user = $request->user();
        $payload = $this->exportService->buildExportPayload($user);

        $jsonContent = json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);
        $filename = 'backup_' . $user->uuid . '_' . now()->format('Y-m-d_H-i-s') . '.json';

        return response($jsonContent, 200, [
            'Content-Type' => 'application/json',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ]);
    }
    public function import(DataImportRequest $request)
    {
        $user = $request->user();
        $file = $request->file('backup_file');

        try {

            $content = file_get_contents($file->getRealPath());
            $payload = json_decode($content, true, 512, JSON_THROW_ON_ERROR);

            if (!isset($payload['profile']) || !isset($payload['accounts'])) {
                throw new Exception('ملف النسخة الاحتياطية غير صالح أو تالف.');
            }

            $this->importService->import($user, $payload);

            return redirect()->back()->with([
                'success' => true,
                'message' => 'تم استيراد البيانات بنجاح!',
            ]);

        } catch (Exception $e) {
            Log::error('Data Import Failed: ' . $e->getMessage());
            return redirect()->back()->with([
                'success' => false,
                'message' => 'فشل استيراد البيانات: ' . $e->getMessage(),
            ]);
        }
    }
}