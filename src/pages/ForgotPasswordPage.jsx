import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useAuth } from '../hooks/User/useAuth'; // Fixed import path

export const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false); // To show success message

    const { sendResetPassword } = useAuth();

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsLoading(true);

        try {
            // The hook now expects just the email string
            const response = await sendResetPassword(email);

            toast.success(response.message || 'Reset link sent!');
            setIsSubmitted(true); // Show success state
        } catch (error) {
            // The hook throws an error, which we catch here
            toast.error(error.message || 'Failed to send reset email.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/50 py-12 px-4 sm:px-6 lg:px-8">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Forgot Password?</CardTitle>
                    <CardDescription>
                        {isSubmitted
                            ? "If an account exists, you'll receive a reset link."
                            : "Enter your email to get a password reset link."
                        }
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isSubmitted ? (
                        <div className="text-center space-y-4">
                            <p>Please check your email inbox (and spam folder) for instructions.</p>
                            <Button asChild className="w-full">
                                <Link to="/login">Back to Sign In</Link>
                            </Button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    required
                                />
                            </div>

                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? 'Sending...' : 'Send Reset Link'}
                            </Button>
                        </form>
                    )}

                    {!isSubmitted && (
                        <p className="mt-6 text-center text-sm">
                            Remembered your password?{' '}
                            <Link to="/login" className="text-primary hover:underline">
                                Sign in
                            </Link>
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

