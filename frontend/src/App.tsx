import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { SummaryGeneratorPage } from '@/pages/SummaryGeneratorPage';
import { LoginPage } from '@/pages/LoginPage';
import { HistoryPage } from '@/pages/HistoryPage';
import { SettingsPage } from '@/pages/SettingsPage';

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
                            element={<HistoryPage />}
                        />
                        <Route
                            path='/settings'
                            element={<SettingsPage />}
                        />
                    </Routes>
                    <Toaster />
                </div>
            </Router>
        </QueryClientProvider>
    );
};
