import { EnvVariable, AnalysisResult } from '../types';
import { Scanner } from './scanner';

export class Analyzer {
    static async analyze(): Promise<AnalysisResult> {
        const codeVars = await Scanner.scanProject();

        const exampleVars = Scanner.getEnvExampleVars();

        const envVars = Scanner.getEnvVars();

        const missing: EnvVariable[] = [];
        const synced: EnvVariable[] = [];
        const unused: string[] = [];

        for (const [varName, varInfo] of codeVars) {
            varInfo.inExample = exampleVars.has(varName);
            varInfo.inEnv = envVars.has(varName);

            if (!varInfo.inExample) {
                missing.push(varInfo);
            } else {
                synced.push(varInfo);
            }
        }

        for (const exampleVar of exampleVars) {
            if (!codeVars.has(exampleVar)) {
                unused.push(exampleVar);
            }
        }

        return {
            missing,
            unused,
            synced,
            total: codeVars.size,
        };
    }
}
