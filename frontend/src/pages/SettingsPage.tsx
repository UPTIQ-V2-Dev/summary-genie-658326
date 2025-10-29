import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { getStoredUser } from '@/lib/api';
import { Settings, User, Palette, Download, Save, Bell, Shield } from 'lucide-react';
import { toast } from 'sonner';

interface UserSettings {
    id: string;
    userId: string;
    summaryLength: 'short' | 'medium' | 'long';
    summaryStyle: 'bullet' | 'paragraph' | 'key-points';
    theme: 'light' | 'dark' | 'system';
    autoSave: boolean;
    exportFormat: 'txt' | 'pdf' | 'json';
    notifications: {
        emailSummaries: boolean;
        weeklyReport: boolean;
        systemUpdates: boolean;
    };
}

interface UserProfile {
    name: string;
    email: string;
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
}

export const SettingsPage = () => {
    const [userSettings, setUserSettings] = useState<UserSettings>({
        id: '1',
        userId: '1',
        summaryLength: 'medium',
        summaryStyle: 'paragraph',
        theme: 'system',
        autoSave: true,
        exportFormat: 'txt',
        notifications: {
            emailSummaries: false,
            weeklyReport: true,
            systemUpdates: true
        }
    });

    const [userProfile, setUserProfile] = useState<UserProfile>({
        name: '',
        email: ''
    });

    const [hasChanges, setHasChanges] = useState(false);
    const currentUser = getStoredUser();

    useEffect(() => {
        if (currentUser) {
            setUserProfile({
                name: currentUser.name || '',
                email: currentUser.email || ''
            });
        }
    }, [currentUser]);

    // Mock API calls for settings
    const saveSettingsMutation = useMutation({
        mutationFn: async (settings: UserSettings) => {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            return settings;
        },
        onSuccess: () => {
            toast.success('Settings saved successfully!');
            setHasChanges(false);
        },
        onError: (error: any) => {
            toast.error(error?.message || 'Failed to save settings');
        }
    });

    const updateProfileMutation = useMutation({
        mutationFn: async (profile: UserProfile) => {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            return profile;
        },
        onSuccess: () => {
            toast.success('Profile updated successfully!');
        },
        onError: (error: any) => {
            toast.error(error?.message || 'Failed to update profile');
        }
    });

    const handleSettingsChange = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
        setUserSettings(prev => ({ ...prev, [key]: value }));
        setHasChanges(true);
    };

    const handleNotificationChange = (key: keyof UserSettings['notifications'], value: boolean) => {
        setUserSettings(prev => ({
            ...prev,
            notifications: {
                ...prev.notifications,
                [key]: value
            }
        }));
        setHasChanges(true);
    };

    const handleProfileChange = <K extends keyof UserProfile>(key: K, value: UserProfile[K]) => {
        setUserProfile(prev => ({ ...prev, [key]: value }));
    };

    const handleSaveSettings = () => {
        saveSettingsMutation.mutate(userSettings);
    };

    const handleUpdateProfile = () => {
        if (userProfile.newPassword && userProfile.newPassword !== userProfile.confirmPassword) {
            toast.error('New passwords do not match');
            return;
        }
        updateProfileMutation.mutate(userProfile);
    };

    const exportData = (format: string) => {
        toast.success(`Exporting data in ${format.toUpperCase()} format...`);
        // Mock export functionality
    };

    return (
        <div className='min-h-screen bg-background p-6'>
            <div className='max-w-4xl mx-auto space-y-8'>
                {/* Header */}
                <div className='space-y-2'>
                    <h1 className='text-3xl font-bold text-foreground flex items-center gap-2'>
                        <Settings className='h-8 w-8' />
                        Settings
                    </h1>
                    <p className='text-muted-foreground'>Customize your summary generator experience</p>
                </div>

                {/* Profile Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle className='flex items-center gap-2'>
                            <User className='h-5 w-5' />
                            Profile Settings
                        </CardTitle>
                        <CardDescription>Update your personal information and account settings</CardDescription>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                            <div className='space-y-2'>
                                <Label htmlFor='name'>Full Name</Label>
                                <Input
                                    id='name'
                                    value={userProfile.name}
                                    onChange={e => handleProfileChange('name', e.target.value)}
                                    placeholder='Enter your full name'
                                />
                            </div>
                            <div className='space-y-2'>
                                <Label htmlFor='email'>Email Address</Label>
                                <Input
                                    id='email'
                                    type='email'
                                    value={userProfile.email}
                                    onChange={e => handleProfileChange('email', e.target.value)}
                                    placeholder='Enter your email'
                                />
                            </div>
                        </div>

                        <Separator />

                        <div className='space-y-4'>
                            <h4 className='font-medium'>Change Password</h4>
                            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                                <div className='space-y-2'>
                                    <Label htmlFor='current-password'>Current Password</Label>
                                    <Input
                                        id='current-password'
                                        type='password'
                                        value={userProfile.currentPassword || ''}
                                        onChange={e => handleProfileChange('currentPassword', e.target.value)}
                                        placeholder='Current password'
                                    />
                                </div>
                                <div className='space-y-2'>
                                    <Label htmlFor='new-password'>New Password</Label>
                                    <Input
                                        id='new-password'
                                        type='password'
                                        value={userProfile.newPassword || ''}
                                        onChange={e => handleProfileChange('newPassword', e.target.value)}
                                        placeholder='New password'
                                    />
                                </div>
                                <div className='space-y-2'>
                                    <Label htmlFor='confirm-password'>Confirm Password</Label>
                                    <Input
                                        id='confirm-password'
                                        type='password'
                                        value={userProfile.confirmPassword || ''}
                                        onChange={e => handleProfileChange('confirmPassword', e.target.value)}
                                        placeholder='Confirm new password'
                                    />
                                </div>
                            </div>
                        </div>

                        <div className='flex justify-end'>
                            <Button
                                onClick={handleUpdateProfile}
                                disabled={updateProfileMutation.isPending}
                            >
                                {updateProfileMutation.isPending ? 'Updating...' : 'Update Profile'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Summary Preferences */}
                <Card>
                    <CardHeader>
                        <CardTitle>Summary Preferences</CardTitle>
                        <CardDescription>Customize how your summaries are generated</CardDescription>
                    </CardHeader>
                    <CardContent className='space-y-6'>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                            <div className='space-y-2'>
                                <Label htmlFor='summary-length'>Default Summary Length</Label>
                                <Select
                                    value={userSettings.summaryLength}
                                    onValueChange={value => handleSettingsChange('summaryLength', value as any)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value='short'>Short (1-2 sentences)</SelectItem>
                                        <SelectItem value='medium'>Medium (3-5 sentences)</SelectItem>
                                        <SelectItem value='long'>Long (6+ sentences)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className='space-y-2'>
                                <Label htmlFor='summary-style'>Default Summary Style</Label>
                                <Select
                                    value={userSettings.summaryStyle}
                                    onValueChange={value => handleSettingsChange('summaryStyle', value as any)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value='paragraph'>Paragraph</SelectItem>
                                        <SelectItem value='bullet'>Bullet Points</SelectItem>
                                        <SelectItem value='key-points'>Key Points</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className='flex items-center justify-between'>
                            <div className='space-y-1'>
                                <Label>Auto-save Summaries</Label>
                                <p className='text-sm text-muted-foreground'>
                                    Automatically save summaries to your history
                                </p>
                            </div>
                            <Switch
                                checked={userSettings.autoSave}
                                onCheckedChange={checked => handleSettingsChange('autoSave', checked)}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Theme Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle className='flex items-center gap-2'>
                            <Palette className='h-5 w-5' />
                            Theme & Appearance
                        </CardTitle>
                        <CardDescription>Choose your preferred theme and appearance settings</CardDescription>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                        <div className='space-y-2'>
                            <Label htmlFor='theme'>Theme Preference</Label>
                            <Select
                                value={userSettings.theme}
                                onValueChange={value => handleSettingsChange('theme', value as any)}
                            >
                                <SelectTrigger className='w-full md:w-48'>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value='light'>Light</SelectItem>
                                    <SelectItem value='dark'>Dark</SelectItem>
                                    <SelectItem value='system'>System</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className='text-sm text-muted-foreground'>
                                System theme will match your device's preference
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Export Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle className='flex items-center gap-2'>
                            <Download className='h-5 w-5' />
                            Export Settings
                        </CardTitle>
                        <CardDescription>Configure how you export your summaries and data</CardDescription>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                        <div className='space-y-2'>
                            <Label htmlFor='export-format'>Default Export Format</Label>
                            <Select
                                value={userSettings.exportFormat}
                                onValueChange={value => handleSettingsChange('exportFormat', value as any)}
                            >
                                <SelectTrigger className='w-full md:w-48'>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value='txt'>Text File (.txt)</SelectItem>
                                    <SelectItem value='pdf'>PDF Document</SelectItem>
                                    <SelectItem value='json'>JSON Format</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <Separator />

                        <div className='space-y-4'>
                            <h4 className='font-medium'>Quick Export</h4>
                            <div className='flex gap-2 flex-wrap'>
                                <Button
                                    variant='outline'
                                    size='sm'
                                    onClick={() => exportData('txt')}
                                >
                                    Export as TXT
                                </Button>
                                <Button
                                    variant='outline'
                                    size='sm'
                                    onClick={() => exportData('pdf')}
                                >
                                    Export as PDF
                                </Button>
                                <Button
                                    variant='outline'
                                    size='sm'
                                    onClick={() => exportData('json')}
                                >
                                    Export as JSON
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Notification Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle className='flex items-center gap-2'>
                            <Bell className='h-5 w-5' />
                            Notifications
                        </CardTitle>
                        <CardDescription>Manage your notification preferences</CardDescription>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                        <div className='flex items-center justify-between'>
                            <div className='space-y-1'>
                                <Label>Email Summaries</Label>
                                <p className='text-sm text-muted-foreground'>Receive summaries via email</p>
                            </div>
                            <Switch
                                checked={userSettings.notifications.emailSummaries}
                                onCheckedChange={checked => handleNotificationChange('emailSummaries', checked)}
                            />
                        </div>

                        <div className='flex items-center justify-between'>
                            <div className='space-y-1'>
                                <Label>Weekly Report</Label>
                                <p className='text-sm text-muted-foreground'>Get a weekly summary report</p>
                            </div>
                            <Switch
                                checked={userSettings.notifications.weeklyReport}
                                onCheckedChange={checked => handleNotificationChange('weeklyReport', checked)}
                            />
                        </div>

                        <div className='flex items-center justify-between'>
                            <div className='space-y-1'>
                                <Label>System Updates</Label>
                                <p className='text-sm text-muted-foreground'>
                                    Notifications about system updates and features
                                </p>
                            </div>
                            <Switch
                                checked={userSettings.notifications.systemUpdates}
                                onCheckedChange={checked => handleNotificationChange('systemUpdates', checked)}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Account Security */}
                <Card>
                    <CardHeader>
                        <CardTitle className='flex items-center gap-2'>
                            <Shield className='h-5 w-5' />
                            Account Security
                        </CardTitle>
                        <CardDescription>View your account security status</CardDescription>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                        <div className='flex items-center justify-between'>
                            <div className='space-y-1'>
                                <Label>Email Verification</Label>
                                <p className='text-sm text-muted-foreground'>Your email address is verified</p>
                            </div>
                            <Badge variant='secondary'>Verified</Badge>
                        </div>

                        <div className='flex items-center justify-between'>
                            <div className='space-y-1'>
                                <Label>Account Status</Label>
                                <p className='text-sm text-muted-foreground'>Your account is active and secure</p>
                            </div>
                            <Badge variant='secondary'>Active</Badge>
                        </div>
                    </CardContent>
                </Card>

                {/* Save Changes */}
                {hasChanges && (
                    <Alert>
                        <Save className='h-4 w-4' />
                        <AlertDescription className='flex items-center justify-between w-full'>
                            <span>You have unsaved changes</span>
                            <Button
                                onClick={handleSaveSettings}
                                disabled={saveSettingsMutation.isPending}
                                size='sm'
                            >
                                {saveSettingsMutation.isPending ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </AlertDescription>
                    </Alert>
                )}
            </div>
        </div>
    );
};
