import { summaryService } from "../services/index.js";
import pick from "../utils/pick.js";
import { z } from 'zod';
const summarySchema = z.object({
    id: z.string(),
    originalText: z.string(),
    summary: z.string(),
    length: z.string(),
    style: z.string(),
    wordCount: z.number(),
    characterCount: z.number(),
    createdAt: z.string()
});
const summaryHistoryResultSchema = z.object({
    id: z.string(),
    originalText: z.string(),
    summary: z.string(),
    title: z.string().nullable(),
    wordCount: z.number(),
    characterCount: z.number(),
    createdAt: z.string()
});
const generateSummaryTool = {
    id: 'summary_generate',
    name: 'Generate Summary',
    description: 'Generate a text summary with specified parameters',
    inputSchema: z.object({
        text: z.string().min(1).max(10000),
        length: z.enum(['short', 'medium', 'long']).optional().default('medium'),
        style: z.enum(['paragraph', 'bullet', 'numbered']).optional().default('paragraph'),
        userId: z.number().int()
    }),
    outputSchema: summarySchema,
    fn: async (inputs) => {
        const summary = await summaryService.createSummary({
            originalText: inputs.text,
            length: inputs.length,
            style: inputs.style,
            userId: inputs.userId
        });
        return {
            id: summary.id.toString(),
            originalText: summary.originalText,
            summary: summary.summary,
            length: summary.length,
            style: summary.style,
            wordCount: summary.wordCount,
            characterCount: summary.characterCount,
            createdAt: summary.createdAt.toISOString()
        };
    }
};
const getSummaryHistoryTool = {
    id: 'summary_get_history',
    name: 'Get Summary History',
    description: "Get user's summary history with filtering and pagination",
    inputSchema: z.object({
        userId: z.number().int(),
        page: z.number().int().min(1).optional().default(1),
        limit: z.number().int().min(1).max(100).optional().default(10),
        search: z.string().optional(),
        dateFrom: z.string().datetime().optional(),
        dateTo: z.string().datetime().optional(),
        sortBy: z
            .enum(['newest', 'oldest', 'title', 'createdAt', 'updatedAt', 'wordCount', 'characterCount'])
            .optional()
            .default('newest')
    }),
    outputSchema: z.object({
        results: z.array(summaryHistoryResultSchema),
        page: z.number(),
        limit: z.number(),
        totalPages: z.number(),
        totalResults: z.number()
    }),
    fn: async (inputs) => {
        const filter = pick(inputs, ['search', 'dateFrom', 'dateTo']);
        const options = pick(inputs, ['page', 'limit', 'sortBy']);
        const result = await summaryService.querySummaries(filter, options, inputs.userId);
        // Transform the response to match API specification
        const transformedResults = result.results.map(summary => ({
            id: summary.id.toString(),
            originalText: summary.originalText,
            summary: summary.summary,
            title: summary.title,
            wordCount: summary.wordCount,
            characterCount: summary.characterCount,
            createdAt: summary.createdAt.toISOString()
        }));
        return {
            results: transformedResults,
            page: result.page,
            limit: result.limit,
            totalPages: result.totalPages,
            totalResults: result.totalResults
        };
    }
};
const getSummaryByIdTool = {
    id: 'summary_get_by_id',
    name: 'Get Summary By ID',
    description: 'Get a specific summary by its ID (user can only access their own summaries)',
    inputSchema: z.object({
        id: z.number().int(),
        userId: z.number().int()
    }),
    outputSchema: summaryHistoryResultSchema,
    fn: async (inputs) => {
        const summary = await summaryService.getSummaryById(inputs.id, inputs.userId);
        if (!summary) {
            throw new Error('Summary not found');
        }
        return {
            id: summary.id.toString(),
            originalText: summary.originalText,
            summary: summary.summary,
            title: summary.title,
            wordCount: summary.wordCount,
            characterCount: summary.characterCount,
            createdAt: summary.createdAt.toISOString()
        };
    }
};
const deleteSummaryTool = {
    id: 'summary_delete',
    name: 'Delete Summary',
    description: 'Delete a specific summary by its ID (user can only delete their own summaries)',
    inputSchema: z.object({
        id: z.number().int(),
        userId: z.number().int()
    }),
    outputSchema: z.object({
        success: z.boolean()
    }),
    fn: async (inputs) => {
        await summaryService.deleteSummaryById(inputs.id, inputs.userId);
        return { success: true };
    }
};
export const summaryTools = [
    generateSummaryTool,
    getSummaryHistoryTool,
    getSummaryByIdTool,
    deleteSummaryTool
];
