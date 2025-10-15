import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AdminLayout } from '../components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { ArrowLeft } from 'lucide-react';
import { useUsers } from '../../hooks/User/useUsers';
import { useRoles } from '../../hooks/User/Role/useRole';

// 1. Updated initial state for the form
const initialFormData = {
    UserFullname: '',
    UserUsername: '',
    UserEmail: '',
    UserPassword: '',
    ConfirmPassword: '',
    RoleId: 3
};

export function CreateEmployeePage() {
    const [formData, setFormData] = useState(initialFormData);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const { addUser } = useUsers();
    const { roles, loading } = useRoles();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        // 2. Add password confirmation check
        if (formData.UserPassword !== formData.ConfirmPassword) {
            setError("Passwords do not match.");
            setIsSubmitting(false);
            return; // Stop the submission
        }

        try {

            await addUser(formData);

            alert('User created successfully!');
            navigate('/admin/users');
        } catch (err) {
            console.error("Failed to create user:", err);
            setError("Could not create user. The username or email may already be taken.");
        } finally {
            setIsSubmitting(false);
        }
    };

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
                    <h1 className="text-3xl font-bold">Create New User</h1>
                    <p className="text-muted-foreground">Fill out the form to add a new user.</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Account Information</CardTitle>
                            <CardDescription>Enter the user's account details below.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {/* 3. Updated form fields */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="UserFullname">Full Name</Label>
                                    <Input id="UserFullname" value={formData.UserFullname} onChange={handleChange} placeholder="e.g., Jane Doe" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="UserUsername">Username</Label>
                                    <Input id="UserUsername" value={formData.UserUsername} onChange={handleChange} placeholder="e.g., janedoe99" required />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="UserEmail">Email</Label>
                                    <Input id="UserEmail" type="email" value={formData.UserEmail} onChange={handleChange} placeholder="user@example.com" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="UserPassword">Password</Label>
                                    <Input id="UserPassword" type="password" value={formData.UserPassword} onChange={handleChange} placeholder="••••••••" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="ConfirmPassword">Confirm Password</Label>
                                    <Input id="ConfirmPassword" type="password" value={formData.ConfirmPassword} onChange={handleChange} placeholder="••••••••" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="RoleId">Role</Label>
                                    {/* 4. Role select now uses numeric values */}
                                    <Select
                                        value={String(formData.RoleId)}
                                        onValueChange={(value) => setFormData(prev => ({ ...prev, RoleId: parseInt(value, 10) }))}
                                    >
                                        <SelectTrigger id="RoleId">
                                            <SelectValue placeholder="Select a role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {/* Display a loading state while roles are being fetched */}
                                            {loading ? (
                                                <SelectItem value="loading" disabled>Loading roles...</SelectItem>
                                            ) : (
                                                roles.map(role => (
                                                    <SelectItem
                                                        key={role.roleId}              // FIX 1: Added unique key prop
                                                        value={String(role.roleId)}    // FIX 2: Converted value to a string
                                                    >
                                                        {role.roleName}
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-between items-center">
                            {error && <p className="text-sm text-red-500">{error}</p>}
                            <div className="flex-grow" />
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Creating User...' : 'Create User'}
                            </Button>
                        </CardFooter>
                    </Card>
                </form>
            </div>
        </AdminLayout>
    );
}