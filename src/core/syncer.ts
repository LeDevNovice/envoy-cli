import { FileUtils } from "../utils/file-utils";
import { Logger } from "../utils/logger";

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
}