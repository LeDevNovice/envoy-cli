import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { FileUtils } from '../../src/utils/file-utils';
import * as fs from 'fs';

vi.mock('fs');

describe('FileUtils', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('exists', () => {
        it('should return true when file exists', () => {
            vi.mocked(fs.existsSync).mockReturnValue(true);

            const result = FileUtils.exists('test.txt');

            expect(result).toBe(true);
            expect(fs.existsSync).toHaveBeenCalledWith('test.txt');
        });

        it('should return false when file does not exist', () => {
            vi.mocked(fs.existsSync).mockReturnValue(false);

            const result = FileUtils.exists('nonexistent.txt');

            expect(result).toBe(false);
            expect(fs.existsSync).toHaveBeenCalledWith('nonexistent.txt');
        });

        it('should handle different file paths', () => {
            const testCases = [
                'package.json',
                '.env.example',
                '.envoyrc.json',
                'src/index.ts',
                '/absolute/path/file.txt',
            ];

            vi.mocked(fs.existsSync).mockReturnValue(true);

            testCases.forEach(filePath => {
                FileUtils.exists(filePath);
                expect(fs.existsSync).toHaveBeenCalledWith(filePath);
            });

            expect(fs.existsSync).toHaveBeenCalledTimes(testCases.length);
        });
    });

    describe('write', () => {
        it('should write content to file with utf8 encoding', () => {
            const filePath = 'test.txt';
            const content = 'Hello, World!';

            FileUtils.write(filePath, content);

            expect(fs.writeFileSync).toHaveBeenCalledWith(filePath, content, 'utf8');
        });

        it('should write empty string to file', () => {
            const filePath = 'empty.txt';
            const content = '';

            FileUtils.write(filePath, content);

            expect(fs.writeFileSync).toHaveBeenCalledWith(filePath, content, 'utf8');
        });

        it('should write JSON content to file', () => {
            const filePath = 'config.json';
            const content = JSON.stringify({ key: 'value' }, null, 2);

            FileUtils.write(filePath, content);

            expect(fs.writeFileSync).toHaveBeenCalledWith(filePath, content, 'utf8');
        });

        it('should write multiline content to file', () => {
            const filePath = '.env.example';
            const content = `# Environment Variables
# Add your environment variables here`;

            FileUtils.write(filePath, content);

            expect(fs.writeFileSync).toHaveBeenCalledWith(filePath, content, 'utf8');
        });

        it('should handle different file paths', () => {
            const testCases = [
                { path: '.env.example', content: 'ENV=production' },
                { path: '.envoyrc.json', content: '{}' },
                { path: 'src/config.ts', content: 'export const config = {};' },
            ];

            testCases.forEach(({ path, content }) => {
                FileUtils.write(path, content);
                expect(fs.writeFileSync).toHaveBeenCalledWith(path, content, 'utf8');
            });

            expect(fs.writeFileSync).toHaveBeenCalledTimes(testCases.length);
        });
    });
});
