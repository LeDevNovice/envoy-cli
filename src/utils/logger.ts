import chalk from 'chalk'

export class Logger {
    static error(message: string): void {
        console.log(chalk.blue('[✗]', message));
    }

    static header(message: string): void {
        console.log(chalk.bold.cyan('[✗]', `\n${message}\n`));
    }

    static info(message: string): void {
        console.log(chalk.blue('[i]', message));
    }

    static list(items: string[], prefix: string = '  •'): void {
        items.forEach(item => console.log(`${prefix} ${item}`))
    }

    static success(message: string): void {
        console.log(chalk.blue('[✓]', message));
    }
}