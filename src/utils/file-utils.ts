import { existsSync, writeFileSync } from 'fs';

export class FileUtils {
    static exists(filePath: string): boolean {
        return existsSync(filePath);
    }

    static write(filePath: string, content: string): void {
        writeFileSync(filePath, content, 'utf8');
    }
}