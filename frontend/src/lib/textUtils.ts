export const MIN_TEXT_LENGTH = 10;
export const MAX_TEXT_LENGTH = 10000;

export const validateText = (text: string): { isValid: boolean; error?: string } => {
    if (!text || text.trim().length === 0) {
        return { isValid: false, error: 'Please enter some text to summarize' };
    }

    if (text.trim().length < MIN_TEXT_LENGTH) {
        return { isValid: false, error: `Text must be at least ${MIN_TEXT_LENGTH} characters long` };
    }

    if (text.length > MAX_TEXT_LENGTH) {
        return { isValid: false, error: `Text cannot exceed ${MAX_TEXT_LENGTH} characters` };
    }

    return { isValid: true };
};

export const getWordCount = (text: string): number => {
    if (!text || text.trim().length === 0) return 0;
    return text.trim().split(/\s+/).length;
};

export const getCharacterCount = (text: string): number => {
    return text.length;
};

export const formatWordCount = (count: number): string => {
    return `${count} ${count === 1 ? 'word' : 'words'}`;
};

export const formatCharacterCount = (count: number): string => {
    return `${count} ${count === 1 ? 'character' : 'characters'}`;
};

export const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (error) {
        console.error('Failed to copy text to clipboard:', error);
        return false;
    }
};

export const generateTextStatistics = (text: string) => {
    const words = getWordCount(text);
    const characters = getCharacterCount(text);
    const charactersNoSpaces = text.replace(/\s/g, '').length;
    const sentences = text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0).length;
    const paragraphs = text.split(/\n\s*\n/).filter(paragraph => paragraph.trim().length > 0).length;

    return {
        words,
        characters,
        charactersNoSpaces,
        sentences,
        paragraphs
    };
};
