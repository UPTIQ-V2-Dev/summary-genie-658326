export interface SummaryRequest {
    text: string;
    length?: 'short' | 'medium' | 'long';
    style?: 'bullet' | 'paragraph' | 'key-points';
}

export interface SummaryResponse {
    id: string;
    originalText: string;
    summary: string;
    length: string;
    style: string;
    createdAt: string;
    wordCount: number;
    characterCount: number;
}

export interface SummaryState {
    inputText: string;
    summary: string | null;
    isGenerating: boolean;
    error: string | null;
    wordCount: number;
    characterCount: number;
}

export interface SummaryHistoryItem {
    id: string;
    originalText: string;
    summary: string;
    createdAt: string;
    wordCount: number;
    characterCount: number;
    title?: string;
}

export interface SummaryFilters {
    search?: string;
    dateFrom?: string;
    dateTo?: string;
    sortBy?: 'newest' | 'oldest' | 'shortest' | 'longest';
}

export interface GenerateSummaryParams {
    text: string;
    length?: 'short' | 'medium' | 'long';
    style?: 'bullet' | 'paragraph' | 'key-points';
}
