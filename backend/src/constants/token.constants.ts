export const TokenType = {
    ACCESS: 'ACCESS',
    REFRESH: 'REFRESH',
    RESET_PASSWORD: 'RESET_PASSWORD',
    VERIFY_EMAIL: 'VERIFY_EMAIL'
} as const;

export type TokenType = (typeof TokenType)[keyof typeof TokenType];
