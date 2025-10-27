import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, Edit, X, AlertCircle, FileText, Send, Check } from 'lucide-react';
import { useNotification } from '../../hooks/Notification/useNotification';
import { useNotifications } from '../../hooks/Notification/useNotifications';
import { AdminLayout } from '../components/AdminLayout';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';

const formatDate = (dateString) => {
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return "Invalid date";
        }
        const now = new Date();
        const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

        if (diffInMinutes < 60) {
            return `${diffInMinutes}m ago`;
        } else if (diffInMinutes < 1440) {
            return `${Math.floor(diffInMinutes / 60)}h ago`;
        } else {
            return date.toLocaleDateString();
        }
    } catch (e) {
        return "Invalid date";
    }
};

export function NotificationDetailPage() {
    const { notificationId } = useParams();
    const navigate = useNavigate();
    const { notification, loading, error, updateNotification } = useNotification(notificationId);
    const { removeNotification } = useNotifications();

    const [isEditing, setIsEditing] = useState(false);
    const [editedTitle, setEditedTitle] = useState('');
    const [editedContent, setEditedContent] = useState('');

    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // --- New state for the publish action ---
    const [isPublishing, setIsPublishing] = useState(false);

    useEffect(() => {
        if (notification) {
            setEditedTitle(notification.notificationTitle);
            setEditedContent(notification.notificationContent);
        }
    }, [notification]);

    const handleDelete = async () => {
        if (window.confirm("Are you sure you want to delete this notification?")) {
            setIsDeleting(true);
            try {
                await removeNotification(notificationId);
                navigate('/admin/notifications');
            } catch (err) {
                console.error("Failed to delete:", err);
                setIsDeleting(false);
            }
        }
    };

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleCancel = () => {
        setIsEditing(false);
        if (notification) {
            setEditedTitle(notification.notificationTitle);
            setEditedContent(notification.notificationContent);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateNotification(notificationId, {
                notificationTitle: editedTitle,
                notificationContent: editedContent,
                isNotificationDraft: notification.isNotificationDraft,
            });
            setIsEditing(false);
        } catch (err) {
            console.error("Failed to save notification:", err);
        } finally {
            setIsSaving(false);
        }
    };

    const handlePublish = async () => {
        if (window.confirm("Are you sure you want to publish this notification?")) {
            setIsPublishing(true);
            try {
                await updateNotification(notificationId, {
                    notificationTitle: notification.notificationTitle,
                    notificationContent: notification.notificationContent,
                    isNotificationDraft: false
                });
            } catch (err) {
                console.error("Failed to publish notification:", err);
            } finally {
                setIsPublishing(false);
            }
        }
    };

    const renderContent = () => {
        if (loading && !notification && !isEditing) {
            // ... (loading spinner)
            return (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                </div>
            );
        }

        if (error) {
            return (
                <div className="p-6 bg-red-50 border border-red-200 text-red-700 rounded-md flex items-center">
                    <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0" />
                    <p>{error.message}</p>
                </div>
            );
        }

        if (!notification) {
            return (
                <div className="flex justify-center items-center h-64">
                    <p>No notification data found.</p>
                </div>
            );
        }

        // --- Main Render ---
        return (
            <div className="flex flex-col md:flex-row gap-6">
                <Card className="w-full md:w-2/3">
                    <CardHeader>
                        <CardTitle className="text-3xl">
                            {isEditing ? 'Edit Notification' : notification.notificationTitle}
                        </CardTitle>
                    </CardHeader>

                    {isEditing ? (
                        <>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="edit-title">Title</Label>
                                    <Input
                                        id="edit-title"
                                        value={editedTitle}
                                        onChange={(e) => setEditedTitle(e.target.value)}
                                        disabled={isSaving}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-content">Content</Label>
                                    <Textarea
                                        id="edit-content"
                                        value={editedContent}
                                        onChange={(e) => setEditedContent(e.target.value)}
                                        rows={10}
                                        disabled={isSaving}
                                        className="whitespace-pre-wrap resize-none"
                                    />
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-end gap-3">
                                <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                                    <X className="mr-2 h-4 w-4" />
                                    Cancel
                                </Button>
                                <Button onClick={handleSave} disabled={isSaving || loading}>
                                    {isSaving ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <Check className="mr-2 h-4 w-4" />
                                    )}
                                    Save Changes
                                </Button>
                            </CardFooter>
                        </>
                    ) : (
                        <>
                            <CardContent>
                                <p className="text-lg text-gray-700 whitespace-pre-wrap">
                                    {notification.notificationContent}
                                </p>
                            </CardContent>
                            <CardFooter className="flex justify-end gap-3">
                                {notification.isNotificationDraft ? (
                                    <>
                                        <Button onClick={handlePublish} disabled={loading || isDeleting || isPublishing}>
                                            {isPublishing ? (
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            ) : (
                                                <Send className="mr-2 h-4 w-4" />
                                            )}
                                            Publish
                                        </Button>

                                        <Button variant="outline" onClick={handleEditClick} disabled={loading || isDeleting || isPublishing}>
                                            <Edit className="mr-2 h-4 w-4" />
                                            Edit
                                        </Button>
                                    </>
                                ) : (
                                    // --- Show if already published ---
                                    <p className="text-sm text-gray-500 mr-auto">
                                        Published
                                    </p>
                                )}

                                {/* Delete Button (always available) */}
                                <Button
                                    variant="destructive"
                                    onClick={handleDelete}
                                    disabled={loading || isDeleting || isPublishing}
                                >
                                    {isDeleting ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <X className="mr-2 h-4 w-4" />
                                    )}
                                    Delete
                                </Button>
                            </CardFooter>
                        </>
                    )}
                </Card>

                {/* --- Details Card --- */}
                <Card className={`w-full md:w-1/3 h-fit transition-opacity ${isEditing ? 'opacity-60' : 'opacity-100'}`}>
                    {/* ... (Details card content remains unchanged) ... */}
                    <CardHeader>
                        <CardTitle className="text-xl font-semibold">Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-600">Status</span>
                            <Badge variant={notification.isNotificationDraft ? 'secondary' : 'default'}>
                                {notification.isNotificationDraft ? (
                                    <FileText className="mr-1.5 h-3 w-3" />
                                ) : (
                                    <Send className="mr-1.5 h-3 w-3" />
                                )}
                                {notification.isNotificationDraft ? 'Draft' : 'Published'}
                            </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-600">Date</span>
                            <span className="text-gray-800 text-sm">
                                {formatDate(notification.notificationCreatedAt)}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-600">ID</span>
                            <span className="text-gray-500 text-xs truncate max-w-[150px]">
                                {notification.notificationId}
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">Notification Details</h1>
                    <Button
                        variant="outline"
                        onClick={() => {
                            if (isEditing && !window.confirm("You have unsaved changes. Are you sure you want to leave?")) {
                                return;
                            }
                            navigate('/admin/notifications');
                        }}
                        disabled={loading || isSaving || isDeleting || isPublishing}
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to List
                    </Button>
                </div>

                {renderContent()}

            </div>
        </AdminLayout>
    );
}

export default NotificationDetailPage;