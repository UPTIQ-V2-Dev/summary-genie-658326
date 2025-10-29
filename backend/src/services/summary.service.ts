import prisma from '../client.ts';
import { Prisma, Summary } from '../generated/prisma/index.js';
import ApiError from '../utils/ApiError.ts';
import httpStatus from 'http-status';

/**
 * Generate AI text summary
 * @param {string} text - Text to summarize
 * @param {string} length - Summary length (short, medium, long)
 * @param {string} style - Summary style (paragraph, bullets, outline)
 * @returns {{summary: string, wordCount: number, characterCount: number}}
 */
const generateTextSummary = (
    text: string,
    length: string = 'medium',
    style: string = 'paragraph'
): { summary: string; wordCount: number; characterCount: number } => {
    // Mock AI implementation - replace with actual AI service
    const lengthMultiplier = length === 'short' ? 0.2 : length === 'medium' ? 0.4 : 0.6;
    const words = text.split(/\s+/);
    const targetWords = Math.max(10, Math.floor(words.length * lengthMultiplier));

    let summary: string;
    if (style === 'bullet') {
        const bulletPoints = Math.min(5, Math.max(3, Math.floor(targetWords / 10)));
        const pointLength = Math.floor(targetWords / bulletPoints);
        summary = Array.from({ length: bulletPoints }, (_, i) => {
            const start = i * pointLength;
            const end = Math.min(start + pointLength, words.length);
            return `• ${words.slice(start, end).join(' ')}`;
        }).join('\n');
    } else if (style === 'numbered') {
        const sections = Math.min(4, Math.max(2, Math.floor(targetWords / 15)));
        const sectionLength = Math.floor(targetWords / sections);
        summary = Array.from({ length: sections }, (_, i) => {
            const start = i * sectionLength;
            const end = Math.min(start + sectionLength, words.length);
            return `${i + 1}. ${words.slice(start, end).join(' ')}`;
        }).join('\n');
    } else {
        // paragraph style
        summary = words.slice(0, targetWords).join(' ') + (words.length > targetWords ? '...' : '');
    }

    const summaryWords = summary.split(/\s+/).filter(word => word.length > 0);
    return {
        summary,
        wordCount: summaryWords.length,
        characterCount: summary.length
    };
};

/**
 * Create a summary
 * @param {Object} summaryData
 * @returns {Promise<Summary>}
 */
const createSummary = async (summaryData: {
    originalText: string;
    length?: string;
    style?: string;
    userId: number;
}): Promise<Summary> => {
    // Validate input
    if (!summaryData.originalText || summaryData.originalText.trim().length === 0) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Text cannot be empty');
    }

    if (summaryData.originalText.length > 10000) {
        throw new ApiError(httpStatus.UNPROCESSABLE_ENTITY, 'Text too long or invalid parameters');
    }

    const length = summaryData.length || 'medium';
    const style = summaryData.style || 'paragraph';

    const { summary, wordCount, characterCount } = generateTextSummary(summaryData.originalText, length, style);

    // Generate a title from the first few words
    const words = summaryData.originalText.split(/\s+/).slice(0, 5);
    const title = words.join(' ') + (summaryData.originalText.split(/\s+/).length > 5 ? '...' : '');

    return await prisma.summary.create({
        data: {
            originalText: summaryData.originalText,
            summary,
            length,
            style,
            wordCount,
            characterCount,
            title,
            userId: summaryData.userId
        }
    });
};

/**
 * Query for summaries
 * @param {Object} filter - Prisma filter
 * @param {Object} options - Query options
 * @param {number} userId - User ID to filter by
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const querySummaries = async (
    filter: any,
    options: {
        limit?: number;
        page?: number;
        sortBy?: string;
        sortType?: 'asc' | 'desc';
    },
    userId: number
): Promise<{
    results: Summary[];
    page: number;
    limit: number;
    totalPages: number;
    totalResults: number;
}> => {
    const page = options.page ?? 1;
    const limit = options.limit ?? 10;
    const sortBy = options.sortBy || 'createdAt';
    const sortType = options.sortType ?? 'desc';

    // Build where clause for search and date filters
    const whereClause: any = {
        userId, // Ensure user can only see their own summaries
        ...filter
    };

    if (filter.search) {
        whereClause.OR = [
            { title: { contains: filter.search, mode: 'insensitive' } },
            { summary: { contains: filter.search, mode: 'insensitive' } },
            { originalText: { contains: filter.search, mode: 'insensitive' } }
        ];
        delete whereClause.search;
    }

    if (filter.dateFrom || filter.dateTo) {
        whereClause.createdAt = {};
        if (filter.dateFrom) {
            whereClause.createdAt.gte = new Date(filter.dateFrom);
        }
        if (filter.dateTo) {
            whereClause.createdAt.lte = new Date(filter.dateTo);
        }
        delete whereClause.dateFrom;
        delete whereClause.dateTo;
    }

    // Handle sortBy parameter based on API specification
    let orderBy: any = { createdAt: 'desc' }; // default
    if (sortBy === 'newest') {
        orderBy = { createdAt: 'desc' };
    } else if (sortBy === 'oldest') {
        orderBy = { createdAt: 'asc' };
    } else if (sortBy) {
        orderBy = { [sortBy]: sortType };
    }

    const [summaries, totalResults] = await Promise.all([
        prisma.summary.findMany({
            where: whereClause,
            skip: (page - 1) * limit,
            take: limit,
            orderBy
        }),
        prisma.summary.count({ where: whereClause })
    ]);

    const totalPages = Math.ceil(totalResults / limit);

    return {
        results: summaries,
        page,
        limit,
        totalPages,
        totalResults
    };
};

/**
 * Get summary by id
 * @param {number} id
 * @param {number} userId - User ID for authorization
 * @returns {Promise<Summary | null>}
 */
const getSummaryById = async (id: number, userId: number): Promise<Summary | null> => {
    return await prisma.summary.findFirst({
        where: { id, userId } // Ensure user can only access their own summaries
    });
};

/**
 * Update summary by id
 * @param {number} summaryId
 * @param {number} userId - User ID for authorization
 * @param {Object} updateBody
 * @returns {Promise<Summary>}
 */
const updateSummaryById = async (
    summaryId: number,
    userId: number,
    updateBody: Prisma.SummaryUpdateInput
): Promise<Summary> => {
    const summary = await getSummaryById(summaryId, userId);
    if (!summary) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Summary not found');
    }
    const updatedSummary = await prisma.summary.update({
        where: { id: summary.id },
        data: updateBody
    });
    return updatedSummary;
};

/**
 * Delete summary by id
 * @param {number} summaryId
 * @param {number} userId - User ID for authorization
 * @returns {Promise<Summary>}
 */
const deleteSummaryById = async (summaryId: number, userId: number): Promise<Summary> => {
    const summary = await getSummaryById(summaryId, userId);
    if (!summary) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Summary not found');
    }
    await prisma.summary.delete({ where: { id: summary.id } });
    return summary;
};

export default {
    createSummary,
    querySummaries,
    getSummaryById,
    updateSummaryById,
    deleteSummaryById,
    generateTextSummary
};
