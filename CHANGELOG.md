# Changelog
_All notable changes to this project will be documented in this file. The format is based on Keep a Changelog, and this project adheres to Semantic Versioning._

## 1.0.2 - Unreleased
### Added
- **Destructuring Support** : Automatic detection of ES6 destructuring patterns
  - `const { API_KEY } = process.env`
  - `const { API_KEY, DATABASE_URL } = process.env` (multiple variables)
  - `const { API_KEY: apiKey } = process.env` (with renaming)
  - `const { PORT = '3000' } = process.env` (with default values)
  - Works with `const`, `let`, and `var` declarations
  - Supports both `process.env` and `import.meta.env` (Vite)
  - Properly ignores rest operators (`...rest`)

- **Template Literal Support**: Detection of variables in template strings
  - ``const url = `http://localhost:${process.env.PORT}/api`;``
  - Works with both `process.env` and `import.meta.env`
  - Detects multiple variables in the same template literal

### Improved
- Scanner now detects more environment variables in modern codebases
- Better support for ES6+ syntax patterns
- Comprehensive test coverage for all new patterns

### Technical Details
- Added `extractDestructuredVars()` method in Scanner
- Two-phase scanning : regex patterns + line-by-line destructuring analysis
- Duplicate detection to avoid counting same variable multiple times

## 1.0.1 - 2025-10-05
### Added
- Windows Git Bash troubleshooting section
- Documented winpty workaround for Git Bash users
- New ConfigLoader utility to centralize configuration management
- Better error handling for invalid .envoyrc.json files

### Fixed

- Exclude patterns from .envoyrc.json not being respected during scan
- Underscore display issue in variable names when using check command
- Configuration is now properly loaded and passed to Scanner

### Changed
- Analyzer.analyze() now accepts ScanOptions to respect exclude patterns
- Commands check and sync now load configuration before analysis

## 1.0.0 - 2025-10-04
### Added
### Core Features
- Implemented core command-line interface using Commander.js
  - init command: Initialize envoy-cli configuration in any Node.js project
  - check command: Scan and check project environment variables
  - sync command: Synchronize environment variables in codebase with env files
  - Core Modules
    - Scanner: Environment variables search in env files and codebase
    - Analyzer: Check difference between environment variables in codebase and in env files
    - Syncer: Synchronize environment variables
  - Utilities
    - FileUtils: File system operations
    - Logger: Colored console output

## 0.0.3 - 2025-10-04
### Added
### Core Features
- Implemented core command-line interface using Commander.js
  - sync command: Synchronize environment variables in codebase with env files
  - Core Modules
    - Syncer: Synchronize environment variables in codebase with env files

## 0.0.2 - 2025-10-04
### Added
### Core Features
- Implemented core command-line interface using Commander.js
  - check command: Scan and check project environment variables in project codebase ans in env files
  - Utilities
    - FileUtils: Add new methods to provide utilities in scan and analyze jobs
  - Core Modules
    - Scanner: Environment variables search in env files and codebase
    - Analyzer: Check difference between environment variables in codebase and in env files

## 0.0.1 - 2025-10-04
### Added
### Core Features

- Implemented core command-line interface using Commander.js
  - init command: Initialize envoy-cli configuration in any Node.js project
    - Validates presence of package.json before initialization
    - Creates .env.example file if it doesn't exist
    - Creates .envoyrc.json configuration file with default exclude patterns
    - Provides helpful next steps after initialization
    - Prevents overwriting existing configuration files
  - Utilities
    - FileUtils: File system operations
    - Logger: Colored console output
  - Core Modules
    - Syncer: Environment variable synchronization