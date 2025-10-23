import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/User/useAuth'; // Fixed import path to use alias

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const userId = searchParams.get('userId');

  const { checkResetPassword, resetPassword } = useAuth();


  const [isValidating, setIsValidating] = useState(true);
  const [validationError, setValidationError] = useState(null);


  const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);


  useEffect(() => {
    const validateToken = async () => {
      if (!token || !userId) {
        setValidationError('Invalid or missing token/user information.');
        setIsValidating(false);
        return;
      }

      try {
        await checkResetPassword(userId, token);
        // If it doesn't throw, the token is valid
        setIsValidating(false);
      } catch (error) {
        // Catch the error thrown by the hook
        setValidationError(error.message || 'This password reset link is invalid or has expired.');
        toast.error(error.message || 'Invalid or expired link.');
        setIsValidating(false);
      }
    };

    validateToken();
  }, [token, userId, checkResetPassword]);

  // Handle form input changes
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  // Stage 2: Handle the new password form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);

    try {
      const resetDto = {
        userId,
        password: formData.password,
      };
      // The hook expects the full DTO
      const response = await resetPassword(resetDto, token);
      toast.success(response.message || 'Password reset successfully!');
      setIsSuccess(true);
    } catch (error) {
      // Catch the error thrown by the hook
      toast.error(error.message || 'Failed to reset password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to decide what to render
  const renderContent = () => {
    if (isValidating) {
      return <CardDescription className="text-center">Validating reset link...</CardDescription>;
    }

    if (validationError) {
      return (
        <div className="text-center">
          <CardDescription className="text-destructive">{validationError}</CardDescription>
          <Button asChild className="w-full mt-4">
            <Link to="/login">Back to Sign In</Link>
          </Button>
        </div>
      );
    }

    if (isSuccess) {
      return (
        <div className="text-center space-y-4">
          <CardDescription>Your password has been successfully reset.</CardDescription>
          <Button asChild className="w-full">
            <Link to="/login">Proceed to Sign In</Link>
          </Button>
        </div>
      );
    }

    // If valid and not yet successful, show the form
    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="password">New Password</Label>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your new password"
            required
          />
        </div>
        <div>
          <Label htmlFor="confirmPassword">Confirm New Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm your new password"
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save New Password'}
        </Button>
      </form>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Reset Your Password</CardTitle>
        </CardHeader>
        <CardContent>
          {renderContent()}
        </CardContent>
      </Card>
    </div>
  );
}

