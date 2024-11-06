#!/usr/bin/env node

import { execSync, spawn } from 'node:child_process'
import yargs from 'yargs/yargs'
import { hideBin } from 'yargs/helpers'
import { ElasticMQ } from './elasticmq'

const elasticMQ = new ElasticMQ()

async function readStdin(): Promise<string> {
    return new Promise((resolve, reject) => {
        let data = ''
        process.stdin.setEncoding('utf-8')
        process.stdin.on('data', (chunk) => (data += chunk))
        process.stdin.on('end', () => resolve(data))
        process.stdin.on('error', (err) => reject(err))
    })
}

function requireArgsAndRun<T extends any[]>(
    args: Record<string, unknown>,
    requiredArgs: string[],
    method: (...params: T) => Promise<void>,
    methodArgs: T
): void {
    const missingArgs = requiredArgs.filter((arg) => !args[arg])

    if (missingArgs.length > 0) {
        console.error(
            `Error: Missing required argument(s): ${missingArgs.join(', ')}`
        )
        return
    }

    method(...methodArgs).catch((err) =>
        console.error('Error executing command:', err)
    )
}

function checkDockerInstalled(): boolean {
    try {
        execSync('docker --version', { stdio: 'ignore' })
        return true
    } catch (error) {
        console.error(
            'Error: Docker is not installed. Please install Docker to use this command.'
        )
        return false
    }
}

function killProcessOnPort(port: number): void {
    try {
        const pid = execSync(`lsof -t -i:${port}`).toString().trim()
        if (pid) {
            console.log(`Killing process on port ${port} (PID: ${pid})...`)
            execSync(`kill -9 ${pid}`)
            console.log(`Process on port ${port} terminated.`)
        }
    } catch (error) {
        console.log(`Port ${port}: unallocated 💅`)
    }
}

yargs(hideBin(process.argv))
    .scriptName('localsqs')
    .option('api', {
        describe: 'Override the API URL for ElasticMQ',
        type: 'string',
        coerce: (url) => {
            elasticMQ.setApiUrl(url)
            console.log(`ElasticMQ API URL set to: ${url}`)
        },
    })
    .command(
        'createQueue <queueName>',
        'Create a new SQS queue',
        (yargs) =>
            yargs.positional('queueName', {
                type: 'string',
                describe: 'The name of the queue',
            }),
        (argv) =>
            requireArgsAndRun(
                argv,
                ['queueName'],
                elasticMQ.createQueue.bind(elasticMQ),
                [argv.queueName as string]
            )
    )
    .command(
        'deleteQueue <queueName>',
        'Delete a queue',
        (yargs) =>
            yargs.positional('queueName', {
                type: 'string',
                describe: 'The name of the queue',
            }),
        (argv) =>
            requireArgsAndRun(
                argv,
                ['queueName'],
                elasticMQ.deleteQueue.bind(elasticMQ),
                [argv.queueName as string]
            )
    )
    .command(
        'listQueues [namePrefix]',
        'List all queues',
        (yargs) =>
            yargs.option('namePrefix', {
                type: 'string',
                describe: 'Optional queue name prefix',
            }),
        (argv) => elasticMQ.listQueues(argv.namePrefix)
    )
    .command(
        'purgeQueue <queueName>',
        'Purge all messages from a queue',
        (yargs) =>
            yargs.positional('queueName', {
                type: 'string',
                describe: 'The name of the queue',
            }),
        (argv) =>
            requireArgsAndRun(
                argv,
                ['queueName'],
                elasticMQ.purgeQueue.bind(elasticMQ),
                [argv.queueName as string]
            )
    )
    .command(
        'send <queueName> [messageBody]',
        'Send a message to a queue',
        (yargs) =>
            yargs
                .positional('queueName', {
                    type: 'string',
                    describe: 'The name of the queue',
                })
                .positional('messageBody', {
                    type: 'string',
                    describe:
                        'The message body to send (optional, defaults to stdin input if piped)',
                })
                .option('sns', {
                    type: 'boolean',
                    default: false,
                    describe:
                        'Mimic an SNS message payload wrapping the message body (optional)',
                }),
        async (argv) => {
            const messageBody = argv.messageBody ?? (await readStdin())
            return requireArgsAndRun(
                argv,
                ['queueName'],
                elasticMQ.sendMessage.bind(elasticMQ),
                [argv.queueName as string, { messageBody }, argv.sns]
            )
        }
    )
    .command(
        'receive <queueName>',
        'Receive messages from a queue',
        (yargs) =>
            yargs.positional('queueName', {
                type: 'string',
                describe: 'The name of the queue',
            }),
        (argv) =>
            requireArgsAndRun(
                argv,
                ['queueName'],
                elasticMQ.receiveMessage.bind(elasticMQ),
                [argv.queueName as string]
            )
    )
    .command(
        'getQueueUrl <queueName>',
        'Get the URL for a queue',
        (yargs) =>
            yargs.positional('queueName', {
                type: 'string',
                describe: 'The name of the queue',
            }),
        (argv) =>
            requireArgsAndRun(
                argv,
                ['queueName'],
                elasticMQ.getQueueUrl.bind(elasticMQ),
                [argv.queueName as string]
            )
    )
    .command(
        'getQueueAttributes <queueName>',
        'Get attributes of a queue',
        (yargs) =>
            yargs.positional('queueName', {
                type: 'string',
                describe: 'The name of the queue',
            }),
        (argv) =>
            requireArgsAndRun(
                argv,
                ['queueName'],
                elasticMQ.getQueueAttributes.bind(elasticMQ),
                [argv.queueName as string]
            )
    )
    .command(
        'up',
        'Run ElasticMQ in Docker',
        (yargs) =>
            yargs
                .option('api-port', {
                    type: 'number',
                    default: 9324,
                    describe:
                        'The REST-SQS API port for ElasticMQ (default: 9324)',
                })
                .option('ui-port', {
                    type: 'number',
                    default: 9325,
                    describe: 'The UI port for ElasticMQ (default: 9325)',
                })
                .option('force', {
                    alias: 'f',
                    type: 'boolean',
                    default: false,
                    describe:
                        'Forcefully kill any process running on the ElasticMQ ports before starting',
                }),
        (argv) => {
            if (!checkDockerInstalled()) return
            const { apiPort, uiPort } = argv

            // If --force is set, try to kill any process running on the specified ports.
            if (argv.force) {
                console.log(
                    'Force mode enabled. Checking and terminating processes on specified ports if any are running...'
                )
                killProcessOnPort(apiPort)
                killProcessOnPort(uiPort)
            }

            console.log(
                `Starting ElasticMQ on ports ${apiPort} (API) and ${uiPort} (UI)...`
            )

            const docker = spawn('docker', [
                'run',
                '-itd',
                `-p${apiPort}:9324`,
                `-p${uiPort}:9325`,
                'softwaremill/elasticmq',
            ])

            docker.stdout.on('data', (data) => {
                console.log(`Docker output: ${data}`)
            })

            docker.stderr.on('data', (data) => {
                console.error(`Docker error: ${data}`)
            })

            docker.on('close', (code) => {
                if (code === 0) {
                    console.log('ElasticMQ started successfully in Docker ✨')
                } else {
                    console.error(
                        `ElasticMQ failed to start in Docker with exit code ${code}.`
                    )
                }
            })
        }
    )
    .demandCommand()
    .help().argv
