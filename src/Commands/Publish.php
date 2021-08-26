<?php

declare(strict_types=1);

namespace A17Toolkit\Commands;

use Illuminate\Console\Command;
use Illuminate\Filesystem\Filesystem;
use Illuminate\Support\Str;

final class Publish extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'a17-toolkit:publish
                            {components? : Comma separated list of components to publish. Leave blank to select from prompt}
                            {--view : Publish only the view of the component}
                            {--class : Publish only the class of the component}
                            {--force : Overwrite existing files}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Publish a component\'s view and class.';

    public function handle(Filesystem $filesystem): int
    {
        $allComponents = config('a17-toolkit.components');
        $components = $this->argument('components');

        if ($components) {
            $publishComponents = array_map('trim', explode(',', $components));

            foreach ($publishComponents as $key => $alias) {
                if (! $component = $allComponents[$alias] ?? null) {
                    $this->error("Cannot find the given [$alias] component. Skipping.");

                    unset($publishComponents[$key]);
                }
            }
        }else{
            $componentChoices = array_keys($allComponents);
            array_unshift($componentChoices, 'all');

            $publishComponents = $this->choice(
                'Which components would you like to publish? (comma separate to select multiple)',
                $componentChoices,
                0,
                null,
                true
            );

            if (in_array('all', $publishComponents)) {
                $publishComponents = array_keys($components);
            }
        }

        foreach ($publishComponents as $alias) {
            $component = $allComponents[$alias];

            $class = str_replace('A17Toolkit\\Components\\', '', Str::ucfirst($component));
            $view = str_replace(['_', '.-'], ['-', '/'], Str::snake(str_replace('\\', '.', $class)));

            if ($this->option('view') || ! $this->option('class')) {
                $originalView = __DIR__.'/../../resources/views/components/'.$view;
                $publishedViewDir = $this->laravel->resourcePath('views/vendor/a17-toolkit/components/'.$view);
                $publishedView = $publishedViewDir .'.blade.php';
                $path = Str::beforeLast($publishedView, '/');

                if (! $this->option('force') && $filesystem->exists($publishedView) && !$this->confirm("The view at [$publishedView] already exists. Do you wish to overwrite?", false)) {
                    $this->error("The view at [$publishedView] already exists.");
                }else{
                    $filesystem->ensureDirectoryExists($path);

                    $filesystem->copyDirectory($originalView, $publishedViewDir);

                    $this->info("Successfully published the [$component] view!");
                }
            }

            if ($this->option('class') || ! $this->option('view')) {
                $path = $this->laravel->basePath('app/View/Components');
                $destination = $path.'/'.str_replace('\\', '/', $class).'.php';

                if (! $this->option('force') && $filesystem->exists($destination) && !$this->confirm("The class at [$destination] already exists. Do you wish to overwrite?", false)) {
                    $this->error("The class at [$destination] already exists.");
                }else{
                    $filesystem->ensureDirectoryExists(Str::beforeLast($destination, '/'));

                    $stub = $filesystem->get(__DIR__.'/stubs/Component.stub');
                    $namespace = Str::beforeLast($class, '\\');
                    $name = Str::afterLast($class, '\\');
                    $alias = 'Original'.$name;

                    $stub = str_replace(
                        ['{{ namespace }}', '{{ name }}', '{{ parent }}', '{{ alias }}'],
                        [$namespace, $name, Str::ucfirst($component), $alias],
                        $stub,
                    );

                    $filesystem->put($destination, $stub);

                    $this->info("Successfully published the [$component] class!");

                    // Update config entry of component to new class.
                    if ($filesystem->missing($config = $this->laravel->configPath('a17-toolkit.php'))) {
                        $this->call('vendor:publish', ['--tag' => 'a17-toolkit-config']);
                    }

                    $originalConfig = $filesystem->get($config);
                    $fixedComponentClass = str_replace('A17Toolkit\\', '', $component);
                    $modifiedConfig = str_replace($fixedComponentClass, 'App\\View\\Components\\'.$class, $originalConfig);

                    $filesystem->put($config, $modifiedConfig);
                }
            }
        }

        return 0;
    }
}
