#!/usr/bin/env node
import chalk from 'chalk';
import { exec } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { copy } from 'fs-extra';
import ora from 'ora';
import { dirname, join } from 'path';
import prompts from 'prompts';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const questions = [
  {
    type: 'select',
    name: 'type',
    message: 'What type of project you are building?',
    choices: [
      {
        title: 'Frontend',
        value: 'frontend',
        description: 'NextJs app with scss modules and so on...',
      },
      { title: 'Backend', value: 'backend', description: 'Node Js with ExpressJs and so on...' },
    ],
  },
  {
    type: 'select',
    name: 'language',
    message: 'Which language you wanna use for this project?',
    choices: [
      { title: 'Typescript', value: 'ts' },
      { title: 'JavaScript', value: 'js' },
    ],
  },
  {
    type: 'text',
    name: 'name',
    message: "What's your project name?",
    initial: 'My-tcz-project',
  },
];

const installDependencies = (command) => {
  const spinner = ora('Installing dependencies...').start();
  return new Promise((resolve, reject) => {
    exec(command, (error) => {
      if (error) {
        spinner.fail();
        reject(error);
      } else {
        spinner.succeed();
        resolve();
      }
    });
  });
};

/**
 * Delay returns a promise that resolves after the specified time.
 * @param time - The time in milliseconds to delay.
 * @returns A promise that resolves after a certain amount of time.
 */

async function delay(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

async function authenticateUser() {
  const spinner = ora('Authenticating user...');
  const { token } = await prompts([
    {
      type: 'invisible',
      name: 'token',
      message: 'Enter your token here',
    },
  ]);
  spinner.start();
  await delay(1000).then(() => {
    if (token) return spinner.succeed();
    else {
      spinner.fail();
      console.log(`${chalk.redBright("Sorry! You're not allowed to use this package")}`);
      process.exit(0);
    }
  });
}

async function copyFiles(src, des, name) {
  console.clear();

  // Copy all the files
  console.log(`\n${chalk.blue('Scaffolding your project...')}\n`);
  await copy(join(__dirname, src), des);

  // Read the package.json file
  const packageJsonPath = join(des, 'package.json');
  const packageJsonContent = readFileSync(packageJsonPath, 'utf-8');
  const packageJson = JSON.parse(packageJsonContent);

  // Update the name field with the user input
  packageJson.name = name;

  // Write the updated content back to the file
  const updatedPackageJsonContent = JSON.stringify(packageJson, null, 2);
  writeFileSync(packageJsonPath, updatedPackageJsonContent, 'utf-8');
}

(async () => {
  // authenticate user
  await authenticateUser();

  // Bootstrap project
  const { type, language, name } = await prompts(questions);
  await copyFiles(`../templates/${type}/${language}`, join(process.cwd(), name), name);

  // install dependencies
  await installDependencies(`cd ${name} && npm install`);

  // Success message
  console.log(`\n${chalk.green('Done. Now run: ')}\n`);

  // Next commands
  console.log(`${chalk.cyan('cd')} ${name} \n${chalk.cyan('npm')} run dev\n`);

  process.exit(0);
})();
