<?php

declare(strict_types=1);

namespace A17Toolkit;

use A17Toolkit\Components\BladeComponent;
use Illuminate\Support\Facades\Blade;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;
use Illuminate\View\Compilers\BladeCompiler;
use Illuminate\Support\Facades\Route;

final class A17ToolkitServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->mergeConfigFrom(__DIR__.'/../config/a17-toolkit.php', 'a17-toolkit');
    }

    public function boot(): void
    {
        $this->bootResources();
        $this->bootBladeComponents();
        $this->bootRoutes();
        // $this->bootDirectives();
        // $this->bootPublishing();
        $this->publishes([
            __DIR__.'/../public' => public_path('a17-toolkit'),
        ], 'public');

    }

    private function bootResources(): void
    {
        $this->loadViewsFrom(__DIR__.'/../resources/views', 'a17-toolkit');
    }

    private function bootRoutes(): void
    {
        $this->loadRoutesFrom(__DIR__.'/../routes/web.php');
    }

    private function bootBladeComponents(): void
    {
        $this->callAfterResolving(BladeCompiler::class, function (BladeCompiler $blade) {
            $prefix = config('a17-toolkit.prefix', '');
            $assets = config('a17-toolkit.assets', []);

            /** @var BladeComponent $component */
            foreach (config('a17-toolkit.components', []) as $alias => $component) {
                $blade->component($component, $alias, $prefix);

                $this->registerAssets($component, $assets);
            }
        });
    }

    private function registerAssets($component, array $assets): void
    {
        foreach ($component::assets() as $asset) {
            $files = (array) ($assets[$asset] ?? []);

            collect($files)->filter(function (string $file) {
                return Str::endsWith($file, '.css');
            })->each(function (string $style) {
                A17Toolkit::addStyle($style);
            });

            collect($files)->filter(function (string $file) {
                return Str::endsWith($file, '.js');
            })->each(function (string $script) {
                A17Toolkit::addScript($script);
            });
        }
    }

    private function bootDirectives(): void
    {
        Blade::directive('A17ToolkitStyles', function (string $expression) {
            return "<?php echo A17Toolkit\\A17Toolkit::outputStyles($expression); ?>";
        });

        Blade::directive('A17ToolkitScripts', function (string $expression) {
            return "<?php echo A17Toolkit\\A17Toolkit::outputScripts($expression); ?>";
        });
    }

    private function bootPublishing(): void
    {
        if ($this->app->runningInConsole()) {
            $this->publishes([
                __DIR__.'/../config/a17-toolkit.php' => $this->app->configPath('a17-toolkit.php'),
            ], 'a17-toolkit-config');

            $this->publishes([
                __DIR__.'/../resources/views' => $this->app->resourcePath('views/vendor/a17-toolkit'),
            ], 'a17-toolkit-views');
        }
    }
}
