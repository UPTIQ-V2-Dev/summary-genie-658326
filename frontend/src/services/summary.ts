import { api } from '@/lib/api';
import type { SummaryResponse, SummaryHistoryItem, SummaryFilters, GenerateSummaryParams } from '@/types/summary';
import type { PaginatedResponse } from '@/types/api';
import { mockSummaryResponse, mockSummaryHistory } from '@/data/mockData';

export const generateSummary = async (params: GenerateSummaryParams): Promise<SummaryResponse> => {
    if (import.meta.env.VITE_USE_MOCK_DATA === 'true') {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        return {
            ...mockSummaryResponse,
            id: Date.now().toString(),
            originalText: params.text,
            summary: `This is a generated summary of your text: "${params.text.substring(0, 100)}${params.text.length > 100 ? '...' : ''}" The summary provides a concise overview of the main points and key information contained in the original text.`,
            length: params.length || 'medium',
            style: params.style || 'paragraph',
            wordCount: params.text.split(' ').length,
            characterCount: params.text.length,
            createdAt: new Date().toISOString()
        };
    }

    const response = await api.post('/api/summary/generate', {
        text: params.text,
        length: params.length || 'medium',
        style: params.style || 'paragraph'
    });

    return response.data;
};

export const getSummaryHistory = async (
    page = 1,
    limit = 10,
    filters?: SummaryFilters
): Promise<PaginatedResponse<SummaryHistoryItem>> => {
    if (import.meta.env.VITE_USE_MOCK_DATA === 'true') {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));

        let filteredHistory = [...mockSummaryHistory];

        if (filters?.search) {
            const searchTerm = filters.search.toLowerCase();
            filteredHistory = filteredHistory.filter(
                item =>
                    item.title?.toLowerCase().includes(searchTerm) ||
                    item.summary.toLowerCase().includes(searchTerm) ||
                    item.originalText.toLowerCase().includes(searchTerm)
            );
        }

        if (filters?.sortBy) {
            filteredHistory.sort((a, b) => {
                switch (filters.sortBy) {
                    case 'newest':
                        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                    case 'oldest':
                        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                    case 'shortest':
                        return a.characterCount - b.characterCount;
                    case 'longest':
                        return b.characterCount - a.characterCount;
                    default:
                        return 0;
                }
            });
        }

        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedResults = filteredHistory.slice(startIndex, endIndex);

        return {
            results: paginatedResults,
            page,
            limit,
            totalPages: Math.ceil(filteredHistory.length / limit),
            totalResults: filteredHistory.length
        };
    }

    const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(filters?.search && { search: filters.search }),
        ...(filters?.dateFrom && { dateFrom: filters.dateFrom }),
        ...(filters?.dateTo && { dateTo: filters.dateTo }),
        ...(filters?.sortBy && { sortBy: filters.sortBy })
    });

    const response = await api.get(`/api/summary/history?${queryParams}`);
    return response.data;
};

export const deleteSummary = async (id: string): Promise<void> => {
    if (import.meta.env.VITE_USE_MOCK_DATA === 'true') {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 300));
        return;
    }

    await api.delete(`/api/summary/${id}`);
};

export const getSummaryById = async (id: string): Promise<SummaryHistoryItem> => {
    if (import.meta.env.VITE_USE_MOCK_DATA === 'true') {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 300));

        const summary = mockSummaryHistory.find(item => item.id === id);
        if (!summary) {
            throw new Error('Summary not found');
        }
        return summary;
    }

    const response = await api.get(`/api/summary/${id}`);
    return response.data;
};
