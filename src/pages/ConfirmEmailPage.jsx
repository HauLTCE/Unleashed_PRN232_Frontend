import React, { useState, useEffect, useRef } from 'react'; // Import useRef
import { Link, useSearchParams, useNavigate } from 'react-router-dom'; // Import useNavigate
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/User/useAuth'; // Assuming you've added confirmEmail to this hook

export function ConfirmEmailPage() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate(); // Initialize navigate

    const { confirmEmail } = useAuth(); // Get the function from your hook

    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState(null);
    const [isSuccess, setIsSuccess] = useState(false);
    const hasConfirmed = useRef(false); // Add ref to track if confirmation has run

    useEffect(() => {
        const doConfirmation = async () => {
            if (!token) {
                setErrorMessage('Invalid confirmation link. Token is missing.');
                setIsLoading(false);
                return;
            }

            try {
                // This is where you call your API function
                await confirmEmail(token);
                // If it doesn't throw, it's a success
                setIsSuccess(true);
                toast.success('Email confirmed successfully!');
                navigate("/"); // Corrected from navigator to navigate
            } catch (error) {
                // Catch the error thrown by the hook
                setErrorMessage(error.message || 'This confirmation link is invalid or has expired.');
                toast.error(error.message || 'Invalid or expired link.');
            } finally {
                setIsLoading(false);
            }
        };


        if (!hasConfirmed.current) {
            hasConfirmed.current = true;
            doConfirmation();
        }
    }, [token, confirmEmail, navigate]); // Add navigate to dependency array


    const renderContent = () => {
        if (isLoading) {
            return <CardDescription className="text-center">Verifying your email...</CardDescription>;
        }

        if (errorMessage) {
            return (
                <div className="text-center">
                    <CardDescription className="text-destructive">{errorMessage}</CardDescription>
                    <Button asChild className="w-full mt-4">
                        <Link to="/login">Back to Sign In</Link>
                    </Button>
                </div>
            );
        }

        if (isSuccess) {
            return (
                <div className="text-center space-y-4">
                    <CardDescription>Your email has been verified! Redirecting...</CardDescription>
                    <Button asChild className="w-full">
                        <Link to="/login">Proceed to Sign In</Link>
                    </Button>
                </div>
            );
        }

        return null; // Should not be reached
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/50 py-12 px-4 sm:px-6 lg:px-8">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Email Confirmation</CardTitle>
                </CardHeader>
                <CardContent>
                    {renderContent()}
                </CardContent>
            </Card>
        </div>
    );
}

