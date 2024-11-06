import axios from 'axios'
import * as schemas from './schema'

export type MessageBody = string | {}

export class ElasticMQ {
    private apiUrl: URL

    // 127.0.0.1 over localhost to force fetch over IPv4.
    // fetch defaults to IPv6. localhost should resolve to both IPv4 and IPv6,
    // but some envs prioritise IPv6, which means ECONNREFUSED
    // if the service is only listening on IPv4 🤯
    constructor(elasticMqUrl: string = 'http://127.0.0.1:9324') {
        this.apiUrl = new URL(elasticMqUrl)
    }

    setApiUrl(url: string) {
        this.apiUrl = new URL(url)
    }

    private static transformPayload(
        payload: schemas.TActionSchema
    ): Record<string, string> {
        const result: Record<string, string> = {}

        const flatten = (obj: any, prefix = '') => {
            Object.keys(obj).forEach((key) => {
                const value = obj[key]
                const prefixedKey = prefix ? `${prefix}.${key}` : key

                if (
                    typeof value === 'object' &&
                    !Array.isArray(value) &&
                    value !== null
                ) {
                    flatten(value, prefixedKey)
                } else if (Array.isArray(value)) {
                    result[prefixedKey] = value.map(String).join(',')
                } else {
                    result[prefixedKey] = String(value)
                }
            })
        }

        flatten(payload)
        return result
    }

    private async api(
        endpoint: string,
        payload: schemas.TActionSchema
    ): Promise<void> {
        const url = new URL(endpoint, this.apiUrl)
        const formPayload = ElasticMQ.transformPayload(payload)
        const params = new URLSearchParams(formPayload)
        try {
            const response = await axios.post(
                url.toString(),
                params.toString(),
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                }
            )
            console.log('Done:', response.data)
        } catch (error) {
            console.error('Error with ElasticMQ API request:', error)
        }
    }

    static processMessageBody(
        messageBody: MessageBody,
        mockSNS: boolean = false
    ) {
        let body =
            typeof messageBody === 'string'
                ? messageBody
                : JSON.stringify(messageBody)
        return mockSNS ? JSON.stringify({ Message: body }) : body
    }

    async createQueue(queueName: string): Promise<void> {
        const payload: schemas.TCreateQueueSchema = {
            Action: 'CreateQueue',
            QueueName: queueName,
            // Version: schemas.ELASTICMQ_API_VERSION,
        }
        await this.api('/', payload)
    }

    async deleteQueue(queueName: string): Promise<void> {
        const payload: schemas.TDeleteQueueSchema = {
            Action: 'DeleteQueue',
            // Version: schemas.ELASTICMQ_API_VERSION,
        }
        await this.api(`/queue/${queueName}`, payload)
    }

    async sendMessage(
        queueName: string,
        entry: {
            messageBody: MessageBody
            delay?: number
            messageAttributes?: Record<string, any>
        },
        mockSNS: boolean = false
    ): Promise<void> {
        const payload: schemas.TSendMessageSchema = {
            Action: 'SendMessage',
            MessageBody: ElasticMQ.processMessageBody(
                entry.messageBody,
                mockSNS
            ),
            // Version: schemas.ELASTICMQ_API_VERSION,
        }
        if (entry.delay) payload['DelaySeconds'] = entry.delay
        if (entry.messageAttributes)
            payload['MessageAttributes'] = entry.messageAttributes
        await this.api(`/queue/${queueName}`, payload)
    }

    async receiveMessage(queueName: string): Promise<void> {
        const payload: schemas.TReceiveMessageSchema = {
            Action: 'ReceiveMessage',
            // Version: schemas.ELASTICMQ_API_VERSION,
        }
        await this.api(`/queue/${queueName}`, payload)
    }

    async deleteMessage(
        queueName: string,
        receiptHandle: string
    ): Promise<void> {
        const payload: schemas.TDeleteMessageSchema = {
            Action: 'DeleteMessage',
            ReceiptHandle: receiptHandle,
            // Version: schemas.ELASTICMQ_API_VERSION,
        }
        await this.api(`/queue/${queueName}`, payload)
    }

    async listQueues(namePrefix?: string): Promise<void> {
        const payload: schemas.TListQueuesSchema = {
            Action: 'ListQueues',
            // Version: schemas.ELASTICMQ_API_VERSION,
        }
        if (namePrefix) payload['QueueNamePrefix'] = namePrefix
        await this.api('/', payload)
    }

    async getQueueUrl(queueName: string): Promise<void> {
        const payload: schemas.TGetQueueUrlSchema = {
            Action: 'GetQueueUrl',
            QueueName: queueName,
            // Version: schemas.ELASTICMQ_API_VERSION,
        }
        await this.api('/', payload)
    }

    async getQueueAttributes(queueName: string): Promise<void> {
        const payload: schemas.TGetQueueAttributesSchema = {
            Action: 'GetQueueAttributes',
            // Version: schemas.ELASTICMQ_API_VERSION,
        }
        await this.api(`/queue/${queueName}`, payload)
    }

    async setQueueAttributes(
        queueName: string,
        attributes: Record<string, string>
    ): Promise<void> {
        const payload: schemas.TSetQueueAttributesSchema = {
            Action: 'SetQueueAttributes',
            Attributes: attributes,
            // Version: schemas.ELASTICMQ_API_VERSION,
        }
        await this.api(`/queue/${queueName}`, payload)
    }

    async purgeQueue(queueName: string): Promise<void> {
        const payload: schemas.TPurgeQueueSchema = {
            Action: 'PurgeQueue',
            // Version: schemas.ELASTICMQ_API_VERSION,
        }
        await this.api(`/queue/${queueName}`, payload)
    }

    async tagQueue(
        queueName: string,
        tags: Record<string, string>
    ): Promise<void> {
        const payload: schemas.TTagQueueSchema = {
            Action: 'TagQueue',
            Tags: tags,
            // Version: schemas.ELASTICMQ_API_VERSION,
        }
        await this.api(`/queue/${queueName}`, payload)
    }

    async untagQueue(queueName: string, tagKeys: string[]): Promise<void> {
        const payload: schemas.TUntagQueueSchema = {
            Action: 'UntagQueue',
            TagKeys: tagKeys,
            // Version: schemas.ELASTICMQ_API_VERSION,
        }
        await this.api(`/queue/${queueName}`, payload)
    }

    async startMessageMoveTask(
        sourceArn: string,
        destinationArn: string
    ): Promise<void> {
        const payload: schemas.TStartMessageMoveTaskSchema = {
            Action: 'StartMessageMoveTask',
            SourceArn: sourceArn,
            DestinationArn: destinationArn,
            // Version: schemas.ELASTICMQ_API_VERSION,
        }
        await this.api('/', payload)
    }

    async cancelMessageMoveTask(taskHandle: string): Promise<void> {
        const payload: schemas.TCancelMessageMoveTaskSchema = {
            Action: 'CancelMessageMoveTask',
            TaskHandle: taskHandle,
            // Version: schemas.ELASTICMQ_API_VERSION,
        }
        await this.api('/', payload)
    }

    async listMessageMoveTasks(
        sourceArn?: string,
        destinationArn?: string
    ): Promise<void> {
        const payload: schemas.TListMessageMoveTasksSchema = {
            Action: 'ListMessageMoveTasks',
            // Version: schemas.ELASTICMQ_API_VERSION,
        }
        if (sourceArn) payload['SourceArn'] = sourceArn
        if (destinationArn) payload['DestinationArn'] = destinationArn
        await this.api('/', payload)
    }

    async addPermission(
        queueName: string,
        label: string,
        awsAccountIds: string[],
        actions: string[]
    ): Promise<void> {
        const payload: schemas.TAddPermissionSchema = {
            Action: 'AddPermission',
            Label: label,
            AWSAccountIds: awsAccountIds,
            Actions: actions,
            // Version: schemas.ELASTICMQ_API_VERSION,
        }
        await this.api(`/queue/${queueName}`, payload)
    }

    async changeMessageVisibility(
        queueName: string,
        receiptHandle: string,
        visibilityTimeout: number
    ): Promise<void> {
        const payload: schemas.TChangeMessageVisibilitySchema = {
            Action: 'ChangeMessageVisibility',
            ReceiptHandle: receiptHandle,
            VisibilityTimeout: visibilityTimeout,
            // Version: schemas.ELASTICMQ_API_VERSION,
        }
        await this.api(`/queue/${queueName}`, payload)
    }

    async changeMessageVisibilityBatch(
        queueName: string,
        entries: {
            Id: string
            ReceiptHandle: string
            VisibilityTimeout: number
        }[]
    ): Promise<void> {
        const payload: schemas.TChangeMessageVisibilityBatchSchema = {
            Action: 'ChangeMessageVisibilityBatch',
            Entries: entries,
            // Version: schemas.ELASTICMQ_API_VERSION,
        }
        await this.api(`/queue/${queueName}`, payload)
    }

    async deleteMessageBatch(
        queueName: string,
        entries: { Id: string; ReceiptHandle: string }[]
    ): Promise<void> {
        const payload: schemas.TDeleteMessageBatchSchema = {
            Action: 'DeleteMessageBatch',
            Entries: entries,
            // Version: schemas.ELASTICMQ_API_VERSION,
        }
        await this.api(`/queue/${queueName}`, payload)
    }

    async removePermission(queueName: string, label: string): Promise<void> {
        const payload: schemas.TRemovePermissionSchema = {
            Action: 'RemovePermission',
            Label: label,
            // Version: schemas.ELASTICMQ_API_VERSION,
        }
        await this.api(`/queue/${queueName}`, payload)
    }

    async sendMessageBatch(
        queueName: string,
        entries: {
            Id: string
            MessageBody: MessageBody
            DelaySeconds?: number
            MessageAttributes?: Record<string, any>
        }[],
        mockSNS: boolean = false
    ): Promise<void> {
        const payload: schemas.TSendMessageBatchSchema = {
            Action: 'SendMessageBatch',
            Entries: entries.map((entry) => ({
                ...entry,
                MessageBody: ElasticMQ.processMessageBody(
                    entry.MessageBody,
                    mockSNS
                ),
            })),
            // Version: schemas.ELASTICMQ_API_VERSION,
        }
        await this.api(`/queue/${queueName}`, payload)
    }
}

export { schemas }
