import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { useNotifications } from "../../hooks/Notification/useNotifications";
import { useState } from "react";
import { AdminLayout } from "../components/AdminLayout";
import { AlertCircle, ArrowLeft, Loader2, Save, Send } from "lucide-react";
import { useNotificationUsers } from "../../hooks/NotificationUser/useNotificationUsers";

export const CreateNotificationPage = () => {
    const navigate = useNavigate();
    const { createNotification, loading, error: apiError } = useNotifications();
    const { createNotificationUsers } = useNotificationUsers();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    const [formErrors, setFormErrors] = useState({});

    const validateForm = () => {
        const errors = {};
        if (!title) {
            errors.title = "Title is required.";
        } else if (title.length > 255) {
            errors.title = "Title cannot exceed 255 characters.";
        }

        if (!content) {
            errors.content = "Content is required.";
        }

        setFormErrors(errors);
        // Return true if there are no errors
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (isSubmittingAsDraft) => {
        if (!validateForm()) return;

        const notificationDTO = {
            notificationTitle: title,
            userIdSender: JSON.parse(localStorage.getItem("authUser") || "null"),
            notificationContent: content,
            isNotificationDraft: isSubmittingAsDraft,
        };

        try {
            const notification = await createNotification(notificationDTO);


            if (!isSubmittingAsDraft && notification?.notificationId) {
                createNotificationUsers(notification.notificationId);
            }

            navigate('/admin/notifications');
        } catch (err) {
            console.error("Failed to create notification:", err);
        }
    };


    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Page Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold">Create Notification</h1>
                        <p className="text-gray-500">Draft a new message or publish it to users.</p>
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => navigate(-1)} // Go back to previous page
                        disabled={loading}
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to List
                    </Button>
                </div>

                {/* Form Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>New Notification Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form className="space-y-6">
                            {/* API Error Display */}
                            {apiError && (
                                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md flex items-center">
                                    <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0" />
                                    <div>
                                        <h4 className="font-bold">Submission Failed</h4>
                                        <p className="text-sm">{apiError.message}</p>
                                    </div>
                                </div>
                            )}

                            {/* Title Field */}
                            <div className="space-y-2">
                                <Label htmlFor="title">Title</Label>
                                <Input
                                    id="title"
                                    placeholder="e.g., 'System Maintenance Alert'"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    maxLength={255}
                                    disabled={loading}
                                    className={formErrors.title ? 'border-red-500' : ''}
                                />
                                {formErrors.title && (
                                    <p className="text-sm text-red-600">{formErrors.title}</p>
                                )}
                            </div>

                            {/* Content Field */}
                            <div className="space-y-2">
                                <Label htmlFor="content">Content</Label>
                                <Textarea
                                    id="content"
                                    placeholder="Write the full notification message here..."
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    rows={8}
                                    disabled={loading}
                                    className={formErrors.content ? 'border-red-500' : ''}
                                />
                                {formErrors.content && (
                                    <p className="text-sm text-red-600">{formErrors.content}</p>
                                )}
                            </div>
                        </form>
                    </CardContent>

                    {/* Form Footer with Actions */}
                    <CardFooter className="flex justify-end gap-3">
                        <Button
                            variant="outline"
                            onClick={() => navigate('/admin/notifications')} // Adjust path if needed
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={() => handleSubmit(true)} // true = Save as Draft
                            disabled={loading}
                        >
                            {loading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Save className="mr-2 h-4 w-4" />
                            )}
                            Save Draft
                        </Button>
                        <Button
                            onClick={() => handleSubmit(false)} // false = Publish Now
                            disabled={loading}
                        >
                            {loading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Send className="mr-2 h-4 w-4" />
                            )}
                            Publish Notification
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </AdminLayout>
    );
}

export default CreateNotificationPage;

