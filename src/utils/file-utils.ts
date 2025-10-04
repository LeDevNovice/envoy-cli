import * as path from 'path';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

export class FileUtilsError extends Error {
    constructor(
        message: string,
        public readonly filePath?: string,
        public readonly originalError?: Error
    ) {
        super(message);
        this.name = 'FileUtilsError';
    }
}

export class FileUtils {
    static exists(filePath: string): boolean {
        try {
            return existsSync(filePath);
        } catch {
            return false;
        }
    }

    static async findFiles(
        pattern: string,
        options: { ignore?: string[] } = {}
    ): Promise<string[]> {
        try {
            return await glob(pattern, {
                ignore: options.ignore || ['node_modules/**', 'dist/**', 'build/**', '.git/**'],
                nodir: true,
            });
        } catch (error) {
            throw new FileUtilsError(
                `Failed to find files with pattern "${pattern}"`,
                pattern,
                error as Error
            );
        }
    }

    static getProjectRoot(): string {
        try {
            let currentDir = process.cwd();

            while (currentDir !== path.parse(currentDir).root) {
                if (this.exists(path.join(currentDir, 'package.json'))) {
                    return currentDir;
                }
                currentDir = path.dirname(currentDir);
            }

            return process.cwd();
        } catch (error) {
            throw new FileUtilsError('Failed to determine project root', undefined, error as Error);
        }
    }

    static parseEnvFile(filePath: string): Map<string, string> {
        const envVars = new Map<string, string>();

        if (!this.exists(filePath)) {
            return envVars;
        }

        try {
            const lines = this.readLines(filePath);

            for (const line of lines) {
                const trimmed = line.trim();

                if (!trimmed || trimmed.startsWith('#')) {
                    continue;
                }

                const match = trimmed.match(/^([A-Z_][A-Z0-9_]*)\s*=\s*(.*)$/i);
                if (match) {
                    const [, key, value] = match;
                    envVars.set(key, value);
                }
            }

            return envVars;
        } catch (error) {
            throw new FileUtilsError(`Failed to parse env file`, filePath, error as Error);
        }
    }

    static read(filePath: string): string {
        if (!this.exists(filePath)) {
            throw new FileUtilsError(`File does not exist`, filePath);
        }

        try {
            return readFileSync(filePath, 'utf-8');
        } catch (error) {
            throw new FileUtilsError(`Failed to read file`, filePath, error as Error);
        }
    }

    static readLines(filePath: string): string[] {
        return this.read(filePath).split('\n');
    }

    static write(filePath: string, content: string): void {
        try {
            writeFileSync(filePath, content, 'utf8');
        } catch (error) {
            throw new FileUtilsError(`Failed to write file`, filePath, error as Error);
        }
    }
}
