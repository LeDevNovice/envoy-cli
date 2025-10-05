import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Scanner } from '../../src/core/scanner';
import { FileUtils } from '../../src/utils/file-utils';

vi.mock('../../src/utils/file-utils');

describe('Scanner', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('scanProject', () => {
        it('should detect process.env.VAR pattern', async () => {
            vi.mocked(FileUtils.getProjectRoot).mockReturnValue('/project');
            vi.mocked(FileUtils.findFiles).mockResolvedValue(['src/config.ts']);
            vi.mocked(FileUtils.read).mockReturnValue(`
                const apiKey = process.env.API_KEY;
                const dbUrl = process.env.DATABASE_URL;
            `);

            const result = await Scanner.scanProject();

            expect(result.size).toBe(2);
            expect(result.has('API_KEY')).toBe(true);
            expect(result.has('DATABASE_URL')).toBe(true);
        });

        it('should detect process.env["VAR"] pattern', async () => {
            vi.mocked(FileUtils.getProjectRoot).mockReturnValue('/project');
            vi.mocked(FileUtils.findFiles).mockResolvedValue(['src/config.ts']);
            vi.mocked(FileUtils.read).mockReturnValue(`
                const apiKey = process.env['API_KEY'];
                const dbUrl = process.env["DATABASE_URL"];
            `);

            const result = await Scanner.scanProject();

            expect(result.size).toBe(2);
            expect(result.has('API_KEY')).toBe(true);
            expect(result.has('DATABASE_URL')).toBe(true);
        });

        it('should detect import.meta.env.VAR pattern (Vite)', async () => {
            vi.mocked(FileUtils.getProjectRoot).mockReturnValue('/project');
            vi.mocked(FileUtils.findFiles).mockResolvedValue(['src/config.ts']);
            vi.mocked(FileUtils.read).mockReturnValue(`
                const apiUrl = import.meta.env.VITE_API_URL;
                const mode = import.meta.env.VITE_MODE;
            `);

            const result = await Scanner.scanProject();

            expect(result.size).toBe(2);
            expect(result.has('VITE_API_URL')).toBe(true);
            expect(result.has('VITE_MODE')).toBe(true);
        });

        it('should handle multiple occurrences of same variable', async () => {
            vi.mocked(FileUtils.getProjectRoot).mockReturnValue('/project');
            vi.mocked(FileUtils.findFiles).mockResolvedValue(['src/config.ts', 'src/utils.ts']);

            vi.mocked(FileUtils.read)
                .mockReturnValueOnce('const key = process.env.API_KEY;')
                .mockReturnValueOnce('const key2 = process.env.API_KEY;');

            const result = await Scanner.scanProject();

            expect(result.size).toBe(1);
            expect(result.get('API_KEY')?.locations).toHaveLength(2);
        });

        it('should track correct file location', async () => {
            vi.mocked(FileUtils.getProjectRoot).mockReturnValue('/project');
            vi.mocked(FileUtils.findFiles).mockResolvedValue(['/project/src/config.ts']);
            vi.mocked(FileUtils.read).mockReturnValue(`
const port = 3000;
const apiKey = process.env.API_KEY;
const dbUrl = process.env.DATABASE_URL;
            `);

            const result = await Scanner.scanProject();

            const apiKeyVar = result.get('API_KEY');
            expect(apiKeyVar).toBeDefined();
            expect(apiKeyVar?.locations[0]).toMatchObject({
                file: 'src/config.ts',
                line: 3,
            });
        });

        it('should ignore files in node_modules by default', async () => {
            vi.mocked(FileUtils.getProjectRoot).mockReturnValue('/project');
            vi.mocked(FileUtils.findFiles).mockResolvedValue([
                'src/config.ts',
            ]);
            vi.mocked(FileUtils.read).mockReturnValue('const key = process.env.API_KEY;');

            const result = await Scanner.scanProject();

            expect(FileUtils.findFiles).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    ignore: expect.arrayContaining(['node_modules/**']),
                })
            );
        });

        it('should respect custom exclude patterns', async () => {
            vi.mocked(FileUtils.getProjectRoot).mockReturnValue('/project');
            vi.mocked(FileUtils.findFiles).mockResolvedValue([]);

            await Scanner.scanProject({ exclude: ['custom/**', 'temp/**'] });

            expect(FileUtils.findFiles).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    ignore: expect.arrayContaining(['custom/**', 'temp/**']),
                })
            );
        });

        it('should handle files with no environment variables', async () => {
            vi.mocked(FileUtils.getProjectRoot).mockReturnValue('/project');
            vi.mocked(FileUtils.findFiles).mockResolvedValue(['src/utils.ts']);
            vi.mocked(FileUtils.read).mockReturnValue(`
                export function add(a: number, b: number) {
                    return a + b;
                }
            `);

            const result = await Scanner.scanProject();

            expect(result.size).toBe(0);
        });

        it('should handle empty project', async () => {
            vi.mocked(FileUtils.getProjectRoot).mockReturnValue('/project');
            vi.mocked(FileUtils.findFiles).mockResolvedValue([]);

            const result = await Scanner.scanProject();

            expect(result.size).toBe(0);
        });

        describe('Destructuring Patterns', () => {
            it('should detect simple destructuring', async () => {
                vi.mocked(FileUtils.getProjectRoot).mockReturnValue('/project');
                vi.mocked(FileUtils.findFiles).mockResolvedValue(['src/config.ts']);
                vi.mocked(FileUtils.read).mockReturnValue(`
                    const { API_KEY } = process.env;
                    const { DATABASE_URL } = process.env;
                `);

                const result = await Scanner.scanProject();

                expect(result.size).toBe(2);
                expect(result.has('API_KEY')).toBe(true);
                expect(result.has('DATABASE_URL')).toBe(true);
            });

            it('should detect multiple variables in one destructuring', async () => {
                vi.mocked(FileUtils.getProjectRoot).mockReturnValue('/project');
                vi.mocked(FileUtils.findFiles).mockResolvedValue(['src/config.ts']);
                vi.mocked(FileUtils.read).mockReturnValue(`
                    const { API_KEY, DATABASE_URL, REDIS_URL } = process.env;
                `);

                const result = await Scanner.scanProject();

                expect(result.size).toBe(3);
                expect(result.has('API_KEY')).toBe(true);
                expect(result.has('DATABASE_URL')).toBe(true);
                expect(result.has('REDIS_URL')).toBe(true);
            });

            it('should detect destructuring with renaming', async () => {
                vi.mocked(FileUtils.getProjectRoot).mockReturnValue('/project');
                vi.mocked(FileUtils.findFiles).mockResolvedValue(['src/config.ts']);
                vi.mocked(FileUtils.read).mockReturnValue(`
                    const { API_KEY: apiKey } = process.env;
                    const { DATABASE_URL: dbUrl, PORT: port } = process.env;
                `);

                const result = await Scanner.scanProject();

                expect(result.size).toBe(3);
                expect(result.has('API_KEY')).toBe(true);
                expect(result.has('DATABASE_URL')).toBe(true);
                expect(result.has('PORT')).toBe(true);
            });

            it('should detect destructuring with default values', async () => {
                vi.mocked(FileUtils.getProjectRoot).mockReturnValue('/project');
                vi.mocked(FileUtils.findFiles).mockResolvedValue(['src/config.ts']);
                vi.mocked(FileUtils.read).mockReturnValue(`
                    const { PORT = '3000' } = process.env;
                    const { NODE_ENV = 'development', DEBUG = 'false' } = process.env;
                `);

                const result = await Scanner.scanProject();

                expect(result.size).toBe(3);
                expect(result.has('PORT')).toBe(true);
                expect(result.has('NODE_ENV')).toBe(true);
                expect(result.has('DEBUG')).toBe(true);
            });

            it('should ignore rest operators in destructuring', async () => {
                vi.mocked(FileUtils.getProjectRoot).mockReturnValue('/project');
                vi.mocked(FileUtils.findFiles).mockResolvedValue(['src/config.ts']);
                vi.mocked(FileUtils.read).mockReturnValue(`
                    const { API_KEY, ...rest } = process.env;
                    const { PORT, ...otherVars } = process.env;
                `);

                const result = await Scanner.scanProject();

                expect(result.size).toBe(2);
                expect(result.has('API_KEY')).toBe(true);
                expect(result.has('PORT')).toBe(true);
                expect(result.has('rest')).toBe(false);
                expect(result.has('otherVars')).toBe(false);
            });

            it('should detect destructuring with let and var', async () => {
                vi.mocked(FileUtils.getProjectRoot).mockReturnValue('/project');
                vi.mocked(FileUtils.findFiles).mockResolvedValue(['src/config.ts']);
                vi.mocked(FileUtils.read).mockReturnValue(`
                    let { API_KEY } = process.env;
                    var { DATABASE_URL } = process.env;
                `);

                const result = await Scanner.scanProject();

                expect(result.size).toBe(2);
                expect(result.has('API_KEY')).toBe(true);
                expect(result.has('DATABASE_URL')).toBe(true);
            });

            it('should detect Vite destructuring (import.meta.env)', async () => {
                vi.mocked(FileUtils.getProjectRoot).mockReturnValue('/project');
                vi.mocked(FileUtils.findFiles).mockResolvedValue(['src/config.ts']);
                vi.mocked(FileUtils.read).mockReturnValue(`
                    const { VITE_API_URL, VITE_MODE } = import.meta.env;
                `);

                const result = await Scanner.scanProject();

                expect(result.size).toBe(2);
                expect(result.has('VITE_API_URL')).toBe(true);
                expect(result.has('VITE_MODE')).toBe(true);
            });
        });

        describe('Template Literals', () => {
            it('should detect variables in template literals', async () => {
                vi.mocked(FileUtils.getProjectRoot).mockReturnValue('/project');
                vi.mocked(FileUtils.findFiles).mockResolvedValue(['src/config.ts']);
                vi.mocked(FileUtils.read).mockReturnValue(`
                    const apiUrl = \`http://localhost:\${process.env.PORT}/api\`;
                    const dbUrl = \`postgresql://user:pass@localhost:\${process.env.DB_PORT}/mydb\`;
                `);

                const result = await Scanner.scanProject();

                expect(result.size).toBe(2);
                expect(result.has('PORT')).toBe(true);
                expect(result.has('DB_PORT')).toBe(true);
            });

            it('should detect Vite variables in template literals', async () => {
                vi.mocked(FileUtils.getProjectRoot).mockReturnValue('/project');
                vi.mocked(FileUtils.findFiles).mockResolvedValue(['src/config.ts']);
                vi.mocked(FileUtils.read).mockReturnValue(`
                    const apiUrl = \`\${import.meta.env.VITE_API_URL}/endpoint\`;
                `);

                const result = await Scanner.scanProject();

                expect(result.size).toBe(1);
                expect(result.has('VITE_API_URL')).toBe(true);
            });

            it('should detect multiple variables in same template literal', async () => {
                vi.mocked(FileUtils.getProjectRoot).mockReturnValue('/project');
                vi.mocked(FileUtils.findFiles).mockResolvedValue(['src/config.ts']);
                vi.mocked(FileUtils.read).mockReturnValue(`
                    const url = \`\${process.env.PROTOCOL}://\${process.env.HOST}:\${process.env.PORT}\`;
                `);

                const result = await Scanner.scanProject();

                expect(result.size).toBe(3);
                expect(result.has('PROTOCOL')).toBe(true);
                expect(result.has('HOST')).toBe(true);
                expect(result.has('PORT')).toBe(true);
            });
        });

        describe('Mixed Patterns', () => {
            it('should detect both traditional and destructuring patterns', async () => {
                vi.mocked(FileUtils.getProjectRoot).mockReturnValue('/project');
                vi.mocked(FileUtils.findFiles).mockResolvedValue(['src/config.ts']);
                vi.mocked(FileUtils.read).mockReturnValue(`
                    // Traditional
                    const apiKey = process.env.API_KEY;
                    const dbUrl = process.env['DATABASE_URL'];
                    
                    // Destructuring
                    const { PORT, NODE_ENV } = process.env;
                    
                    // Template literal
                    const url = \`http://localhost:\${process.env.HOST}\`;
                `);

                const result = await Scanner.scanProject();

                expect(result.size).toBe(5);
                expect(result.has('API_KEY')).toBe(true);
                expect(result.has('DATABASE_URL')).toBe(true);
                expect(result.has('PORT')).toBe(true);
                expect(result.has('NODE_ENV')).toBe(true);
                expect(result.has('HOST')).toBe(true);
            });
        });
    });

    describe('getEnvExampleVars', () => {
        it('should return empty set when .env.example does not exist', () => {
            vi.mocked(FileUtils.exists).mockReturnValue(false);

            const result = Scanner.getEnvExampleVars();

            expect(result.size).toBe(0);
            expect(FileUtils.exists).toHaveBeenCalledWith('.env.example');
        });

        it('should parse variables from .env.example', () => {
            vi.mocked(FileUtils.exists).mockReturnValue(true);
            vi.mocked(FileUtils.parseEnvFile).mockReturnValue(
                new Map([
                    ['API_KEY', 'test_key'],
                    ['DATABASE_URL', 'postgres://...'],
                ])
            );

            const result = Scanner.getEnvExampleVars();

            expect(result.size).toBe(2);
            expect(result.has('API_KEY')).toBe(true);
            expect(result.has('DATABASE_URL')).toBe(true);
        });

        it('should handle empty .env.example', () => {
            vi.mocked(FileUtils.exists).mockReturnValue(true);
            vi.mocked(FileUtils.parseEnvFile).mockReturnValue(new Map());

            const result = Scanner.getEnvExampleVars();

            expect(result.size).toBe(0);
        });
    });

    describe('getEnvVars', () => {
        it('should return empty set when .env does not exist', () => {
            vi.mocked(FileUtils.exists).mockReturnValue(false);

            const result = Scanner.getEnvVars();

            expect(result.size).toBe(0);
            expect(FileUtils.exists).toHaveBeenCalledWith('.env');
        });

        it('should parse variables from .env', () => {
            vi.mocked(FileUtils.exists).mockReturnValue(true);
            vi.mocked(FileUtils.parseEnvFile).mockReturnValue(
                new Map([
                    ['API_KEY', 'actual_key'],
                    ['DATABASE_URL', 'postgres://localhost'],
                ])
            );

            const result = Scanner.getEnvVars();

            expect(result.size).toBe(2);
            expect(result.has('API_KEY')).toBe(true);
            expect(result.has('DATABASE_URL')).toBe(true);
        });
    });
});
