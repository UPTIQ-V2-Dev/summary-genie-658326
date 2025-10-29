import { summaryService } from '../services/index.ts';
import ApiError from '../utils/ApiError.ts';
import catchAsyncWithAuth from '../utils/catchAsyncWithAuth.ts';
import pick from '../utils/pick.ts';
import httpStatus from 'http-status';

const generateSummary = catchAsyncWithAuth(async (req, res) => {
    const { text, length, style } = req.body;
    const userId = req.user.id;

    const summary = await summaryService.createSummary({
        originalText: text,
        length,
        style,
        userId
    });

    res.status(httpStatus.CREATED).send({
        id: summary.id.toString(),
        originalText: summary.originalText,
        summary: summary.summary,
        length: summary.length,
        style: summary.style,
        wordCount: summary.wordCount,
        characterCount: summary.characterCount,
        createdAt: summary.createdAt.toISOString()
    });
});

const getSummaryHistory = catchAsyncWithAuth(async (req, res) => {
    const filter = pick(req.validatedQuery, ['search', 'dateFrom', 'dateTo']);
    const options = pick(req.validatedQuery, ['sortBy', 'limit', 'page']);

    const result = await summaryService.querySummaries(filter, options, req.user.id);

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

    res.send({
        results: transformedResults,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
        totalResults: result.totalResults
    });
});

const getSummaryById = catchAsyncWithAuth(async (req, res) => {
    const summaryId = parseInt(req.params.id);
    const summary = await summaryService.getSummaryById(summaryId, req.user.id);

    if (!summary) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Summary not found');
    }

    res.send({
        id: summary.id.toString(),
        originalText: summary.originalText,
        summary: summary.summary,
        title: summary.title,
        wordCount: summary.wordCount,
        characterCount: summary.characterCount,
        createdAt: summary.createdAt.toISOString()
    });
});

const deleteSummary = catchAsyncWithAuth(async (req, res) => {
    const summaryId = parseInt(req.params.id);
    await summaryService.deleteSummaryById(summaryId, req.user.id);
    res.status(httpStatus.NO_CONTENT).send();
});

export default {
    generateSummary,
    getSummaryHistory,
    getSummaryById,
    deleteSummary
};
