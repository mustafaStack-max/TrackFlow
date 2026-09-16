<?php

namespace App\Services\Agent;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

class SkillService
{
    protected string $basePath;

    public function __construct()
    {
        $this->basePath = resource_path('agent/skills');
    }

    public function all(): array
    {
        return config('agent.skills', []);
    }

    public function exists(string $name): bool
    {
        return array_key_exists($name, $this->all());
    }


    public function load(string $name): string
    {
        if (! $this->exists($name)) {
            return "المهارة «{$name}» غير موجودة. المهارات المتاحة: "
                . implode('، ', array_keys($this->all()));
        }

        $names = array_unique(array_merge(
            [$name],
            config("agent.skills.{$name}.always_with", [])
        ));

        $parts = [];
        foreach ($names as $skill) {
            $parts[] = "<skill name=\"{$skill}\">\n" . $this->read($skill) . "\n</skill>";
        }

        return implode("\n", $parts);
    }


    public function loadMany(array $names): string
    {
        $seen = [];
        $out = [];

        foreach ($names as $name) {
            foreach (array_merge([$name], config("agent.skills.{$name}.always_with", [])) as $n) {
                if (isset($seen[$n]) || ! $this->exists($n)) {
                    continue;
                }
                $seen[$n] = true;
                $out[] = "<skill name=\"{$n}\">\n" . $this->read($n) . "\n</skill>";
            }
        }

        return implode("\n", $out);
    }

    public function guess(string $userMessage, int $max = 2): array
    {
        $text = Str::lower($userMessage);
        $scored = [];

        foreach ($this->all() as $name => $skill) {
            $hits = 0;
            foreach ($skill['keywords'] ?? [] as $kw) {
                if (Str::contains($text, Str::lower($kw))) {
                    $hits++;
                }
            }
            if ($hits > 0) {
                $scored[$name] = $hits;
            }
        }

        arsort($scored);

        return array_slice(array_keys($scored), 0, $max);
    }

    public function index(): string
    {
        $lines = [];
        foreach ($this->all() as $name => $skill) {
            if ($name === 'guardrails') {
                continue;
            }
            $lines[] = "- `{$name}` → {$skill['description']}";
        }

        return implode("\n", $lines);
    }


    public function toolDeclaration(): array
    {
        $names = array_values(array_diff(array_keys($this->all()), ['guardrails']));

        return [
            'type' => 'function',
            'name' => 'load_skill',
            'description' => 'حمّل مهارة متخصصة قبل الإجابة على سؤال يدخل في مجالها. '
                . 'استدعها أولاً وبدون تردد — التكلفة زهيدة مقارنة بإجابة خاطئة.',
            'parameters' => [
                'type' => 'object',
                'properties' => [
                    'skill' => [
                        'type' => 'string',
                        'enum' => $names,
                        'description' => 'اسم المهارة المطلوبة.',
                    ],
                ],
                'required' => ['skill'],
            ],
        ];
    }


    protected function read(string $name): string
    {
        $file = config("agent.skills.{$name}.file");
        $path = $this->basePath . '/' . $file;

        $resolve = function () use ($path, $name) {
            if (! File::exists($path)) {
                return "⚠️ ملف المهارة «{$name}» مفقود على الخادم.";
            }

            return trim(File::get($path));
        };

        if (app()->environment('local')) {
            return $resolve();
        }

        return Cache::remember("agent.skill.{$name}", now()->addHours(6), $resolve);
    }
}