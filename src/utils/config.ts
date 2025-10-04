import { FileUtils } from './file-utils';
import { Logger } from './logger';

export interface EnvoyConfig {
    exclude?: string[];
}

export class ConfigLoader {
    private static readonly CONFIG_FILE = '.envoyrc.json';
    private static readonly DEFAULT_CONFIG: EnvoyConfig = {
        exclude: ['dist/**', 'build/**', 'coverage/**'],
    };

    /**
     * Load configuration from .envoyrc.json
     * Falls back to default config if file doesn't exist or is invalid
     */
    static load(): EnvoyConfig {
        if (!FileUtils.exists(this.CONFIG_FILE)) {
            return this.DEFAULT_CONFIG;
        }

        try {
            const content = FileUtils.read(this.CONFIG_FILE);
            const config = JSON.parse(content) as EnvoyConfig;

            return {
                ...this.DEFAULT_CONFIG,
                ...config,
            };
        } catch (error) {
            Logger.warning(`Failed to parse ${this.CONFIG_FILE}: ${(error as Error).message}`);
            Logger.warning('Using default configuration instead');
            return this.DEFAULT_CONFIG;
        }
    }

    /**
     * Get the exclude patterns from config
     */
    static getExcludePatterns(): string[] {
        const config = this.load();
        return config.exclude || this.DEFAULT_CONFIG.exclude || [];
    }
}
