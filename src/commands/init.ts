import { Command } from 'commander';

import { Logger } from '@utils/logger';
import { FileUtils } from '@utils/file-utils';
import { Syncer } from '@core/syncer';

const config = {
    exclude: ['dist/**', 'build/**', 'coverage/**'],
};

export function createInitCommand(): Command {
    return new Command('init')
        .description('Initialize the envoy configuration in the current project')
        .action(async () => {
            Logger.header('Initializing envoy-cli configuration...');

            if (!FileUtils.exists('package.json')) {
                Logger.error(
                    'No package.json found in the current directory. Please run this command in the root of your project.'
                );
                process.exit(1);
            }

            if (!FileUtils.exists('.env.example')) {
                Syncer.createExample();
            }

            if (!FileUtils.exists('.envoyrc.json')) {
                FileUtils.write('.envoyrc.json', JSON.stringify(config, null, 2));
                Logger.success('.envoyrc.json file created successfully.');
            }

            Logger.success('envoy-cli has been successfully initialized in your project !');
            Logger.info('Next steps:');
            Logger.list([
                'Run "envoy-cli check" to scan your project',
                'Run "envoy-cli sync --auto" to synchronize variables',
                'Add "envoy-cli check --ci" to your CI/CD pipeline',
            ]);
        });
}
