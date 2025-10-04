import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import chalk from 'chalk';

import { Logger } from '../../src/utils/logger';

describe('Logger', () => {
    let consoleLogSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
        consoleLogSpy.mockRestore();
    });

    describe('error', () => {
        it('should log error message with [✗] prefix', () => {
            Logger.error('This is an error');

            expect(consoleLogSpy).toHaveBeenCalledWith(chalk.blue('[✗]', 'This is an error'));
        });

        it('should handle empty error message', () => {
            Logger.error('');

            expect(consoleLogSpy).toHaveBeenCalledWith(chalk.blue('[✗]', ''));
        });
    });

    describe('header', () => {
        it('should log header message with newlines', () => {
            Logger.header('Header Message');

            expect(consoleLogSpy).toHaveBeenCalledWith(
                chalk.bold.cyan('[✗]', '\nHeader Message\n')
            );
        });

        it('should format header with proper spacing', () => {
            Logger.header('Test Header');

            expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('\n'));
        });
    });

    describe('info', () => {
        it('should log info message with [i] prefix', () => {
            Logger.info('This is an info message');

            expect(consoleLogSpy).toHaveBeenCalledWith(
                chalk.blue('[i]', 'This is an info message')
            );
        });

        it('should handle multiline info message', () => {
            Logger.info('Line 1\nLine 2');

            expect(consoleLogSpy).toHaveBeenCalledWith(chalk.blue('[i]', 'Line 1\nLine 2'));
        });
    });

    describe('success', () => {
        it('should log success message with [✓] prefix', () => {
            Logger.success('Operation successful');

            expect(consoleLogSpy).toHaveBeenCalledWith(chalk.blue('[✓]', 'Operation successful'));
        });

        it('should handle long success message', () => {
            const longMessage = 'A'.repeat(200);
            Logger.success(longMessage);

            expect(consoleLogSpy).toHaveBeenCalledWith(chalk.blue('[✓]', longMessage));
        });
    });

    describe('warning', () => {
        it('should log warning message with [!] prefix', () => {
            Logger.warning('This is a warning');

            expect(consoleLogSpy).toHaveBeenCalledWith(chalk.yellow('[!]'), 'This is a warning');
        });

        it('should use yellow color for warning', () => {
            Logger.warning('Warning message');

            expect(consoleLogSpy).toHaveBeenCalledWith(expect.anything(), 'Warning message');
        });
    });

    describe('list', () => {
        it('should log list items with default prefix', () => {
            const items = ['Item 1', 'Item 2', 'Item 3'];

            Logger.list(items);

            expect(consoleLogSpy).toHaveBeenCalledTimes(3);
            expect(consoleLogSpy).toHaveBeenNthCalledWith(1, '  • Item 1');
            expect(consoleLogSpy).toHaveBeenNthCalledWith(2, '  • Item 2');
            expect(consoleLogSpy).toHaveBeenNthCalledWith(3, '  • Item 3');
        });

        it('should log list items with custom prefix', () => {
            const items = ['Step 1', 'Step 2'];
            const customPrefix = '→';

            Logger.list(items, customPrefix);

            expect(consoleLogSpy).toHaveBeenCalledTimes(2);
            expect(consoleLogSpy).toHaveBeenNthCalledWith(1, '→ Step 1');
            expect(consoleLogSpy).toHaveBeenNthCalledWith(2, '→ Step 2');
        });

        it('should handle empty list', () => {
            Logger.list([]);

            expect(consoleLogSpy).not.toHaveBeenCalled();
        });

        it('should handle single item list', () => {
            Logger.list(['Only item']);

            expect(consoleLogSpy).toHaveBeenCalledTimes(1);
            expect(consoleLogSpy).toHaveBeenCalledWith('  • Only item');
        });

        it('should handle list with empty strings', () => {
            const items = ['', 'Item', ''];

            Logger.list(items);

            expect(consoleLogSpy).toHaveBeenCalledTimes(3);
            expect(consoleLogSpy).toHaveBeenNthCalledWith(1, '  • ');
            expect(consoleLogSpy).toHaveBeenNthCalledWith(2, '  • Item');
            expect(consoleLogSpy).toHaveBeenNthCalledWith(3, '  • ');
        });
    });
});
