#!/usr/bin/env node

import { Command } from 'commander';
import { createInitCommand } from './commands/init';

const program = new Command();

program
    .name('envoy-cli')
    .description('The envoy between your code and environment variable config - Never miss an environment variable again')
    .version('0.0.1');

program.addCommand(createInitCommand());

program.parse();