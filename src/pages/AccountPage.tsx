import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Switch } from '../components/ui/switch';
import { toast } from 'sonner';
import { useUser } from '../hooks/User/useUser';
import { useAuth } from '../hooks/User/useAuth';

// --- MOCK DATA ---
const mockOrders = [
  { id: '#3456', date: '2025-10-14', total: 75.50, status: 'delivered', trackingNumber: '1Z9999W99999999999' },
  { id: '#3455', date: '2025-10-10', total: 120.00, status: 'shipped', trackingNumber: '1Z9999W99999999998' },
];
const mockNotifications = [
  { id: 1, title: 'Order Shipped!', message: 'Your order #3455 has been shipped.', date: '2 days ago', read: false },
  { id: 2, title: 'New Login', message: 'There was a new login to your account from Cần Thơ.', date: '4 days ago', read: true },
];

export function AccountPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { userId, isAuthenticated, isLoading, logout } = useAuth();
  const { user, loading, error, editUser } = useUser(userId);
  const [activeTab, setActiveTab] = React.useState(searchParams.get('tab') || 'profile');

  // State to hold all displayable user data
  const [profileData, setProfileData] = React.useState({
    userFullname: '',
    userUsername: '',
    userEmail: '',
    userPhone: '',
    userAddress: '',
    userBirthdate: '',
    userImage: '',
    userCreatedAt: '',
    userUpdatedAt: '',
    roleName: '',
  });

  const [orders, setOrders] = React.useState(mockOrders);
  const [notifications, setNotifications] = React.useState(mockNotifications);

  // Populate form state once the user object is fetched from the hook
  React.useEffect(() => {
    if (user) {
      setProfileData({
        userFullname: user.userFullname || '',
        userUsername: user.userUsername || '',
        userEmail: user.userEmail || '',
        userPhone: user.userPhone || '',
        userAddress: user.userAddress || '',
        userBirthdate: user.userBirthdate ? user.userBirthdate.split('T')[0] : '',
        userImage: user.userImage || '',
        userCreatedAt: user.userCreatedAt || '',
        userUpdatedAt: user.userUpdatedAt || '',
        roleName: user.roleName || '',
      });
    }
  }, [user]);

  const [settings, setSettings] = React.useState({
    emailNotifications: true,
    smsNotifications: false,
  });

  // Effect for handling authentication and redirection
  useEffect(() => {
    if (isLoading) {
      return;
    }
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Show loading spinner if auth or user data is being fetched
  if (loading || isLoading) {
    return <div className="text-center p-10">Loading account details...</div>;
  }

  // --- MAIN FIX: Update logic is now correctly inside this function ---
  const handleProfileUpdate = async () => {
    if (!user) {
      toast.error("Cannot update profile: User data is not available.");
      return;
    }

    // 1. Create a new payload object that matches the UpdateUserDTO
    const updatePayload = {
      userFullname: profileData.userFullname,
      userPhone: profileData.userPhone,
      userBirthdate: profileData.userBirthdate,
      userAddress: profileData.userAddress,
      roleId: 2,
      userImage: profileData.userImage,
      isUserEnabled: user.isUserEnabled,
    };

    console.log('Sending DTO to API:', updatePayload);

    // 2. Send the correctly structured payload
    const success = await editUser(userId, updatePayload);

    if (success) {
      toast.success('Profile updated successfully!');
    } else {
      toast.error('Failed to update profile. Please try again.');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    toast.success('Logged out successfully');
  };

  const markNotificationAsRead = (id) => { /* ... */ };
  const getStatusColor = (status) => { /* ... */ };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">My Account</h1>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="logout" onClick={handleLogout}>Logout</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <Card>
            <CardHeader>
              {/* VIEW UPDATE: Display user role as a badge */}
              <div className="flex justify-between items-center">
                <CardTitle>Profile Information</CardTitle>
                {profileData.roleName && <Badge variant="outline">{profileData.roleName}</Badge>}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={profileData.userImage} alt={profileData.userFullname} />
                  <AvatarFallback className="text-xl">
                    {profileData.userFullname?.split(' ').map(n => n[0]).join('') || 'U'}
                  </AvatarFallback>
                </Avatar>
                <Button variant="outline">Change Avatar</Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input id="fullName" value={profileData.userFullname} onChange={(e) => setProfileData(prev => ({ ...prev, userFullname: e.target.value }))} />
                </div>
                <div>
                  {/* VIEW UPDATE: Made non-editable fields read-only */}
                  <Label htmlFor="username">Username (cannot be changed)</Label>
                  <Input id="username" value={profileData.userUsername} readOnly disabled />
                </div>
                <div>
                  <Label htmlFor="email">Email (cannot be changed)</Label>
                  <Input id="email" type="email" value={profileData.userEmail} readOnly disabled />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" value={profileData.userPhone} onChange={(e) => setProfileData(prev => ({ ...prev, userPhone: e.target.value }))} />
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" value={profileData.userAddress} onChange={(e) => setProfileData(prev => ({ ...prev, userAddress: e.target.value }))} />
                </div>
                <div>
                  <Label htmlFor="birthdate">Birthdate</Label>
                  <Input id="birthdate" type="date" value={profileData.userBirthdate} onChange={(e) => setProfileData(prev => ({ ...prev, userBirthdate: e.target.value }))} />
                </div>
              </div>

              {/* The onClick handler now correctly calls the update function */}
              <Button onClick={handleProfileUpdate}>Update Profile</Button>

              {/* VIEW UPDATE: Added a footer to display metadata */}
              <div className="text-sm text-muted-foreground pt-4 border-t mt-6 space-y-1">
                {profileData.userCreatedAt && <p>Account Created: {new Date(profileData.userCreatedAt).toLocaleString('vi-VN')}</p>}
                {profileData.userUpdatedAt && <p>Last Updated: {new Date(profileData.userUpdatedAt).toLocaleString('vi-VN')}</p>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              {notifications.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No notifications</p>
              ) : (
                <div className="space-y-4">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`border rounded-lg p-4 cursor-pointer ${!notification.read ? 'bg-muted' : ''}`}
                      onClick={() => markNotificationAsRead(notification.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium">{notification.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {notification.message}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">{notification.date}</p>
                          {!notification.read && (
                            <Badge variant="secondary" className="mt-1">New</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}