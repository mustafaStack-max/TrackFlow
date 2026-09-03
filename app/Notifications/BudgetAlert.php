<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class BudgetAlert extends Notification
{
    use Queueable;

    public function __construct(
        protected string $name,
        protected array $item,
        protected string $level,
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        $pct = $this->item['pct'];

        $message = $this->level === 'critical'
            ? "تجاوز: تجاوزت ميزانية «{$this->name}» — صرفت {$this->item['spent']} من {$this->item['effective']} MAD ({$pct}%)."
            : "تنبيه: وصلت إلى {$pct}% من ميزانية «{$this->name}» لهذا الشهر.";

        return [
            'message' => $message,
            'level' => $this->level,
        ];
    }
}