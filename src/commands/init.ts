import { Command } from "commander";

export function createInitCommand(): Command {
    return new Command('init')
        .description('Initialize the envoy configuration in the current project')
        .action(async () => { });
}