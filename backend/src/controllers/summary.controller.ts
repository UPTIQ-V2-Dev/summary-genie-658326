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

    // Filter by authenticated user
    filter.userId = req.user.id;

    // Handle sortBy parameter
    if (options.sortBy === 'newest') {
        options.sortBy = 'createdAt';
        options.sortType = 'desc';
    } else if (options.sortBy === 'oldest') {
        options.sortBy = 'createdAt';
        options.sortType = 'asc';
    }

    const result = await summaryService.querySummaries(filter, options);

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
    const summary = await summaryService.getSummaryById(summaryId);

    if (!summary) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Summary not found');
    }

    // Check if summary belongs to authenticated user
    if (summary.userId !== req.user.id) {
        throw new ApiError(httpStatus.FORBIDDEN, 'Access denied');
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

const updateSummary = catchAsyncWithAuth(async (req, res) => {
    const summaryId = parseInt(req.params.id);
    const summary = await summaryService.getSummaryById(summaryId);

    if (!summary) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Summary not found');
    }

    // Check if summary belongs to authenticated user
    if (summary.userId !== req.user.id) {
        throw new ApiError(httpStatus.FORBIDDEN, 'Access denied');
    }

    const updatedSummary = await summaryService.updateSummaryById(summaryId, req.body);

    res.send({
        id: updatedSummary.id.toString(),
        originalText: updatedSummary.originalText,
        summary: updatedSummary.summary,
        title: updatedSummary.title,
        wordCount: updatedSummary.wordCount,
        characterCount: updatedSummary.characterCount,
        createdAt: updatedSummary.createdAt.toISOString(),
        updatedAt: updatedSummary.updatedAt.toISOString()
    });
});

const deleteSummary = catchAsyncWithAuth(async (req, res) => {
    const summaryId = parseInt(req.params.id);
    const summary = await summaryService.getSummaryById(summaryId);

    if (!summary) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Summary not found');
    }

    // Check if summary belongs to authenticated user
    if (summary.userId !== req.user.id) {
        throw new ApiError(httpStatus.FORBIDDEN, 'Access denied');
    }

    await summaryService.deleteSummaryById(summaryId);
    res.status(httpStatus.NO_CONTENT).send();
});

export default {
    generateSummary,
    getSummaryHistory,
    getSummaryById,
    updateSummary,
    deleteSummary
};
