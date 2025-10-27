import type { PaginatedResponse } from '@/types/api';
import type { AuthResponse, User } from '@/types/user';
import type { SummaryResponse, SummaryHistoryItem } from '@/types/summary';

export const mockUser: User = {
    id: 1,
    email: 'user@example.com',
    name: 'John Doe',
    role: 'USER',
    isEmailVerified: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
};

export const mockAdminUser: User = {
    id: 2,
    email: 'admin@example.com',
    name: 'Jane Smith',
    role: 'ADMIN',
    isEmailVerified: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
};

export const mockUsers: User[] = [mockUser, mockAdminUser];

export const mockAuthResponse: AuthResponse = {
    user: mockUser,
    tokens: {
        access: {
            token: 'mock-access-token',
            expires: new Date(Date.now() + 15 * 60 * 1000).toISOString()
        },
        refresh: {
            token: 'mock-refresh-token',
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        }
    }
};

export const mockPaginatedUsers: PaginatedResponse<User> = {
    results: mockUsers,
    page: 1,
    limit: 10,
    totalPages: 1,
    totalResults: 2
};

export const mockSummaryResponse: SummaryResponse = {
    id: '1',
    originalText:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
    summary:
        'Lorem ipsum is a placeholder text commonly used in the printing and typesetting industry. It demonstrates the visual form of a document without meaningful content, allowing designers to focus on layout and typography rather than content.',
    length: 'medium',
    style: 'paragraph',
    createdAt: new Date().toISOString(),
    wordCount: 69,
    characterCount: 445
};

export const mockSummaryHistory: SummaryHistoryItem[] = [
    {
        id: '1',
        title: 'Lorem Ipsum Summary',
        originalText: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit...',
        summary: 'Lorem ipsum is a placeholder text commonly used in the printing and typesetting industry.',
        createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        wordCount: 69,
        characterCount: 445
    },
    {
        id: '2',
        title: 'Project Requirements',
        originalText: 'The project requires implementing a React application with TypeScript...',
        summary: 'A React TypeScript application needs to be built with specific requirements and features.',
        createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        wordCount: 45,
        characterCount: 280
    },
    {
        id: '3',
        title: 'Meeting Notes',
        originalText: 'Today we discussed the upcoming features and timeline for the next quarter...',
        summary: 'Meeting covered quarterly planning, feature roadmap, and project timelines.',
        createdAt: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
        wordCount: 32,
        characterCount: 195
    }
];

export const mockPaginatedSummaryHistory: PaginatedResponse<SummaryHistoryItem> = {
    results: mockSummaryHistory,
    page: 1,
    limit: 10,
    totalPages: 1,
    totalResults: 3
};
