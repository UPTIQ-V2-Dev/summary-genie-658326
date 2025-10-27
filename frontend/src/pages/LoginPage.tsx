import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { authService } from '@/services/auth';
import type { LoginRequest } from '@/types/user';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';

export const LoginPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState<LoginRequest>({
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [errors, setErrors] = useState<Partial<LoginRequest>>({});

    const loginMutation = useMutation({
        mutationFn: authService.login,
        onSuccess: () => {
            navigate('/');
        },
        onError: (error: any) => {
            console.error('Login failed:', error);
        }
    });

    const validateForm = (): boolean => {
        const newErrors: Partial<LoginRequest> = {};

        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        loginMutation.mutate(formData);
    };

    const handleInputChange = (field: keyof LoginRequest) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({
            ...prev,
            [field]: e.target.value
        }));

        // Clear error for this field when user starts typing
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: undefined
            }));
        }
    };

    return (
        <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4'>
            <Card className='w-full max-w-md shadow-lg'>
                <CardHeader className='space-y-1'>
                    <CardTitle className='text-2xl font-bold text-center'>Welcome Back</CardTitle>
                    <CardDescription className='text-center'>Sign in to your account to continue</CardDescription>
                </CardHeader>

                <form onSubmit={handleSubmit}>
                    <CardContent className='space-y-4'>
                        {loginMutation.error && (
                            <Alert variant='destructive'>
                                <AlertDescription>
                                    {loginMutation.error instanceof Error
                                        ? loginMutation.error.message
                                        : 'Login failed. Please check your credentials and try again.'}
                                </AlertDescription>
                            </Alert>
                        )}

                        <div className='space-y-2'>
                            <Label htmlFor='email'>Email</Label>
                            <div className='relative'>
                                <Mail className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4' />
                                <Input
                                    id='email'
                                    type='email'
                                    placeholder='Enter your email'
                                    value={formData.email}
                                    onChange={handleInputChange('email')}
                                    className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                                    disabled={loginMutation.isPending}
                                />
                            </div>
                            {errors.email && <p className='text-sm text-red-600'>{errors.email}</p>}
                        </div>

                        <div className='space-y-2'>
                            <Label htmlFor='password'>Password</Label>
                            <div className='relative'>
                                <Lock className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4' />
                                <Input
                                    id='password'
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder='Enter your password'
                                    value={formData.password}
                                    onChange={handleInputChange('password')}
                                    className={`pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                                    disabled={loginMutation.isPending}
                                />
                                <button
                                    type='button'
                                    onClick={() => setShowPassword(!showPassword)}
                                    className='absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground'
                                    disabled={loginMutation.isPending}
                                >
                                    {showPassword ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
                                </button>
                            </div>
                            {errors.password && <p className='text-sm text-red-600'>{errors.password}</p>}
                        </div>

                        <div className='flex items-center justify-between'>
                            <div className='flex items-center space-x-2'>
                                <Checkbox
                                    id='remember'
                                    checked={rememberMe}
                                    onCheckedChange={checked => setRememberMe(checked as boolean)}
                                    disabled={loginMutation.isPending}
                                />
                                <Label
                                    htmlFor='remember'
                                    className='text-sm'
                                >
                                    Remember me
                                </Label>
                            </div>
                            <Button
                                variant='link'
                                className='px-0 text-sm'
                                asChild
                            >
                                <Link to='/forgot-password'>Forgot password?</Link>
                            </Button>
                        </div>
                    </CardContent>

                    <CardFooter className='flex flex-col space-y-4'>
                        <Button
                            type='submit'
                            className='w-full'
                            disabled={loginMutation.isPending}
                        >
                            {loginMutation.isPending ? 'Signing in...' : 'Sign In'}
                        </Button>

                        <p className='text-sm text-center text-muted-foreground'>
                            Don't have an account?{' '}
                            <Button
                                variant='link'
                                className='px-0'
                                asChild
                            >
                                <Link to='/register'>Sign up</Link>
                            </Button>
                        </p>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
};
