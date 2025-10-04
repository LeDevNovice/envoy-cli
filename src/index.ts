#!/usr/bin/env node

import { Command } from 'commander';

import { createInitCommand } from '@commands/init';
import { createCheckCommand } from '@commands/check';
import { createSyncCommand } from '@commands/sync';

const program = new Command();

program
    .name('envoy-cli')
    .description(
        'The envoy between your code and environment variable config - Never miss an environment variable again'
    )
    .version('1.0.1');

program.addCommand(createInitCommand());
program.addCommand(createCheckCommand());
program.addCommand(createSyncCommand());

program.parse();
