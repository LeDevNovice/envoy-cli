import { Command } from 'commander';

import { Logger } from '@utils/logger';
import { Analyzer } from '@core/analyzer';
import { Syncer } from '@core/syncer';

export function createSyncCommand(): Command {
    return new Command('sync')
        .description(
            'Synchronize .env.example with actual environment variables used in the codebase'
        )
        .option('--auto', 'Automatically add missing variables to .env.example')
        .option('--remove', 'Automatically remove unused variables from .env.example')
        .option('--comments', 'Add comments to newly added variables in .env.example')
        .action(async options => {
            Logger.header('Starting synchronization process...\n');

            const result = await Analyzer.analyze();

            if (result.missing.length === 0 && result.unused.length === 0) {
                Logger.success('No discrepancies found. .env.example is up to date.');
                return;
            }

            if (!options.auto && !options.remove) {
                Logger.warning(
                    'No action specified. Use --auto to add missing variables or --remove to remove unused ones.'
                );
                return;
            }

            Syncer.sync(result.missing, result.unused, {
                auto: options.auto,
                remove: options.remove,
                addComments: options.comments,
            });

            Logger.success('\n✨ Synchronization complete!\n');
        });
}
