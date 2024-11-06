# localsqs

A basic CLI wrapper for ElasticMQ designed for mocking SQS locally.

## Table of contents

-   [Overview](#overview)
-   [Installation](#installation)
-   [Usage](#usage)
    -   [Commands](#commands)
    -   [Examples](#examples)
-   [Configuration](#configuration)
-   [Error Handling](#error-handling)
-   [Development](#development)
-   [License](#license)

## Overview

`localsqs` is a command-line tool for interacting with ElasticMQ, which provides a local, in-memory implementation of Amazon SQS. It allows developers to test and mock SQS behavior locally without needing AWS infrastructure.

This tool uses the ElasticMQ REST API to interact with queues, send and receive messages, and manage queue attributes.

## Usage

```bash
npx localsqs --help
```

You can use the CLI with the command `npx localsqs`.

### Commands \<required arg\> \[optional arg\]

-   `up`: Start [ElasticMQ](https://github.com/softwaremill/elasticmq) in [Docker](https://smallsharpsoftwaretools.com/tutorials/use-colima-to-run-docker-containers-on-macos/).
    > Options:
    >
    > -   `--api-port (default: 9324)`: Port for the REST-SQS API.
    > -   `--ui-port (default: 9325)`: Port for the UI.
    > -   `--force` or `-f`: Forcefully terminate processes occupying specified ports before starting.
-   `createQueue <queueName>`: Create a new SQS queue.
-   `deleteQueue <queueName>`: Delete a specified queue.
-   `listQueues [namePrefix]`: List all queues or filter by prefix.
-   `purgeQueue <queueName>`: Purge all messages from a specified queue.
-   `send <queueName> [messageBody]`: Send a message to a queue. You can provide messageBody as a JSON string or pipe JSON data.
    > Options:
    >
    > -   `--sns`: Will wrap the payload in a SNS-like message format.
-   `receive <queueName>`: Receive messages from a specified queue.
-   `getQueueUrl <queueName>`: Get the URL for a specified queue.
-   `getQueueAttributes <queueName>`: Retrieve attributes of a queue.

> 💡 Type `--help` after any command to see the available options.

### Examples

#### Start ElasticMQ

```bash
npx localsqs up
```

##### With custom ports

```bash
npx localsqs up --api-port 9334 --ui-port 9335 --force
```

#### Create a queue

```bash
npx localsqs createQueue myQueue
```

#### Send a message

```bash
npx localsqs send myQueue "hello world" --sns
```

##### With piped input

```bash
cat message.json | npx localsqs send myQueue --sns
```

#### Read the messages in a queue

```bash
npx localsqs receive myQueue
```

#### List all queues

```bash
npx localsqs listQueues
```

### Configuration

The tool defaults to connecting to ElasticMQ on http://127.0.0.1:9324 for the API and http://127.0.0.1:9325 for the UI.

> 💡 Use the `--api` option on a command to override the default API URL.

### Error handling

`localsqs` uses [fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) for API requests.

A common error is `ECONNREFUSED`, which may occur if ElasticMQ is not running or if there is an issue with the specified API port. Non-200 HTTP responses from ElasticMQ will also trigger errors.

### Development

1. Clone the repository and install dependencies.
1. Build the project:
    ```bash
    npm run build
    ```
1. Link the project for CLI testing:
    ```bash
    npm link
    ```
1. You can now use `localsqs` as a command.
