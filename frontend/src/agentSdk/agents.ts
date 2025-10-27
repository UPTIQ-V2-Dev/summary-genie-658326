import { type ZodSchema, z } from 'zod';

type TriggerEvent =
    | {
          type: 'async';
          name: string;
          description: string;
      }
    | {
          type: 'sync';
          name: string;
          description: string;
          outputSchema: ZodSchema;
      };

export type AgentConfig = {
    id: string;
    name: string;
    description: string;
    triggerEvents: TriggerEvent[];
    config: {
        appId: string;
        accountId: string;
        widgetKey: string;
    };
};

export const AGENT_CONFIGS: AgentConfig[] = [
    {
        id: '3e8b514a-bfd6-408c-9f21-6a735a9b8926',
        name: 'Summary Provider Agent',
        description: 'An AI agent designed to generate concise and accurate summaries from text.',
        triggerEvents: [
            {
                type: 'sync',
                name: 'Original Text Input textbox',
                description:
                    'user can enter row data in Original Text Input then should be input for agent "Summary Provider Agent" and provide output in Generated Summary.',
                outputSchema: z.object({
                    summary: z.string().describe('The generated summary text')
                })
            }
        ],
        config: {
            appId: 'sagar-test',
            accountId: '03eb9ecc-c83e-4471-a489-9ae04ba4c012',
            widgetKey: '3hM6TZxBPiMSKE2eCqY2YXwL5bnVR8WkMfQnG4qL'
        }
    }
];
