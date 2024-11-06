import { z } from 'zod'

export const ELASTICMQ_API_VERSION = '2012-11-05'

export const zBaseActionSchema = z.object({
    Version: z.literal(ELASTICMQ_API_VERSION).optional(),
})

export const zQueueNameSchema = z.object({
    QueueName: z.string(),
})

export const zQueueUrlSchema = z.object({
    QueueUrl: z.string().url().optional(),
})

export const zAddPermissionSchema = z
    .object({
        Action: z.string().default('AddPermission'),
        Label: z.string(),
        AWSAccountIds: z.array(z.string()),
        Actions: z.array(z.string()),
    })
    .merge(zBaseActionSchema)

export const zChangeMessageVisibilitySchema = z
    .object({
        Action: z.string().default('ChangeMessageVisibility'),
        ReceiptHandle: z.string(),
        VisibilityTimeout: z.number().int(),
    })
    .merge(zQueueUrlSchema)
    .merge(zBaseActionSchema)

export const zChangeMessageVisibilityBatchSchema = z
    .object({
        Action: z.string().default('ChangeMessageVisibilityBatch'),
        Entries: z.array(
            z.object({
                Id: z.string(),
                ReceiptHandle: z.string(),
                VisibilityTimeout: z.number().int(),
            })
        ),
    })
    .merge(zQueueUrlSchema)
    .merge(zBaseActionSchema)

export const zCreateQueueSchema = z
    .object({
        Action: z.string().default('CreateQueue'),
        QueueName: z.string(),
        Attributes: z.record(z.string()).optional(),
    })
    .merge(zBaseActionSchema)

export const zDeleteMessageSchema = z
    .object({
        Action: z.string().default('DeleteMessage'),
        ReceiptHandle: z.string(),
    })
    .merge(zQueueUrlSchema)
    .merge(zBaseActionSchema)

export const zDeleteMessageBatchSchema = z
    .object({
        Action: z.string().default('DeleteMessageBatch'),
        Entries: z.array(
            z.object({
                Id: z.string(),
                ReceiptHandle: z.string(),
            })
        ),
    })
    .merge(zQueueUrlSchema)
    .merge(zBaseActionSchema)

export const zDeleteQueueSchema = z
    .object({
        Action: z.string().default('DeleteQueue'),
    })
    .merge(zQueueUrlSchema)
    .merge(zBaseActionSchema)

export const zGetQueueUrlSchema = z
    .object({
        Action: z.string().default('GetQueueUrl'),
        QueueName: z.string(),
    })
    .merge(zBaseActionSchema)

export const zListQueuesSchema = z
    .object({
        Action: z.string().default('ListQueues'),
        QueueNamePrefix: z.string().optional(),
    })
    .merge(zBaseActionSchema)

export const zPurgeQueueSchema = z
    .object({
        Action: z.string().default('PurgeQueue'),
    })
    .merge(zQueueUrlSchema)
    .merge(zBaseActionSchema)

export const zGetQueueAttributesSchema = z
    .object({
        Action: z.string().default('GetQueueAttributes'),
        AttributeNames: z.array(z.string()).optional(),
    })
    .merge(zQueueUrlSchema)
    .merge(zBaseActionSchema)

export const zSetQueueAttributesSchema = z
    .object({
        Action: z.string().default('SetQueueAttributes'),
        Attributes: z.record(z.string()),
    })
    .merge(zQueueUrlSchema)
    .merge(zBaseActionSchema)

export const zReceiveMessageSchema = z
    .object({
        Action: z.string().default('ReceiveMessage'),
        MaxNumberOfMessages: z.number().int().optional(),
        VisibilityTimeout: z.number().int().optional(),
        WaitTimeSeconds: z.number().int().optional(),
        AttributeNames: z.array(z.string()).optional(),
        MessageAttributeNames: z.array(z.string()).optional(),
    })
    .merge(zQueueUrlSchema)
    .merge(zBaseActionSchema)

export const zRemovePermissionSchema = z
    .object({
        Action: z.string().default('RemovePermission'),
        Label: z.string(),
    })
    .merge(zQueueUrlSchema)
    .merge(zBaseActionSchema)

export const zSendMessageSchema = z
    .object({
        Action: z.string().default('SendMessage'),
        MessageBody: z.string(),
        DelaySeconds: z.number().int().optional(),
        MessageAttributes: z.record(z.any()).optional(),
    })
    .merge(zQueueUrlSchema)
    .merge(zBaseActionSchema)

export const zSendMessageBatchSchema = z
    .object({
        Action: z.string().default('SendMessageBatch'),
        Entries: z.array(
            z.object({
                Id: z.string(),
                MessageBody: z.string(),
                DelaySeconds: z.number().int().optional(),
                MessageAttributes: z.record(z.any()).optional(),
            })
        ),
    })
    .merge(zQueueUrlSchema)
    .merge(zBaseActionSchema)

export const zTagQueueSchema = z
    .object({
        Action: z.string().default('TagQueue'),
        Tags: z.record(z.string()),
    })
    .merge(zQueueUrlSchema)
    .merge(zBaseActionSchema)

export const zUntagQueueSchema = z
    .object({
        Action: z.string().default('UntagQueue'),
        TagKeys: z.array(z.string()),
    })
    .merge(zQueueUrlSchema)
    .merge(zBaseActionSchema)

export const zStartMessageMoveTaskSchema = z
    .object({
        Action: z.string().default('StartMessageMoveTask'),
        SourceArn: z.string(),
        DestinationArn: z.string(),
    })
    .merge(zBaseActionSchema)

export const zCancelMessageMoveTaskSchema = z
    .object({
        Action: z.string().default('CancelMessageMoveTask'),
        TaskHandle: z.string(),
    })
    .merge(zBaseActionSchema)

export const zListMessageMoveTasksSchema = z
    .object({
        Action: z.string().default('ListMessageMoveTasks'),
        SourceArn: z.string().optional(),
        DestinationArn: z.string().optional(),
    })
    .merge(zBaseActionSchema)

export type TQueueNameSchema = z.infer<typeof zQueueNameSchema>
export type TQueueUrlSchema = z.infer<typeof zQueueUrlSchema>
export type TAddPermissionSchema = z.infer<typeof zAddPermissionSchema>
export type TChangeMessageVisibilitySchema = z.infer<
    typeof zChangeMessageVisibilitySchema
>
export type TChangeMessageVisibilityBatchSchema = z.infer<
    typeof zChangeMessageVisibilityBatchSchema
>
export type TCreateQueueSchema = z.infer<typeof zCreateQueueSchema>
export type TDeleteMessageSchema = z.infer<typeof zDeleteMessageSchema>
export type TDeleteMessageBatchSchema = z.infer<
    typeof zDeleteMessageBatchSchema
>
export type TDeleteQueueSchema = z.infer<typeof zDeleteQueueSchema>
export type TGetQueueUrlSchema = z.infer<typeof zGetQueueUrlSchema>
export type TListQueuesSchema = z.infer<typeof zListQueuesSchema>
export type TPurgeQueueSchema = z.infer<typeof zPurgeQueueSchema>
export type TGetQueueAttributesSchema = z.infer<
    typeof zGetQueueAttributesSchema
>
export type TSetQueueAttributesSchema = z.infer<
    typeof zSetQueueAttributesSchema
>
export type TReceiveMessageSchema = z.infer<typeof zReceiveMessageSchema>
export type TRemovePermissionSchema = z.infer<typeof zRemovePermissionSchema>
export type TSendMessageSchema = z.infer<typeof zSendMessageSchema>
export type TSendMessageBatchSchema = z.infer<typeof zSendMessageBatchSchema>
export type TTagQueueSchema = z.infer<typeof zTagQueueSchema>
export type TUntagQueueSchema = z.infer<typeof zUntagQueueSchema>
export type TStartMessageMoveTaskSchema = z.infer<
    typeof zStartMessageMoveTaskSchema
>
export type TCancelMessageMoveTaskSchema = z.infer<
    typeof zCancelMessageMoveTaskSchema
>
export type TListMessageMoveTasksSchema = z.infer<
    typeof zListMessageMoveTasksSchema
>
export type TActionSchema =
    | TQueueNameSchema
    | TQueueUrlSchema
    | TAddPermissionSchema
    | TChangeMessageVisibilitySchema
    | TChangeMessageVisibilityBatchSchema
    | TCreateQueueSchema
    | TDeleteMessageSchema
    | TDeleteMessageBatchSchema
    | TDeleteQueueSchema
    | TGetQueueUrlSchema
    | TListQueuesSchema
    | TPurgeQueueSchema
    | TGetQueueAttributesSchema
    | TSetQueueAttributesSchema
    | TReceiveMessageSchema
    | TRemovePermissionSchema
    | TSendMessageSchema
    | TSendMessageBatchSchema
    | TTagQueueSchema
    | TUntagQueueSchema
    | TStartMessageMoveTaskSchema
    | TCancelMessageMoveTaskSchema
    | TListMessageMoveTasksSchema
