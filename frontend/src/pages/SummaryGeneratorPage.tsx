import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowRight, Settings } from 'lucide-react';
import { TextInputSection } from '@/components/TextInputSection';
import { SummaryOutputSection } from '@/components/SummaryOutputSection';
import { generateSummary } from '@/services/summary';
import { validateText } from '@/lib/textUtils';
import { toast } from 'sonner';
import type { GenerateSummaryParams } from '@/types/summary';

export const SummaryGeneratorPage = () => {
    const [inputText, setInputText] = useState('');
    const [summary, setSummary] = useState<string | null>(null);
    const [summaryLength, setSummaryLength] = useState<'short' | 'medium' | 'long'>('medium');
    const [summaryStyle, setSummaryStyle] = useState<'bullet' | 'paragraph' | 'key-points'>('paragraph');

    const generateSummaryMutation = useMutation({
        mutationFn: (params: GenerateSummaryParams) => generateSummary(params),
        onSuccess: data => {
            setSummary(data.summary);
            toast.success('Summary generated successfully!');
        },
        onError: error => {
            console.error('Failed to generate summary:', error);
            toast.error('Failed to generate summary. Please try again.');
        }
    });

    const handleGenerateSummary = () => {
        const validation = validateText(inputText);
        if (!validation.isValid) {
            toast.error(validation.error);
            return;
        }

        generateSummaryMutation.mutate({
            text: inputText,
            length: summaryLength,
            style: summaryStyle
        });
    };

    const handleClearInput = () => {
        setInputText('');
    };

    const handleClearOutput = () => {
        setSummary(null);
    };

    const isGenerating = generateSummaryMutation.isPending;
    const canGenerate = inputText.trim().length > 0 && validateText(inputText).isValid && !isGenerating;

    return (
        <div className='min-h-screen bg-background'>
            <div className='container mx-auto p-6 max-w-7xl'>
                {/* Header */}
                <div className='mb-8'>
                    <h1 className='text-3xl font-bold tracking-tight mb-2'>AI Summary Generator</h1>
                    <p className='text-muted-foreground'>
                        Transform long text into concise, easy-to-understand summaries powered by AI
                    </p>
                </div>

                {/* Settings Panel */}
                <Card className='mb-6'>
                    <CardContent className='pt-6'>
                        <div className='flex items-center gap-2 mb-4'>
                            <Settings className='h-4 w-4' />
                            <Label className='text-sm font-medium'>Summary Options</Label>
                        </div>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                            <div className='space-y-2'>
                                <Label
                                    htmlFor='length-select'
                                    className='text-sm'
                                >
                                    Length
                                </Label>
                                <Select
                                    value={summaryLength}
                                    onValueChange={(value: 'short' | 'medium' | 'long') => setSummaryLength(value)}
                                    disabled={isGenerating}
                                >
                                    <SelectTrigger id='length-select'>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value='short'>Short - Quick overview</SelectItem>
                                        <SelectItem value='medium'>Medium - Balanced summary</SelectItem>
                                        <SelectItem value='long'>Long - Detailed summary</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className='space-y-2'>
                                <Label
                                    htmlFor='style-select'
                                    className='text-sm'
                                >
                                    Style
                                </Label>
                                <Select
                                    value={summaryStyle}
                                    onValueChange={(value: 'bullet' | 'paragraph' | 'key-points') =>
                                        setSummaryStyle(value)
                                    }
                                    disabled={isGenerating}
                                >
                                    <SelectTrigger id='style-select'>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value='paragraph'>Paragraph - Flowing text</SelectItem>
                                        <SelectItem value='bullet'>Bullet Points - Listed format</SelectItem>
                                        <SelectItem value='key-points'>Key Points - Main takeaways</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Main Content */}
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6'>
                    <TextInputSection
                        value={inputText}
                        onChange={setInputText}
                        onClear={handleClearInput}
                        isGenerating={isGenerating}
                    />

                    <SummaryOutputSection
                        summary={summary}
                        isGenerating={isGenerating}
                        onClear={handleClearOutput}
                    />
                </div>

                {/* Generate Button */}
                <div className='flex justify-center'>
                    <div className='flex items-center gap-4'>
                        <Separator className='w-16' />
                        <Button
                            onClick={handleGenerateSummary}
                            disabled={!canGenerate}
                            size='lg'
                            className='px-8 py-3 text-base font-medium'
                        >
                            {isGenerating ? (
                                <div className='flex items-center gap-2'>
                                    <div className='animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent' />
                                    Generating...
                                </div>
                            ) : (
                                <div className='flex items-center gap-2'>
                                    Generate Summary
                                    <ArrowRight className='h-4 w-4' />
                                </div>
                            )}
                        </Button>
                        <Separator className='w-16' />
                    </div>
                </div>

                {/* Usage Tips */}
                <div className='mt-12 bg-muted/30 rounded-lg p-6'>
                    <h3 className='font-semibold mb-3 text-sm uppercase tracking-wide text-muted-foreground'>
                        Tips for better summaries
                    </h3>
                    <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                        <div className='space-y-1'>
                            <p className='font-medium text-sm'>Input Quality</p>
                            <p className='text-xs text-muted-foreground'>
                                Provide clear, well-structured text for the best results
                            </p>
                        </div>
                        <div className='space-y-1'>
                            <p className='font-medium text-sm'>Length Selection</p>
                            <p className='text-xs text-muted-foreground'>
                                Choose shorter summaries for quick overviews, longer for detailed analysis
                            </p>
                        </div>
                        <div className='space-y-1'>
                            <p className='font-medium text-sm'>Style Format</p>
                            <p className='text-xs text-muted-foreground'>
                                Bullet points work well for lists, paragraphs for narratives
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
