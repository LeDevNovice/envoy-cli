import { Command } from 'commander';
import chalk from 'chalk';

import { Logger } from '@utils/logger';
import { Analyzer } from '@core/analyzer';

export function createCheckCommand(): Command {
    return new Command('check')
        .description('Check for missing or unused environment variables')
        .option('--ci', 'Exit with code 1 if issues are found (for CI/CD pipelines)')
        .action(async options => {
            Logger.header('Envoy - Check Environment Variables\n');

            const result = await Analyzer.analyze();

            console.log(chalk.bold(`\nFound ${result.total} environment variables in code\n`));

            if (result.missing.length > 0) {
                Logger.error(`MISSING in .env.example (${result.missing.length}):`);

                for (const varInfo of result.missing) {
                    console.log(chalk.red(`  ✗ ${varInfo.name}`));
                    const firstLocation = varInfo.locations[0];
                    Logger.dim(`    → First used in ${firstLocation.file}:${firstLocation.line}`);

                    if (varInfo.locations.length > 1) {
                        Logger.dim(
                            `    → Also used in ${varInfo.locations.length - 1} other locations`
                        );
                    }
                }
                console.log();
            }

            if (result.unused.length > 0) {
                Logger.warning(`UNUSED in .env.example (${result.unused.length}):`);

                for (const varName of result.unused) {
                    console.log(chalk.yellow(`  ⚠ ${varName}`));
                    Logger.dim(`    → Not found in codebase`);
                }
                console.log();
            }

            if (result.synced.length > 0) {
                Logger.success(`SYNCED (${result.synced.length}):`);

                for (const varInfo of result.synced) {
                    console.log(chalk.green(`  ✓ ${varInfo.name}`));
                    if (varInfo.locations.length > 1) {
                        Logger.dim(`    → Used in ${varInfo.locations.length} locations`);
                    }
                }
                console.log();
            }

            if (result.missing.length > 0 || result.unused.length > 0) {
                Logger.info('💡 Run "envoy-cli sync --auto" to fix automatically\n');

                if (options.ci) {
                    process.exit(1);
                }
            } else {
                Logger.success('All environment variables are properly synced !\n');
            }
        });
}
