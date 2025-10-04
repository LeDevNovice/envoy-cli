import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Analyzer } from '../../src/core/analyzer';
import { Scanner } from '../../src/core/scanner';
import { EnvVariable } from '../../src/types';

vi.mock('../../src/core/scanner');

describe('Analyzer', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('analyze', () => {
        it('should identify missing variables', async () => {
            const codeVars = new Map<string, EnvVariable>([
                [
                    'API_KEY',
                    {
                        name: 'API_KEY',
                        locations: [
                            {
                                file: 'src/config.ts',
                                line: 1,
                                column: 0,
                                code: 'process.env.API_KEY',
                            },
                        ],
                        inExample: false,
                        inEnv: false,
                    },
                ],
                [
                    'DATABASE_URL',
                    {
                        name: 'DATABASE_URL',
                        locations: [
                            {
                                file: 'src/db.ts',
                                line: 5,
                                column: 10,
                                code: 'process.env.DATABASE_URL',
                            },
                        ],
                        inExample: false,
                        inEnv: false,
                    },
                ],
            ]);

            const exampleVars = new Set<string>(); // Vide
            const envVars = new Set<string>();

            vi.mocked(Scanner.scanProject).mockResolvedValue(codeVars);
            vi.mocked(Scanner.getEnvExampleVars).mockReturnValue(exampleVars);
            vi.mocked(Scanner.getEnvVars).mockReturnValue(envVars);

            const result = await Analyzer.analyze();

            expect(result.missing).toHaveLength(2);
            expect(result.missing.map(v => v.name)).toContain('API_KEY');
            expect(result.missing.map(v => v.name)).toContain('DATABASE_URL');
            expect(result.synced).toHaveLength(0);
            expect(result.unused).toHaveLength(0);
        });

        it('should identify unused variables', async () => {
            const codeVars = new Map<string, EnvVariable>();
            const exampleVars = new Set(['OLD_VAR', 'DEPRECATED_KEY']);
            const envVars = new Set<string>();

            vi.mocked(Scanner.scanProject).mockResolvedValue(codeVars);
            vi.mocked(Scanner.getEnvExampleVars).mockReturnValue(exampleVars);
            vi.mocked(Scanner.getEnvVars).mockReturnValue(envVars);

            const result = await Analyzer.analyze();

            expect(result.unused).toHaveLength(2);
            expect(result.unused).toContain('OLD_VAR');
            expect(result.unused).toContain('DEPRECATED_KEY');
            expect(result.missing).toHaveLength(0);
            expect(result.synced).toHaveLength(0);
        });

        it('should identify synced variables', async () => {
            const codeVars = new Map<string, EnvVariable>([
                [
                    'API_KEY',
                    {
                        name: 'API_KEY',
                        locations: [
                            {
                                file: 'src/config.ts',
                                line: 1,
                                column: 0,
                                code: 'process.env.API_KEY',
                            },
                        ],
                        inExample: false,
                        inEnv: false,
                    },
                ],
            ]);

            const exampleVars = new Set(['API_KEY']);
            const envVars = new Set(['API_KEY']);

            vi.mocked(Scanner.scanProject).mockResolvedValue(codeVars);
            vi.mocked(Scanner.getEnvExampleVars).mockReturnValue(exampleVars);
            vi.mocked(Scanner.getEnvVars).mockReturnValue(envVars);

            const result = await Analyzer.analyze();

            expect(result.synced).toHaveLength(1);
            expect(result.synced[0].name).toBe('API_KEY');
            expect(result.synced[0].inExample).toBe(true);
            expect(result.synced[0].inEnv).toBe(true);
            expect(result.missing).toHaveLength(0);
            expect(result.unused).toHaveLength(0);
        });

        it('should handle mixed scenario', async () => {
            const codeVars = new Map<string, EnvVariable>([
                [
                    'API_KEY',
                    {
                        name: 'API_KEY',
                        locations: [
                            {
                                file: 'src/config.ts',
                                line: 1,
                                column: 0,
                                code: 'process.env.API_KEY',
                            },
                        ],
                        inExample: false,
                        inEnv: false,
                    },
                ],
                [
                    'DATABASE_URL',
                    {
                        name: 'DATABASE_URL',
                        locations: [
                            {
                                file: 'src/db.ts',
                                line: 5,
                                column: 10,
                                code: 'process.env.DATABASE_URL',
                            },
                        ],
                        inExample: false,
                        inEnv: false,
                    },
                ],
                [
                    'PORT',
                    {
                        name: 'PORT',
                        locations: [
                            {
                                file: 'src/server.ts',
                                line: 10,
                                column: 5,
                                code: 'process.env.PORT',
                            },
                        ],
                        inExample: false,
                        inEnv: false,
                    },
                ],
            ]);

            const exampleVars = new Set(['API_KEY', 'OLD_VAR']);
            const envVars = new Set(['API_KEY']);

            vi.mocked(Scanner.scanProject).mockResolvedValue(codeVars);
            vi.mocked(Scanner.getEnvExampleVars).mockReturnValue(exampleVars);
            vi.mocked(Scanner.getEnvVars).mockReturnValue(envVars);

            const result = await Analyzer.analyze();

            expect(result.total).toBe(3);
            expect(result.synced).toHaveLength(1);
            expect(result.synced[0].name).toBe('API_KEY');
            expect(result.missing).toHaveLength(2);
            expect(result.missing.map(v => v.name)).toContain('DATABASE_URL');
            expect(result.missing.map(v => v.name)).toContain('PORT');
            expect(result.unused).toHaveLength(1);
            expect(result.unused).toContain('OLD_VAR');
        });

        it('should correctly set inExample and inEnv flags', async () => {
            const codeVars = new Map<string, EnvVariable>([
                [
                    'VAR_IN_BOTH',
                    {
                        name: 'VAR_IN_BOTH',
                        locations: [{ file: 'src/test.ts', line: 1, column: 0, code: '' }],
                        inExample: false,
                        inEnv: false,
                    },
                ],
                [
                    'VAR_IN_EXAMPLE_ONLY',
                    {
                        name: 'VAR_IN_EXAMPLE_ONLY',
                        locations: [{ file: 'src/test.ts', line: 2, column: 0, code: '' }],
                        inExample: false,
                        inEnv: false,
                    },
                ],
                [
                    'VAR_IN_NEITHER',
                    {
                        name: 'VAR_IN_NEITHER',
                        locations: [{ file: 'src/test.ts', line: 3, column: 0, code: '' }],
                        inExample: false,
                        inEnv: false,
                    },
                ],
            ]);

            const exampleVars = new Set(['VAR_IN_BOTH', 'VAR_IN_EXAMPLE_ONLY']);
            const envVars = new Set(['VAR_IN_BOTH']);

            vi.mocked(Scanner.scanProject).mockResolvedValue(codeVars);
            vi.mocked(Scanner.getEnvExampleVars).mockReturnValue(exampleVars);
            vi.mocked(Scanner.getEnvVars).mockReturnValue(envVars);

            const result = await Analyzer.analyze();

            const varInBoth = result.synced.find(v => v.name === 'VAR_IN_BOTH');
            const varInExampleOnly = result.synced.find(v => v.name === 'VAR_IN_EXAMPLE_ONLY');
            const varInNeither = result.missing.find(v => v.name === 'VAR_IN_NEITHER');

            expect(varInBoth?.inExample).toBe(true);
            expect(varInBoth?.inEnv).toBe(true);
            expect(varInExampleOnly?.inExample).toBe(true);
            expect(varInExampleOnly?.inEnv).toBe(false);
            expect(varInNeither?.inExample).toBe(false);
            expect(varInNeither?.inEnv).toBe(false);
        });

        it('should return correct total count', async () => {
            const codeVars = new Map<string, EnvVariable>([
                ['VAR1', { name: 'VAR1', locations: [], inExample: false, inEnv: false }],
                ['VAR2', { name: 'VAR2', locations: [], inExample: false, inEnv: false }],
                ['VAR3', { name: 'VAR3', locations: [], inExample: false, inEnv: false }],
            ]);

            vi.mocked(Scanner.scanProject).mockResolvedValue(codeVars);
            vi.mocked(Scanner.getEnvExampleVars).mockReturnValue(new Set());
            vi.mocked(Scanner.getEnvVars).mockReturnValue(new Set());

            const result = await Analyzer.analyze();

            expect(result.total).toBe(3);
        });
    });
});
