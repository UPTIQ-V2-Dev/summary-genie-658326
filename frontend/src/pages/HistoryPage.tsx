import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { getSummaryHistory, deleteSummary } from '@/services/summary';
import type { SummaryHistoryItem, SummaryFilters } from '@/types/summary';
import { Search, Calendar, SortDesc, Trash2, Eye, Copy, FileText } from 'lucide-react';
import { toast } from 'sonner';

export const HistoryPage = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [filters, setFilters] = useState<SummaryFilters>({});
    const [selectedSummary, setSelectedSummary] = useState<SummaryHistoryItem | null>(null);
    const queryClient = useQueryClient();

    const {
        data: historyData,
        isLoading,
        error
    } = useQuery({
        queryKey: ['summaryHistory', currentPage, filters],
        queryFn: () => getSummaryHistory(currentPage, 10, filters)
    });

    const deleteMutation = useMutation({
        mutationFn: deleteSummary,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['summaryHistory'] });
            toast.success('Summary deleted successfully');
        },
        onError: (error: any) => {
            toast.error(error?.message || 'Failed to delete summary');
        }
    });

    const handleSearch = (search: string) => {
        setFilters(prev => ({ ...prev, search }));
        setCurrentPage(1);
    };

    const handleSortChange = (sortBy: string) => {
        setFilters(prev => ({ ...prev, sortBy: sortBy as SummaryFilters['sortBy'] }));
        setCurrentPage(1);
    };

    const handleDeleteSummary = (id: string) => {
        if (confirm('Are you sure you want to delete this summary?')) {
            deleteMutation.mutate(id);
        }
    };

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            toast.success('Copied to clipboard!');
        } catch {
            toast.error('Failed to copy to clipboard');
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className='min-h-screen bg-background p-6'>
            <div className='max-w-6xl mx-auto space-y-6'>
                {/* Header */}
                <div className='space-y-2'>
                    <h1 className='text-3xl font-bold text-foreground'>Summary History</h1>
                    <p className='text-muted-foreground'>View and manage your previous text summaries</p>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle className='text-lg'>Search & Filter</CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                            <div className='space-y-2'>
                                <Label htmlFor='search'>Search</Label>
                                <div className='relative'>
                                    <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4' />
                                    <Input
                                        id='search'
                                        placeholder='Search summaries...'
                                        value={filters.search || ''}
                                        onChange={e => handleSearch(e.target.value)}
                                        className='pl-10'
                                    />
                                </div>
                            </div>

                            <div className='space-y-2'>
                                <Label htmlFor='sort'>Sort by</Label>
                                <Select
                                    value={filters.sortBy || 'newest'}
                                    onValueChange={handleSortChange}
                                >
                                    <SelectTrigger>
                                        <SortDesc className='h-4 w-4 mr-2' />
                                        <SelectValue placeholder='Sort by...' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value='newest'>Newest First</SelectItem>
                                        <SelectItem value='oldest'>Oldest First</SelectItem>
                                        <SelectItem value='shortest'>Shortest First</SelectItem>
                                        <SelectItem value='longest'>Longest First</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className='space-y-2'>
                                <Label>Results</Label>
                                <div className='pt-2'>
                                    <Badge variant='secondary'>{historyData?.totalResults || 0} summaries found</Badge>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Content */}
                {error && (
                    <Alert variant='destructive'>
                        <AlertDescription>Failed to load history. Please try again later.</AlertDescription>
                    </Alert>
                )}

                {isLoading ? (
                    <div className='space-y-4'>
                        {Array.from({ length: 5 }).map((_, i) => (
                            <Card key={i}>
                                <CardContent className='p-6'>
                                    <div className='space-y-3'>
                                        <Skeleton className='h-4 w-3/4' />
                                        <Skeleton className='h-4 w-1/2' />
                                        <Skeleton className='h-20 w-full' />
                                        <div className='flex gap-2'>
                                            <Skeleton className='h-6 w-16' />
                                            <Skeleton className='h-6 w-20' />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : historyData?.results?.length === 0 ? (
                    <Card className='text-center py-12'>
                        <CardContent>
                            <FileText className='h-12 w-12 mx-auto text-muted-foreground mb-4' />
                            <h3 className='text-lg font-semibold mb-2'>No summaries found</h3>
                            <p className='text-muted-foreground'>
                                {filters.search
                                    ? 'Try adjusting your search criteria'
                                    : 'Generate your first summary to see it here'}
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className='space-y-4'>
                        {historyData?.results?.map(item => (
                            <Card
                                key={item.id}
                                className='hover:shadow-md transition-shadow'
                            >
                                <CardContent className='p-6'>
                                    <div className='space-y-4'>
                                        <div className='flex items-start justify-between'>
                                            <div className='space-y-1 flex-1'>
                                                <h3 className='font-semibold text-foreground'>
                                                    {item.title || 'Untitled Summary'}
                                                </h3>
                                                <p className='text-sm text-muted-foreground'>
                                                    <Calendar className='h-4 w-4 inline mr-1' />
                                                    {formatDate(item.createdAt)}
                                                </p>
                                            </div>
                                            <div className='flex gap-2'>
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button
                                                            variant='outline'
                                                            size='sm'
                                                            onClick={() => setSelectedSummary(item)}
                                                        >
                                                            <Eye className='h-4 w-4' />
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className='max-w-4xl max-h-[80vh] overflow-y-auto'>
                                                        <DialogHeader>
                                                            <DialogTitle>
                                                                {selectedSummary?.title || 'Summary Details'}
                                                            </DialogTitle>
                                                        </DialogHeader>
                                                        {selectedSummary && (
                                                            <div className='space-y-6'>
                                                                <div>
                                                                    <h4 className='font-semibold mb-2'>
                                                                        Original Text
                                                                    </h4>
                                                                    <div className='bg-muted p-4 rounded-lg text-sm'>
                                                                        {selectedSummary.originalText}
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <h4 className='font-semibold mb-2'>Summary</h4>
                                                                    <div className='bg-primary/5 p-4 rounded-lg text-sm'>
                                                                        {selectedSummary.summary}
                                                                    </div>
                                                                </div>
                                                                <div className='flex gap-4 text-sm text-muted-foreground'>
                                                                    <span>Words: {selectedSummary.wordCount}</span>
                                                                    <span>
                                                                        Characters: {selectedSummary.characterCount}
                                                                    </span>
                                                                    <span>
                                                                        Created: {formatDate(selectedSummary.createdAt)}
                                                                    </span>
                                                                </div>
                                                                <div className='flex gap-2'>
                                                                    <Button
                                                                        onClick={() =>
                                                                            copyToClipboard(selectedSummary.summary)
                                                                        }
                                                                        variant='outline'
                                                                        size='sm'
                                                                    >
                                                                        <Copy className='h-4 w-4 mr-2' />
                                                                        Copy Summary
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </DialogContent>
                                                </Dialog>
                                                <Button
                                                    variant='outline'
                                                    size='sm'
                                                    onClick={() => copyToClipboard(item.summary)}
                                                >
                                                    <Copy className='h-4 w-4' />
                                                </Button>
                                                <Button
                                                    variant='destructive'
                                                    size='sm'
                                                    onClick={() => handleDeleteSummary(item.id)}
                                                    disabled={deleteMutation.isPending}
                                                >
                                                    <Trash2 className='h-4 w-4' />
                                                </Button>
                                            </div>
                                        </div>

                                        <div className='bg-muted/50 p-3 rounded-lg'>
                                            <p className='text-sm text-foreground line-clamp-3'>{item.summary}</p>
                                        </div>

                                        <div className='flex items-center justify-between text-sm text-muted-foreground'>
                                            <div className='flex gap-4'>
                                                <span>Words: {item.wordCount}</span>
                                                <span>Characters: {item.characterCount}</span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}

                        {/* Pagination */}
                        {historyData && historyData.totalPages > 1 && (
                            <div className='flex justify-center gap-2 pt-4'>
                                <Button
                                    variant='outline'
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                >
                                    Previous
                                </Button>
                                <span className='px-4 py-2 text-sm text-muted-foreground'>
                                    Page {currentPage} of {historyData.totalPages}
                                </span>
                                <Button
                                    variant='outline'
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, historyData.totalPages))}
                                    disabled={currentPage === historyData.totalPages}
                                >
                                    Next
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
