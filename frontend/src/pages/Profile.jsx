import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { User, Mail, Lock, Eye, EyeOff, Save, ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { profileService } from '../services/profileService';
import { authService } from '../services/authService';
import ProtectedRoute from '../components/ProtectedRoute';

function ProfileContent() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [changePassword, setChangePassword] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        setIsFetching(true);
        try {
            const user = await profileService.getProfile();
            setFormData(prev => ({
                ...prev,
                name: user.name || '',
                email: user.email || ''
            }));
        } catch (error) {
            console.error('Error fetching profile:', error);
            const errorMessage = error.response?.data?.error 
                || (error.response?.status === 401 
                    ? 'Session expired. Please login again.'
                    : 'Failed to load profile');
            toast.error(errorMessage);
            if (error.response?.status === 401) {
                authService.logout();
                navigate('/login');
            }
        } finally {
            setIsFetching(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.name || !formData.email) {
            toast.error('Please fill in name and email');
            return;
        }

        if (formData.name.length < 3) {
            toast.error('Name must be at least 3 characters long');
            return;
        }

        if (!/\S+@\S+\.\S+/.test(formData.email)) {
            toast.error('Please enter a valid email address');
            return;
        }

        // Password change validation
        if (changePassword) {
            if (!formData.currentPassword) {
                toast.error('Current password is required');
                return;
            }

            if (!formData.newPassword || formData.newPassword.length < 6) {
                toast.error('New password must be at least 6 characters long');
                return;
            }

            if (formData.newPassword !== formData.confirmPassword) {
                toast.error('New passwords do not match');
                return;
            }
        }

        setIsLoading(true);

        try {
            const updateData = {
                name: formData.name,
                email: formData.email
            };

            // Only include password fields if user wants to change password
            if (changePassword) {
                updateData.currentPassword = formData.currentPassword;
                updateData.newPassword = formData.newPassword;
            }

            const response = await profileService.updateProfile(updateData);

            // Update token if email changed (new token is returned)
            if (response.token) {
                authService.setToken(response.token);
            }

            // Update user in localStorage
            if (response.user) {
                localStorage.setItem('user', JSON.stringify(response.user));
            }

            toast.success(response.message || 'Profile updated successfully!', {
                icon: '✅',
                duration: 3000
            });

            // Reset password fields
            setFormData(prev => ({
                ...prev,
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            }));
            setChangePassword(false);

            // Refresh the page to update user info in layout
            window.location.reload();
        } catch (error) {
            console.error('Error updating profile:', error);
            const errorMessage = error.response?.data?.error 
                || (error.response?.status === 401 
                    ? 'Session expired. Please login again.'
                    : error.response 
                    ? `Failed to update profile: ${error.response.status} ${error.response.statusText}`
                    : error.message.includes('Network Error')
                    ? 'Cannot connect to backend. Is the server running?'
                    : 'Failed to update profile. Please try again.');
            toast.error(errorMessage);

            if (error.response?.status === 401) {
                authService.logout();
                navigate('/login');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    if (isFetching) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="text-muted-foreground">Loading profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-2xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate(-1)}
                    className="rounded-full"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-4xl font-bold text-primary flex items-center gap-2">
                        <User className="w-10 h-10" /> Edit Profile
                    </h1>
                    <p className="text-muted-foreground mt-2">Manage your account information</p>
                </div>
            </div>

            {/* Profile Form Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>Update your profile information</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Name Field */}
                        <div className="space-y-2">
                            <label htmlFor="name" className="text-sm font-medium text-foreground">
                                Full Name
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                <Input
                                    id="name"
                                    name="name"
                                    type="text"
                                    placeholder="John Doe"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="pl-10"
                                    required
                                />
                            </div>
                        </div>

                        {/* Email Field */}
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium text-foreground">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="pl-10"
                                    required
                                />
                            </div>
                        </div>

                        {/* Change Password Toggle */}
                        <div className="pt-4 border-t">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-sm font-medium text-foreground">Change Password</h3>
                                    <p className="text-xs text-muted-foreground">Leave blank to keep current password</p>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setChangePassword(!changePassword);
                                        if (changePassword) {
                                            setFormData(prev => ({
                                                ...prev,
                                                currentPassword: '',
                                                newPassword: '',
                                                confirmPassword: ''
                                            }));
                                        }
                                    }}
                                >
                                    {changePassword ? 'Cancel' : 'Change Password'}
                                </Button>
                            </div>

                            {changePassword && (
                                <div className="space-y-4 pt-4">
                                    {/* Current Password */}
                                    <div className="space-y-2">
                                        <label htmlFor="currentPassword" className="text-sm font-medium text-foreground">
                                            Current Password
                                        </label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                            <Input
                                                id="currentPassword"
                                                name="currentPassword"
                                                type={showCurrentPassword ? 'text' : 'password'}
                                                placeholder="Enter current password"
                                                value={formData.currentPassword}
                                                onChange={handleChange}
                                                className="pl-10 pr-10"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
                                            >
                                                {showCurrentPassword ? (
                                                    <EyeOff className="h-5 w-5" />
                                                ) : (
                                                    <Eye className="h-5 w-5" />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {/* New Password */}
                                    <div className="space-y-2">
                                        <label htmlFor="newPassword" className="text-sm font-medium text-foreground">
                                            New Password
                                        </label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                            <Input
                                                id="newPassword"
                                                name="newPassword"
                                                type={showNewPassword ? 'text' : 'password'}
                                                placeholder="Enter new password"
                                                value={formData.newPassword}
                                                onChange={handleChange}
                                                className="pl-10 pr-10"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
                                            >
                                                {showNewPassword ? (
                                                    <EyeOff className="h-5 w-5" />
                                                ) : (
                                                    <Eye className="h-5 w-5" />
                                                )}
                                            </button>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Password must be at least 6 characters long
                                        </p>
                                    </div>

                                    {/* Confirm Password */}
                                    <div className="space-y-2">
                                        <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
                                            Confirm New Password
                                        </label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                            <Input
                                                id="confirmPassword"
                                                name="confirmPassword"
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                placeholder="Confirm new password"
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
                                                className="pl-10 pr-10"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
                                            >
                                                {showConfirmPassword ? (
                                                    <EyeOff className="h-5 w-5" />
                                                ) : (
                                                    <Eye className="h-5 w-5" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Submit Button */}
                        <div className="flex gap-4 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate(-1)}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="gradient"
                                className="flex-1"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <span className="flex items-center gap-2">
                                        <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                                        Saving...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <Save className="h-5 w-5" />
                                        Save Changes
                                    </span>
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

export default function Profile() {
    return (
        <ProtectedRoute>
            <ProfileContent />
        </ProtectedRoute>
    );
}

