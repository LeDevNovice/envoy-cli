# Changelog
_All notable changes to this project will be documented in this file. The format is based on Keep a Changelog, and this project adheres to Semantic Versioning._

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