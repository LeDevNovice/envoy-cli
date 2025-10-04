import * as path from 'path';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

export class FileUtils {
    static exists(filePath: string): boolean {
        return existsSync(filePath);
    }

    static async findFiles(pattern: string, options: { ignore?: string[] } = {}): Promise<string[]> {
        return glob(pattern, {
            ignore: options.ignore || ['node_modules/**', 'dist/**', 'build/**', '.git/**'],
            nodir: true
        });
    }

    static getProjectRoot(): string {
        let currentDir = process.cwd();

        while (currentDir !== path.parse(currentDir).root) {
            if (this.exists(path.join(currentDir, 'package.json'))) {
                return currentDir;
            }
            currentDir = path.dirname(currentDir);
        }

        return process.cwd();
    }

    static parseEnvFile(filePath: string): Map<string, string> {
        const envVars = new Map<string, string>();

        if (!this.exists(filePath)) {
            return envVars;
        }

        const lines = this.readLines(filePath);

        for (const line of lines) {
            const trimmed = line.trim();

            if (!trimmed || trimmed.startsWith('#')) {
                continue;
            }

            const match = trimmed.match(/^([A-Z_][A-Z0-9_]*)\s*=/i);
            if (match) {
                envVars.set(match[1], trimmed);
            }
        }

        return envVars;
    }

    static read(filePath: string): string {
        return readFileSync(filePath, 'utf-8');
    }

    static readLines(filePath: string): string[] {
        return this.read(filePath).split('\n');
    }

    static write(filePath: string, content: string): void {
        writeFileSync(filePath, content, 'utf8');
    }
}