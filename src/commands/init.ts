import { Command } from "commander";
import { Logger } from "../utils/logger";

export function createInitCommand(): Command {
    return new Command('init')
        .description('Initialize the envoy configuration in the current project')
        .action(async () => {
            Logger.header('Initializing envoy-cli configuration...')

            Logger.success('envoy-cli has been successfully initialized in your project !');
            Logger.info('Next steps:');
            Logger.list([
                'First step',
                'Second step',
                'Third step'
            ])
        });
}