import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, FileText } from 'lucide-react';
import { validateText, getWordCount, getCharacterCount, MAX_TEXT_LENGTH } from '@/lib/textUtils';
import { cn } from '@/lib/utils';

interface TextInputSectionProps {
    value: string;
    onChange: (value: string) => void;
    onClear: () => void;
    isGenerating: boolean;
    className?: string;
}

export const TextInputSection = ({ value, onChange, onClear, isGenerating, className }: TextInputSectionProps) => {
    const wordCount = getWordCount(value);
    const characterCount = getCharacterCount(value);
    const validation = validateText(value);
    const isNearLimit = characterCount > MAX_TEXT_LENGTH * 0.9;

    return (
        <Card className={cn('h-full', className)}>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-4'>
                <CardTitle className='flex items-center gap-2 text-lg font-semibold'>
                    <FileText className='h-5 w-5' />
                    Original Text Input
                </CardTitle>
                {value.trim() && (
                    <Button
                        variant='ghost'
                        size='sm'
                        onClick={onClear}
                        disabled={isGenerating}
                        className='h-8 w-8 p-0'
                    >
                        <X className='h-4 w-4' />
                    </Button>
                )}
            </CardHeader>
            <CardContent className='space-y-4 flex-1 flex flex-col'>
                <div className='flex-1'>
                    <Textarea
                        placeholder='Paste or type the text you want to summarize here...'
                        value={value}
                        onChange={e => onChange(e.target.value)}
                        disabled={isGenerating}
                        className={cn(
                            'min-h-[300px] resize-none',
                            !validation.isValid && value.trim() && 'border-destructive'
                        )}
                        maxLength={MAX_TEXT_LENGTH}
                    />
                    {!validation.isValid && value.trim() && (
                        <p className='text-sm text-destructive mt-2'>{validation.error}</p>
                    )}
                </div>

                <div className='flex flex-wrap items-center justify-between gap-2 pt-2 border-t'>
                    <div className='flex flex-wrap gap-2'>
                        <Badge
                            variant='secondary'
                            className='text-xs'
                        >
                            {wordCount} words
                        </Badge>
                        <Badge
                            variant={isNearLimit ? 'destructive' : 'secondary'}
                            className='text-xs'
                        >
                            {characterCount}/{MAX_TEXT_LENGTH} characters
                        </Badge>
                    </div>

                    {value.trim() && (
                        <div className='text-xs text-muted-foreground'>
                            {validation.isValid ? (
                                <span className='text-green-600'>Ready to summarize</span>
                            ) : (
                                <span className='text-destructive'>Please fix errors above</span>
                            )}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
