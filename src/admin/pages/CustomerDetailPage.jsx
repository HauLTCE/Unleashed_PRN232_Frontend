import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { AdminLayout } from '../components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import { ArrowLeft, User, Mail, Phone, MapPin, Calendar, KeyRound, Clock } from 'lucide-react';
import { useUser } from '../../hooks/User/useUser';
import { useUsers } from '../../hooks/User/useUsers';

// Helper component for displaying detail items
const DetailItem = ({ icon, label, value }) => (
    <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 text-muted-foreground">{icon}</div>
        <div>
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="text-sm font-semibold">{value || 'N/A'}</p>
        </div>
    </div>
);

export function CustomerDetailPage() {
    const { userId } = useParams();
    const { user, loading, error } = useUser(userId);
    const { editUser } = useUsers();

    // Shows a loading skeleton or message
    if (loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center h-64">
                    <p>Loading customer details...</p>
                </div>
            </AdminLayout>
        );
    }

    // Shows an error message if the fetch fails or user not found
    if (error || !user) {
        return (
            <AdminLayout>
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-2">Customer Not Found</h2>
                    <p className="text-muted-foreground mb-4">{error}</p>
                    <Button asChild>
                        <Link to="/admin/users">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Customers
                        </Link>
                    </Button>
                </div>
            </AdminLayout>
        );
    }

    // Formats dates for better readability
    const formattedBirthdate = new Date(user.userBirthdate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const formattedJoinDate = new Date(user.userCreatedAt).toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' });

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Back Button and Page Header */}
                <div>
                    <Button variant="outline" size="sm" asChild className="mb-4">
                        <Link to="/admin/users">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Users
                        </Link>
                    </Button>
                    <h1 className="text-3xl font-bold">Customer Profile</h1>
                    <p className="text-muted-foreground">Detailed view of {user.userFullname}</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Profile Card and Actions */}
                    <div className="lg:col-span-1 space-y-6">
                        <Card>
                            <CardContent className="pt-6 flex flex-col items-center text-center">
                                <Avatar className="h-24 w-24 mb-4">
                                    <AvatarImage src={user.userImage} alt={user.userFullname} />
                                    <AvatarFallback>
                                        {user.userFullname.split(' ').map(n => n[0]).join('')}
                                    </AvatarFallback>
                                </Avatar>
                                <h2 className="text-xl font-bold">{user.userFullname}</h2>
                                <p className="text-sm text-muted-foreground">@{user.userUsername}</p>
                                <div className="mt-4 flex flex-wrap justify-center gap-2">
                                    <Badge variant={user.isUserEnabled ? 'default' : 'destructive'}>
                                        {user.isUserEnabled ? 'Active' : 'Disabled'}
                                    </Badge>
                                    <Badge variant="secondary">{user.roleName}</Badge>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Detailed Information */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Contact & Personal Information</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <DetailItem icon={<Mail size={16} />} label="Email Address" value={user.userEmail} />
                                <DetailItem icon={<Phone size={16} />} label="Phone Number" value={user.userPhone} />
                                <DetailItem icon={<MapPin size={16} />} label="Address" value={user.userAddress} />
                                <DetailItem icon={<Calendar size={16} />} label="Birthdate" value={formattedBirthdate} />
                                <DetailItem icon={<KeyRound size={16} />} label="User ID" value={user.userId} />
                                <DetailItem icon={<Clock size={16} />} label="Joined On" value={formattedJoinDate} />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}