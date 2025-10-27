import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Copy, Check, Download, RotateCcw, Sparkles, FileText } from 'lucide-react';
import { copyToClipboard, getWordCount, getCharacterCount } from '@/lib/textUtils';
import { cn } from '@/lib/utils';

interface SummaryOutputSectionProps {
    summary: string | null;
    isGenerating: boolean;
    onClear: () => void;
    className?: string;
}

export const SummaryOutputSection = ({ summary, isGenerating, onClear, className }: SummaryOutputSectionProps) => {
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = async () => {
        if (!summary) return;

        const success = await copyToClipboard(summary);
        if (success) {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        }
    };

    const handleDownload = () => {
        if (!summary) return;

        const blob = new Blob([summary], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `summary-${Date.now()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const wordCount = summary ? getWordCount(summary) : 0;
    const characterCount = summary ? getCharacterCount(summary) : 0;

    return (
        <Card className={cn('h-full', className)}>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-4'>
                <CardTitle className='flex items-center gap-2 text-lg font-semibold'>
                    <Sparkles className='h-5 w-5' />
                    Generated Summary
                </CardTitle>
                {(summary || isGenerating) && (
                    <Button
                        variant='ghost'
                        size='sm'
                        onClick={onClear}
                        disabled={isGenerating}
                        className='h-8 w-8 p-0'
                    >
                        <RotateCcw className='h-4 w-4' />
                    </Button>
                )}
            </CardHeader>

            <CardContent className='space-y-4 flex-1 flex flex-col'>
                <div className='flex-1'>
                    {isGenerating ? (
                        <div className='space-y-3'>
                            <Skeleton className='h-4 w-full' />
                            <Skeleton className='h-4 w-5/6' />
                            <Skeleton className='h-4 w-4/5' />
                            <Skeleton className='h-4 w-full' />
                            <Skeleton className='h-4 w-3/4' />
                            <div className='flex items-center gap-2 mt-4'>
                                <div className='animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent' />
                                <span className='text-sm text-muted-foreground'>Generating your summary...</span>
                            </div>
                        </div>
                    ) : summary ? (
                        <div className='prose prose-sm max-w-none'>
                            <div className='bg-muted/30 rounded-lg p-4 min-h-[300px]'>
                                <p className='whitespace-pre-wrap leading-relaxed text-sm'>{summary}</p>
                            </div>
                        </div>
                    ) : (
                        <div className='flex flex-col items-center justify-center h-[300px] text-center space-y-4'>
                            <div className='rounded-full bg-muted/50 p-6'>
                                <FileText className='h-12 w-12 text-muted-foreground' />
                            </div>
                            <div className='space-y-2'>
                                <p className='text-lg font-medium text-muted-foreground'>The generated summary will</p>
                                <p className='text-sm text-muted-foreground max-w-sm'>appear here...</p>
                            </div>
                        </div>
                    )}
                </div>

                {summary && !isGenerating && (
                    <>
                        <div className='flex flex-wrap items-center justify-between gap-2 pt-2 border-t'>
                            <div className='flex flex-wrap gap-2'>
                                <Badge
                                    variant='secondary'
                                    className='text-xs'
                                >
                                    {wordCount} words
                                </Badge>
                                <Badge
                                    variant='secondary'
                                    className='text-xs'
                                >
                                    {characterCount} characters
                                </Badge>
                            </div>

                            <div className='flex gap-2'>
                                <Button
                                    variant='outline'
                                    size='sm'
                                    onClick={handleCopy}
                                    className='h-8'
                                    disabled={isGenerating}
                                >
                                    {isCopied ? <Check className='h-3 w-3 mr-1' /> : <Copy className='h-3 w-3 mr-1' />}
                                    {isCopied ? 'Copied!' : 'Copy'}
                                </Button>

                                <Button
                                    variant='outline'
                                    size='sm'
                                    onClick={handleDownload}
                                    className='h-8'
                                    disabled={isGenerating}
                                >
                                    <Download className='h-3 w-3 mr-1' />
                                    Download
                                </Button>
                            </div>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
};
