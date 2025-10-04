import { FileUtils } from '@utils/file-utils';
import { Logger } from '@utils/logger';
import { EnvVariable, VariableLocation, ScanOptions } from '../types';

export class Scanner {
    /**
     * Regex patterns to detect environment variables in different formats
     * - process.env.VAR_NAME
     * - process.env['VAR_NAME'] or process.env["VAR_NAME"]
     * - import.meta.env.VAR_NAME (Vite)
     * - Deno.env.get('VAR_NAME')
     * - $env:VAR_NAME (PowerShell)
     */
    private static readonly PATTERN_SOURCES = [
        /process\.env\.([A-Z_][A-Z0-9_]*)/gi,
        /process\.env\[['"]([A-Z_][A-Z0-9_]*)['"]]/gi,
        /import\.meta\.env\.([A-Z_][A-Z0-9_]*)/gi,
        /Deno\.env\.get\(['"]([A-Z_][A-Z0-9_]*)['"]]/gi,
        /\$env:([A-Z_][A-Z0-9_]*)/gi,
    ] as const;

    static async scanProject(options: ScanOptions = {}): Promise<Map<string, EnvVariable>> {
        const envVars = new Map<string, EnvVariable>();
        const projectRoot = FileUtils.getProjectRoot();

        const files = await FileUtils.findFiles('**/*.{ts,tsx,js,jsx,mjs,cjs}', {
            ignore: [
                'node_modules/**',
                'dist/**',
                'build/**',
                '.git/**',
                'coverage/**',
                ...(options.exclude || []),
            ],
        });

        for (const file of files) {
            try {
                const content = FileUtils.read(file);
                const lines = content.split('\n');

                for (const patternSource of this.PATTERN_SOURCES) {
                    const pattern = new RegExp(patternSource.source, patternSource.flags);
                    let match: RegExpExecArray | null;

                    while ((match = pattern.exec(content)) !== null) {
                        const varName = match[1];
                        const lineNumber = content.substring(0, match.index).split('\n').length;
                        const line = lines[lineNumber - 1];

                        const location: VariableLocation = {
                            file: file.replace(projectRoot + '/', ''),
                            line: lineNumber,
                            column: match.index - content.lastIndexOf('\n', match.index),
                            code: line.trim(),
                        };

                        if (envVars.has(varName)) {
                            envVars.get(varName)!.locations.push(location);
                        } else {
                            envVars.set(varName, {
                                name: varName,
                                locations: [location],
                                inExample: false,
                                inEnv: false,
                            });
                        }
                    }
                }
            } catch (error) {
                Logger.warning(`Failed to read ${file}: ${(error as Error).message}`);
                continue;
            }
        }

        return envVars;
    }

    static getEnvExampleVars(): Set<string> {
        const examplePath = '.env.example';
        const vars = new Set<string>();

        if (!FileUtils.exists(examplePath)) {
            return vars;
        }

        const envMap = FileUtils.parseEnvFile(examplePath);
        envMap.forEach((_, key) => vars.add(key));

        return vars;
    }

    static getEnvVars(): Set<string> {
        const envPath = '.env';
        const vars = new Set<string>();

        if (!FileUtils.exists(envPath)) {
            return vars;
        }

        const envMap = FileUtils.parseEnvFile(envPath);
        envMap.forEach((_, key) => vars.add(key));

        return vars;
    }
}
