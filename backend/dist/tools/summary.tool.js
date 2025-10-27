import { summaryService } from "../services/index.js";
import pick from "../utils/pick.js";
import { z } from 'zod';
const summarySchema = z.object({
    id: z.number(),
    originalText: z.string(),
    summary: z.string(),
    length: z.string(),
    style: z.string(),
    wordCount: z.number(),
    characterCount: z.number(),
    title: z.string().nullable(),
    createdAt: z.string(),
    updatedAt: z.string(),
    userId: z.number()
});
const createSummaryTool = {
    id: 'summary_create',
    name: 'Create Summary',
    description: 'Generate a new AI text summary with specified parameters',
    inputSchema: z.object({
        originalText: z.string().min(10).max(50000),
        length: z.enum(['short', 'medium', 'long']).default('medium'),
        style: z.enum(['paragraph', 'bullets', 'outline']).default('paragraph'),
        userId: z.number().int()
    }),
    outputSchema: summarySchema,
    fn: async (inputs) => {
        const summary = await summaryService.createSummary({
            originalText: inputs.originalText,
            length: inputs.length,
            style: inputs.style,
            userId: inputs.userId
        });
        return {
            ...summary,
            createdAt: summary.createdAt.toISOString(),
            updatedAt: summary.updatedAt.toISOString()
        };
    }
};
const getSummariesTool = {
    id: 'summary_get_all',
    name: 'Get All Summaries',
    description: 'Get user summaries with optional filters and pagination',
    inputSchema: z.object({
        userId: z.number().int(),
        search: z.string().optional(),
        dateFrom: z.string().optional(),
        dateTo: z.string().optional(),
        sortBy: z.string().optional(),
        limit: z.number().int().optional(),
        page: z.number().int().optional()
    }),
    outputSchema: z.object({
        results: z.array(summarySchema),
        page: z.number(),
        limit: z.number(),
        totalPages: z.number(),
        totalResults: z.number()
    }),
    fn: async (inputs) => {
        const filter = pick(inputs, ['search', 'dateFrom', 'dateTo']);
        filter.userId = inputs.userId;
        const options = pick(inputs, ['sortBy', 'limit', 'page']);
        const result = await summaryService.querySummaries(filter, options);
        return {
            ...result,
            results: result.results.map(summary => ({
                ...summary,
                createdAt: summary.createdAt.toISOString(),
                updatedAt: summary.updatedAt.toISOString()
            }))
        };
    }
};
const getSummaryTool = {
    id: 'summary_get_by_id',
    name: 'Get Summary By ID',
    description: 'Get a single summary by its ID',
    inputSchema: z.object({
        summaryId: z.number().int(),
        userId: z.number().int()
    }),
    outputSchema: summarySchema,
    fn: async (inputs) => {
        const summary = await summaryService.getSummaryById(inputs.summaryId);
        if (!summary) {
            throw new Error('Summary not found');
        }
        // Check if summary belongs to the user
        if (summary.userId !== inputs.userId) {
            throw new Error('Access denied - summary does not belong to user');
        }
        return {
            ...summary,
            createdAt: summary.createdAt.toISOString(),
            updatedAt: summary.updatedAt.toISOString()
        };
    }
};
const updateSummaryTool = {
    id: 'summary_update',
    name: 'Update Summary',
    description: 'Update summary information by ID',
    inputSchema: z.object({
        summaryId: z.number().int(),
        userId: z.number().int(),
        title: z.string().min(1).max(200).optional()
    }),
    outputSchema: summarySchema,
    fn: async (inputs) => {
        const existingSummary = await summaryService.getSummaryById(inputs.summaryId);
        if (!existingSummary) {
            throw new Error('Summary not found');
        }
        // Check if summary belongs to the user
        if (existingSummary.userId !== inputs.userId) {
            throw new Error('Access denied - summary does not belong to user');
        }
        const updateBody = pick(inputs, ['title']);
        const summary = await summaryService.updateSummaryById(inputs.summaryId, updateBody);
        return {
            ...summary,
            createdAt: summary.createdAt.toISOString(),
            updatedAt: summary.updatedAt.toISOString()
        };
    }
};
const deleteSummaryTool = {
    id: 'summary_delete',
    name: 'Delete Summary',
    description: 'Delete a summary by its ID',
    inputSchema: z.object({
        summaryId: z.number().int(),
        userId: z.number().int()
    }),
    outputSchema: z.object({
        success: z.boolean()
    }),
    fn: async (inputs) => {
        const existingSummary = await summaryService.getSummaryById(inputs.summaryId);
        if (!existingSummary) {
            throw new Error('Summary not found');
        }
        // Check if summary belongs to the user
        if (existingSummary.userId !== inputs.userId) {
            throw new Error('Access denied - summary does not belong to user');
        }
        await summaryService.deleteSummaryById(inputs.summaryId);
        return { success: true };
    }
};
const generateTextSummaryTool = {
    id: 'summary_generate_text',
    name: 'Generate Text Summary',
    description: 'Generate AI text summary without saving to database',
    inputSchema: z.object({
        text: z.string().min(10).max(50000),
        length: z.enum(['short', 'medium', 'long']).default('medium'),
        style: z.enum(['paragraph', 'bullets', 'outline']).default('paragraph')
    }),
    outputSchema: z.object({
        summary: z.string(),
        wordCount: z.number(),
        characterCount: z.number()
    }),
    fn: (inputs) => {
        const result = summaryService.generateTextSummary(inputs.text, inputs.length || 'medium', inputs.style || 'paragraph');
        return result;
    }
};
export const summaryTools = [
    createSummaryTool,
    getSummariesTool,
    getSummaryTool,
    updateSummaryTool,
    deleteSummaryTool,
    generateTextSummaryTool
];
