# envoy-cli

**The envoy between your code and environment variable config - Never miss an environment variable again**

[![npm version](https://img.shields.io/npm/v/envoy-cli.svg)](https://www.npmjs.com/package/envoy-cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node Version](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![Tests](https://img.shields.io/badge/tests-passing-brightgreen.svg)](https://github.com/LeDevNovice/envoy-cli)

---

## 📖 Table of Contents

- [Why envoy-cli ?](#-why-envoy-cli)
- [Features](#-features)
- [Installation](#-installation)
- [Windows Users](#-windows-users)
- [Quick Start](#-quick-start)
- [Commands](#-commands)
  - [init](#init---initialize-configuration)
  - [check](#check---verify-environment-variables)
  - [sync](#sync---synchronize-variables)
- [Configuration](#-configuration)
- [Supported Patterns](#-supported-patterns)
- [Examples](#-examples)
- [CI/CD Integration](#-cicd-integration)
- [Development](#-development)
- [Project Structure](#-project-structure)
- [Contributing](#-contributing)
- [License](#-license)

---

## Why envoy-cli ?

Have you ever :
- **Forgotten** to add an environment variable to `.env.example` ?
- **Left unused** variables in your `.env.example` causing confusion ?
- **Struggled** to keep environment files in sync across your team ?
- **Wanted** to automate environment variable management in CI/CD ?

**envoy-cli** solves all of these problems by automatically scanning your codebase and keeping your environment files perfectly synchronized.

---

## Features

- **Automatic Detection** : Scans your entire codebase for environment variable usage
- **Smart Analysis** : Identifies missing, unused, and properly synced variables
- **Auto-Sync** : Automatically synchronize `.env.example` with your actual code
- **Multiple Patterns** : Supports `process.env`, `import.meta.env`, Deno, PowerShell, and more...
- **Type-Safe** : Built with TypeScript for maximum reliability
- **Fast** : Efficient file scanning with configurable ignore patterns
- **CI/CD Ready** : Built-in support for continuous integration pipelines
- **Smart Comments** : Optionally add helpful comments showing where variables are used
- **Beautiful Output** : Color-coded, clear console output with Chalk

---

## Installation

### Global Installation (Recommended)

Install envoy-cli globally to use it in any project :

```bash
npm install -g envoy-cli
```

### Local Installation (Project-Specific)

Install as a dev dependency in your project :

```bash
npm install --save-dev envoy-cli
```

Or with pnpm :

```bash
pnpm add -D envoy-cli
```

Or with yarn :

```bash
yarn add -D envoy-cli
```

---

## Windows Users

### Git Bash Compatibility

If you're using **Git Bash on Windows** and encounter issues running `envoy-cli`, this is due to a known compatibility issue between Git Bash (MinTTY) and Node.js CLI applications.

#### Quick Fix for Git Bash

Add this alias to your `.bashrc`:

```bash
# Open your .bashrc
nano ~/.bashrc

# Add this line at the end
alias envoy-cli='winpty envoy-cli.cmd'

# Save and reload
source ~/.bashrc
```

Now `envoy-cli` will work correctly in Git Bash! 

#### Alternative: Use Native Windows Terminals

If you prefer not to use the alias, envoy-cli works perfectly in:
- ✅ **PowerShell** (Recommended)
- ✅ **Windows Terminal**
- ✅ **Command Prompt (CMD)**
- ✅ **WSL (Windows Subsystem for Linux)**

```powershell
# PowerShell - No configuration needed
envoy-cli --version
```

#### Why Does This Happen?

Git Bash uses MinTTY, which doesn't natively handle Windows console applications. The `winpty` wrapper bridges this gap by properly routing stdin/stdout/stderr between MinTTY and Node.js.

### Known Terminal Limitations

**Git Bash Display Issues :**
- Variable names with underscores may display as asterisks (`_VAR` shows as `*VAR`)
- Exit codes may differ from other terminals
- **Solution :** Use PowerShell, CMD, or Windows Terminal for accurate display

These are Git Bash (MinTTY) rendering quirks, not bugs in envoy-cli. 
All functionality works correctly across all terminals.

---

## Quick Start

Get started in 3 simple steps :

```bash
# 1. Initialize envoy-cli in your project
envoy-cli init

# 2. Check your current environment variable status
envoy-cli check

# 3. Auto-fix any issues
envoy-cli sync --auto
```

---

## Commands

### `init` - Initialize Configuration

Initialize envoy-cli in your current project.

```bash
envoy-cli init
```

**What it does :**
- ✅ Validates that you're in a Node.js project (checks for `package.json`)
- ✅ Creates `.env.example` if it doesn't exist
- ✅ Generates `.envoyrc.json` configuration file with default settings
- ✅ Provides helpful next steps

**Example Output :**
```
Initializing envoy-cli configuration...

✓ Created .env.example
✓ .envoyrc.json file created successfully.
✓ envoy-cli has been successfully initialized in your project !

Next steps:
  • First step
  • Second step
  • Third step
```

---

### `check` - Verify Environment Variables

Scan your codebase and check the status of all environment variables.

```bash
envoy-cli check
```

**Options:**
- `--ci` - Exit with code 1 if issues are found (perfect for CI/CD pipelines)

**What it shows :**

1. **MISSING**: Variables used in your code but not in `.env.example`
   - Shows the variable name
   - Shows first file and line where it's used
   - Shows total number of occurrences

2. **UNUSED**: Variables in `.env.example` but not used in your code
   - Helps identify outdated or unnecessary variables

3. **SYNCED**: Variables that are properly configured
   - Shows how many places each variable is used

**Example Output :**
```
Envoy - Check Environment Variables

Found 15 environment variables in code

MISSING in .env.example (3):
  ✗ API_KEY
    → First used in src/config.ts:12
    → Also used in 2 other locations
  ✗ DATABASE_URL
    → First used in src/db/connection.ts:5
  ✗ REDIS_URL
    → First used in src/cache/redis.ts:8

UNUSED in .env.example (1):
  ⚠ OLD_API_TOKEN
    → Not found in codebase

SYNCED (11):
  ✓ PORT
    → Used in 3 locations
  ✓ NODE_ENV
    → Used in 5 locations
  ...

💡 Run "envoy-cli sync --auto" to fix automatically
```

**CI/CD Mode:**
```bash
envoy-cli check --ci
```
Exits with code 1 if any missing or unused variables are found, failing your pipeline.

---

### `sync` - Synchronize Variables

Synchronize your `.env.example` file with the variables actually used in your code.

```bash
envoy-cli sync [options]
```

**Options:**
- `--auto` - Automatically add missing variables to `.env.example`
- `--remove` - Automatically remove unused variables from `.env.example`
- `--comments` - Add helpful comments showing where variables are used

**Examples :**

```bash
# Add missing variables only
envoy-cli sync --auto

# Remove unused variables only
envoy-cli sync --remove

# Add missing and remove unused
envoy-cli sync --auto --remove

# Add missing with location comments
envoy-cli sync --auto --comments
```

**With `--comments` enabled :**
```env
# Environment Variables

# Used in src/config.ts:12
# Also used in 2 other location(s)
API_KEY=

# Used in src/db/connection.ts:5
DATABASE_URL=
```

**Example Output :**
```
Starting synchronization process...

✓ Added API_KEY to .env.example
✓ Added DATABASE_URL to .env.example
✓ Added REDIS_URL to .env.example
⚠ Removed OLD_API_TOKEN from .env.example

✨ Synchronization complete !
```

---

## Configuration

envoy-cli uses a `.envoyrc.json` file for configuration (created automatically by `init`).

### Default Configuration

```json
{
  "exclude": [
    "dist/**",
    "build/**",
    "coverage/**"
  ]
}
```

### Available Options

| Option | Type | Description | Default |
|--------|------|-------------|---------|
| `exclude` | `string[]` | Glob patterns to ignore during scanning | `["dist/**", "build/**", "coverage/**"]` |

### Custom Configuration Example

```json
{
  "exclude": [
    "dist/**",
    "build/**",
    "coverage/**",
    "node_modules/**",
    ".git/**",
    "temp/**",
    "*.test.ts",
    "**/__tests__/**"
  ]
}
```

---

## Supported Patterns

envoy-cli automatically detects environment variables in multiple formats :

### Node.js - Traditional Access

```javascript
// Direct access
const apiKey = process.env.API_KEY;

// Bracket notation
const dbUrl = process.env['DATABASE_URL'];
const token = process.env["API_TOKEN"];
```

### Node.js - Modern Destructuring

```javascript
// Simple destructuring
const { API_KEY } = process.env;

// Multiple variables
const { API_KEY, DATABASE_URL, PORT } = process.env;

// With renaming
const { API_KEY: apiKey, DATABASE_URL: dbUrl } = process.env;

// With default values
const { PORT = '3000', NODE_ENV = 'development' } = process.env;

// Mixed patterns
const {
    API_KEY: apiKey = 'default_key',
    DATABASE_URL,
    PORT = '3000',
    ...otherVars  // rest operator is ignored
} = process.env;

// With let/var (works too !)
let { REDIS_URL } = process.env;
var { CACHE_TTL } = process.env;
```

### Template Literals 

```javascript
// In URLs
const apiUrl = `http://localhost:${process.env.PORT}/api`;

// In connection strings
const dbUrl = `postgresql://user:pass@${process.env.DB_HOST}:${process.env.DB_PORT}/mydb`;

// Multiple variables in one string
const url = `${process.env.PROTOCOL}://${process.env.HOST}:${process.env.PORT}`;
```

### Vite / Frontend Frameworks

```javascript
// Traditional Vite access
const apiUrl = import.meta.env.VITE_API_URL;
const mode = import.meta.env.VITE_MODE;

// Vite destructuring 
const { VITE_API_URL, VITE_MODE } = import.meta.env;

// Vite template literals 
const endpoint = `${import.meta.env.VITE_API_URL}/users`;
```

### Deno

```javascript
// Deno environment access
const apiKey = Deno.env.get('API_KEY');
const port = Deno.env.get('PORT');
```

### PowerShell

```powershell
# PowerShell environment variables
$apiKey = $env:API_KEY
$dbUrl = $env:DATABASE_URL
```

### Supported File Extensions

envoy-cli scans these file types by default:
- `.ts` - TypeScript
- `.tsx` - TypeScript React
- `.js` - JavaScript
- `.jsx` - JavaScript React
- `.mjs` - ES Modules
- `.cjs` - CommonJS

---

## 📚 Examples

### Example 1: Basic Project Setup

```bash
# Start a new project
mkdir my-app && cd my-app
npm init -y

# Install envoy-cli
npm install -D envoy-cli

# Initialize
npx envoy-cli init

# Your code uses some env variables
echo "const key = process.env.API_KEY;" > index.js

# Check status
npx envoy-cli check
# Output: MISSING in .env.example (1): API_KEY

# Auto-fix
npx envoy-cli sync --auto
# Output: ✓ Added API_KEY to .env.example
```

### Example 2: Team Collaboration

```bash
# Team member A adds new feature using env variables
git pull
envoy-cli check
# Output: MISSING in .env.example (2): STRIPE_KEY, STRIPE_SECRET

# Sync and commit
envoy-cli sync --auto --comments
git add .env.example
git commit -m "Add Stripe environment variables"

# Team member B pulls changes
git pull
# .env.example is now up to date!
```

### Example 3: Cleaning Up Old Variables

```bash
# After refactoring, check for unused variables
envoy-cli check
# Output: UNUSED in .env.example (5): OLD_API_KEY, DEPRECATED_URL, ...

# Remove unused variables
envoy-cli sync --remove
# Output: ⚠ Removed OLD_API_KEY from .env.example
#         ⚠ Removed DEPRECATED_URL from .env.example
```

### Example 4: Adding to Package Scripts

Add envoy-cli checks to your `package.json` :

```json
{
  "scripts": {
    "env:check": "envoy-cli check",
    "env:sync": "envoy-cli sync --auto --comments",
    "env:clean": "envoy-cli sync --remove",
    "pretest": "envoy-cli check --ci",
    "prepare": "envoy-cli check"
  }
}
```

Then use :
```bash
npm run env:check    # Check status
npm run env:sync     # Auto-fix with comments
npm run env:clean    # Remove unused
```

---

## CI/CD Integration

### GitHub Actions

Create `.github/workflows/env-check.yml`:

```yaml
name: Environment Variables Check

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  env-check:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Check environment variables
        run: npx envoy-cli check --ci
      
      - name: Comment on PR (if check fails)
        if: failure() && github.event_name == 'pull_request'
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: 'Environment variable check failed! Please run `envoy-cli sync --auto` and commit the changes.'
            })
```

### GitLab CI

Add to `.gitlab-ci.yml` :

```yaml
env-check:
  stage: test
  image: node:20
  script:
    - npm ci
    - npx envoy-cli check --ci
  only:
    - merge_requests
    - main
    - develop
```

### CircleCI

Add to `.circleci/config.yml`:

```yaml
version: 2.1

jobs:
  env-check:
    docker:
      - image: cimg/node:20.0
    steps:
      - checkout
      - restore_cache:
          keys:
            - v1-dependencies-{{ checksum "package-lock.json" }}
      - run: npm ci
      - run: npx envoy-cli check --ci

workflows:
  version: 2
  build-and-test:
    jobs:
      - env-check
```

### Pre-commit Hook (Husky)

Install Husky:
```bash
npm install -D husky
npx husky init
```

Create `.husky/pre-commit`:
```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx envoy-cli check --ci
```

Now every commit will verify environment variables!

---

## Development

### Prerequisites

- Node.js >= 16.0.0
- npm, pnpm, or yarn

### Setup Development Environment

```bash
# Clone the repository
git clone https://github.com/LeDevNovice/envoy-cli.git
cd envoy-cli

# Install dependencies
npm install

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage

# Build the project
npm run build

# Run in development mode
npm run dev
```

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run build` | Compile TypeScript to JavaScript |
| `npm run dev` | Watch mode for development |
| `npm start` | Run the compiled CLI |
| `npm test` | Run all tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Generate test coverage report |

### Running Locally

After building, you can test the CLI locally:

```bash
# Build first
npm run build

# Link globally
npm link

# Now you can use envoy-cli anywhere
cd /path/to/your/project
envoy-cli init
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode (for development)
npm run test:watch
```

---

## FAQ

### Why doesn't envoy-cli work in Git Bash on Windows?

Git Bash uses MinTTY which has compatibility issues with Node.js CLI apps. 
See [Windows Users](#-windows-users) section for the solution.

---

## Contributing

Contributions are welcome ! Here's how you can help :

### Reporting Bugs

1. Check if the bug has already been reported in [Issues](https://github.com/LeDevNovice/envoy-cli/issues)
2. If not, create a new issue with :
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Your environment (OS, Node version, etc...)

### Suggesting Features

1. Open an issue with the `enhancement` label
2. Describe the feature and why it would be useful
3. Provide examples of how it would work

### Submitting Pull Requests

1. Fork the repository
2. Create a new branch : `git checkout -b feature/amazing-feature`
3. Make your changes
4. Write or update tests
5. Ensure all tests pass : `npm test`
6. Commit your changes : `git commit -m 'Add amazing feature'`
7. Push to the branch: `git push origin feature/amazing-feature`
8. Open a Pull Request

### Development Guidelines

- Write clear, descriptive commit messages
- Follow the existing code style
- Add tests for new features
- Update documentation as needed
- Keep PRs focused on a single feature/fix

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- Built with [Commander.js](https://github.com/tj/commander.js/) - CLI framework
- Styled with [Chalk](https://github.com/chalk/chalk) - Terminal string styling
- File globbing with [glob](https://github.com/isaacs/node-glob) - Pattern matching
- Tested with [Vitest](https://vitest.dev/) - Fast unit testing
- Inspired by the need for better environment variable management in team development projects

---

## Support & Contact

- **Bug Reports** : [GitHub Issues](https://github.com/LeDevNovice/envoy-cli/issues)
- **Twitter** : [@LeDevNovice](https://twitter.com/LeDevNovice)

---

## Star History

If you find this project useful, please consider giving it a star on GitHub !

---

**Made with ❤️ by [LeDevNovice](https://github.com/LeDevNovice)**

*Never miss an environment variable again!*
