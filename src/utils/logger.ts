import chalk from 'chalk';

export class Logger {
    static dim(message: string): void {
        console.log(chalk.dim(message));
    }

    static error(message: string): void {
        console.log(chalk.red(`[✗] ${message}`));
    }

    static header(message: string): void {
        console.log(chalk.bold.cyan(`\n${message}\n`));
    }

    static info(message: string): void {
        console.log(chalk.blueBright(`[i] ${message}`));
    }

    static list(items: string[], prefix: string = '  •'): void {
        items.forEach(item => console.log(`${prefix} ${item}`));
    }

    static success(message: string): void {
        console.log(chalk.green(`[✓] ${message}`));
    }

    static warning(message: string): void {
        console.log(chalk.yellow(`[!] ${message}`));
    }
}