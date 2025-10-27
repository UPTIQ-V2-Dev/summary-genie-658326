import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { SummaryGeneratorPage } from '@/pages/SummaryGeneratorPage';
import { LoginPage } from '@/pages/LoginPage';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            refetchOnWindowFocus: false
        }
    }
});

export const App = () => {
    return (
        <QueryClientProvider client={queryClient}>
            <Router>
                <div className='min-h-screen bg-background'>
                    <Routes>
                        <Route
                            path='/'
                            element={<SummaryGeneratorPage />}
                        />
                        <Route
                            path='/login'
                            element={<LoginPage />}
                        />
                        <Route
                            path='/history'
                            element={<ComingSoonPage title='History' />}
                        />
                        <Route
                            path='/settings'
                            element={<ComingSoonPage title='Settings' />}
                        />
                    </Routes>
                    <Toaster />
                </div>
            </Router>
        </QueryClientProvider>
    );
};

// Temporary coming soon page for other routes
const ComingSoonPage = ({ title }: { title: string }) => (
    <div className='min-h-screen flex items-center justify-center bg-background'>
        <div className='text-center space-y-4'>
            <h1 className='text-4xl font-bold text-muted-foreground'>{title}</h1>
            <p className='text-lg text-muted-foreground'>Coming Soon</p>
        </div>
    </div>
);
