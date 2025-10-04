export interface EnvVariable {
    name: string;
    locations: VariableLocation[];
    inExample: boolean;
    inEnv: boolean;
}

export interface VariableLocation {
    file: string;
    line: number;
    column: number;
    code: string;
}

export interface AnalysisResult {
    missing: EnvVariable[]; // In codebase but not in .env.example
    unused: string[]; // In .env.example but not in codebase
    synced: EnvVariable[]; // Correctly synced variables
    total: number;
}

export interface ScanOptions {
    directories?: string[];
    exclude?: string[];
    includeNodeModules?: boolean;
}

export interface SyncOptions {
    auto?: boolean;
    remove?: boolean;
    addComments?: boolean;
}
