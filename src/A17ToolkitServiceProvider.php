<?php

declare(strict_types=1);

namespace A17Toolkit;

use A17Toolkit\Components\BladeComponent;
use A17Toolkit\Commands\Publish;
use Illuminate\Support\Facades\Blade;
use Illuminate\Support\ServiceProvider;
use Illuminate\View\Compilers\BladeCompiler;

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
        $this->bootDirectives();
        $this->bootPublishing();
        $this->bootTranslations();
        $this->bootCommands();
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

    public function bootTranslations()
    {
        $this->loadTranslationsFrom(__DIR__.'/../resources/lang', 'a17-toolkit');
    }

    private function bootCommands(): void
    {
        if ($this->app->runningInConsole()) {
            $this->commands([
                Publish::class,
            ]);
        }
    }

    private function bootBladeComponents(): void
    {
        $this->callAfterResolving(BladeCompiler::class, function (BladeCompiler $blade) {
            $prefix = config('a17-toolkit.prefix', '');

            /** @var BladeComponent $component */
            foreach (config('a17-toolkit.components', []) as $alias => $component) {
                $blade->component($component, $alias, $prefix);
            }
        });
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
            // config
            $this->publishes([
                __DIR__.'/../config/a17-toolkit.php' => config_path('a17-toolkit.php'),
            ], 'a17-toolkit-config');

            // assets
            $this->publishes([
                    __DIR__.'/../public' => public_path('a17-toolkit')
                ], 'a17-toolkit-assets'
            );

            // translations
            $this->publishes([
                __DIR__.'/../resources/lang' => resource_path('lang/vendor/a17-toolkit'),
            ], 'a17-toolkit-translations');
        }
    }
}
