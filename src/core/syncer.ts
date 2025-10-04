import { FileUtils } from '@utils/file-utils';
import { Logger } from '@utils/logger';
import { EnvVariable, SyncOptions } from '../types';

export class Syncer {
    static createExample(): void {
        const examplePath = '.env.example';

        if (FileUtils.exists(examplePath)) {
            Logger.warning('.env.example already exists');
            return;
        }

        const content = `# Environment Variables
# Add your environment variables here
`;

        FileUtils.write(examplePath, content);
        Logger.success('Created .env.example');
    }

    static sync(missing: EnvVariable[], unused: string[], options: SyncOptions = {}): void {
        const examplePath = '.env.example';
        let content = '';

        if (FileUtils.exists(examplePath)) {
            content = FileUtils.read(examplePath);
        }

        const lines = content.split('\n');
        const existingVars = new Set<string>();

        for (const line of lines) {
            const match = line.match(/^([A-Z_][A-Z0-9_]*)\s*=/i);
            if (match) {
                existingVars.add(match[1]);
            }
        }

        if (options.remove && unused.length > 0) {
            const filteredLines = lines.filter(line => {
                const match = line.match(/^([A-Z_][A-Z0-9_]*)\s*=/i);
                if (match && unused.includes(match[1])) {
                    Logger.warning(`Removed ${match[1]} from .env.example`);
                    return false;
                }
                return true;
            });

            content = filteredLines.join('\n');
        }

        if (missing.length > 0) {
            if (content && !content.endsWith('\n')) {
                content += '\n';
            }

            for (const varInfo of missing) {
                if (!existingVars.has(varInfo.name)) {
                    if (options.addComments) {
                        const location = varInfo.locations[0];
                        content += `\n# Used in ${location.file}:${location.line}\n`;
                    }

                    content += `${varInfo.name}=\n`;
                    Logger.success(`Added ${varInfo.name} to .env.example`);
                }
            }
        }

        FileUtils.write(examplePath, content);
    }
}
