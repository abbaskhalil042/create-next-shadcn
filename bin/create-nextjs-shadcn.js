#!/usr/bin/env node
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
async function validateTargetDir(targetDir) {
    try {
        await fs.access(targetDir);
        const files = await fs.readdir(targetDir);
        const allowedFiles = ['.git', '.DS_Store', 'node_modules', 'package-lock.json'];
        if (files.some(file => !allowedFiles.includes(file))) {
            throw new Error('Target directory not empty');
        }
    }
    catch (err) {
        if (err.code !== 'ENOENT')
            throw err;
    }
    return path.resolve(targetDir);
}
async function main() {
    try {
        // 1. Get and validate project name
        const [projectName] = process.argv.slice(2);
        if (!projectName) {
            throw new Error('Missing project name');
        }
        // 2. Get user preferences
        const answers = await inquirer.prompt([
            {
                type: 'checkbox',
                name: 'components',
                message: 'Which shadcn components to install?',
                choices: ['button', 'card', 'dropdown']
            },
            {
                type: 'confirm',
                name: 'initGit',
                message: 'Initialize Git repository?',
                default: true
            }
        ]);
        // 3. Resolve target directory
        const targetDir = await validateTargetDir(projectName === '.' ? process.cwd() : projectName);
        const spinner = ora('Creating project').start();
        // 4. Copy template
        await fs.cp(path.join(__dirname, '../template'), targetDir, { recursive: true });
        // 5. Post-setup tasks
        spinner.succeed(chalk.green('Project created!'));
        console.log(chalk.green('✔🌓 Dark mode included'));
        console.log(chalk.yellow('\n👉 Star us: https://github.com/abbaskhalil042/create-next-shadcn'));
        console.log('\nNext steps:');
        console.log(chalk.cyan(`cd ${path.relative(process.cwd(), targetDir)}`));
        console.log(chalk.cyan('npm install'));
        console.log(chalk.cyan('npm run dev\n'));
    }
    catch (error) {
        ora().fail(chalk.red('Creation failed'));
        console.error(chalk.red(error instanceof Error ? error.message : 'Unknown error'));
        process.exit(1);
    }
}
await main();
