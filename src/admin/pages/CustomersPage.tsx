import React, { useMemo, useState, useEffect } from 'react';
import { AdminLayout } from '../components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '../../components/ui/pagination';
import { Search, Eye, Mail, Trash2, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useUsers } from '../../hooks/User/useUsers';

const ITEMS_PER_PAGE = 10;

type DisplayUser = {
  id: string;
  fullName: string;
  username: string;
  email: string;
  avatar: string;
  status: boolean;
  role: string;
};

// --- Sub-component for the page header and controls ---
const PageHeader = ({ searchQuery, onSearchChange }) => (
  <div>
    <h1 className="text-3xl font-bold">Customers Management</h1>
    <p className="text-muted-foreground">Manage your customer base and relationships</p>
    <div className="mt-4 flex items-center justify-between gap-4">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search by name, email, or username..."
          value={searchQuery}
          onChange={onSearchChange}
          className="pl-10"
        />
      </div>
      <Button asChild>
        <Link to="/admin/users/create">
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Employee
        </Link>
      </Button>
    </div>
  </div>
);

// --- Sub-component for rendering the customer table ---
const CustomerTable = ({ customers, onDeleteCustomer, loading }) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Customer</TableHead>
        <TableHead>Status</TableHead>
        <TableHead>Role</TableHead>
        <TableHead className="text-right">Actions</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {customers.length > 0 ? (
        customers.map((customer) => (
          <TableRow key={customer.id}>
            <TableCell>
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={customer.avatar} alt={customer.fullName} />
                  <AvatarFallback>{customer.fullName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{customer.fullName}</div>
                  <div className="text-sm text-muted-foreground">{customer.email}</div>
                </div>
              </div>
            </TableCell>
            <TableCell>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${customer.status ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                {customer.status ? 'Active' : 'Disabled'}
              </span>
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">{customer.role}</TableCell>
            <TableCell>
              <div className="flex items-center justify-end gap-2">
                <Button variant="ghost" size="icon" asChild disabled={loading}>
                  <Link to={`/admin/users/${customer.id}`}><Eye className="h-4 w-4" /></Link>
                </Button>
                <Button variant="ghost" size="icon" asChild disabled={loading}>
                  <a href={`mailto:${customer.email}`}><Mail className="h-4 w-4" /></a>
                </Button>
                <Button variant="ghost" size="icon" onClick={() => onDeleteCustomer(customer.id)} disabled={loading}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))
      ) : (
        <TableRow>
          <TableCell colSpan={4} className="h-24 text-center">
            No customers found.
          </TableCell>
        </TableRow>
      )}
    </TableBody>
  </Table>
);

const CustomerPagination = ({ pagination, onPageChange }) => {
  if (pagination.totalPages <= 1) return null;

  return (
    <div className="mt-4">
      <Pagination>
        {/* The parent container now controls the spacing for all children */}
        <PaginationContent className="space-x-4">
          <PaginationItem> {/* No margin class needed here */}
            <PaginationPrevious
              onClick={() => onPageChange(pagination.currentPage - 1)}
              className={!pagination.hasPrevious ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
            />
          </PaginationItem>

          <PaginationItem>
            <PaginationLink>
              Page {pagination.currentPage} of {pagination.totalPages}
            </PaginationLink>
          </PaginationItem>

          <PaginationItem>
            <PaginationNext
              onClick={() => onPageChange(pagination.currentPage + 1)}
              className={!pagination.hasNext ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};


// --- Main Page Component ---
export function CustomersPage() {
  // 1. Destructure the new 'pagination' object from the hook
  const { users: apiUsers, pagination, loading, error, fetchUsers, removeUser } = useUsers();

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // 2. Debounce the search input to avoid excessive API calls
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setCurrentPage(1); // Reset to page 1 when search query changes
    }, 300); // 300ms delay

    return () => {
      clearTimeout(timerId);
    };
  }, [searchQuery]);
  useEffect(() => {
    fetchUsers(currentPage, ITEMS_PER_PAGE, debouncedSearchQuery);
  }, [fetchUsers, currentPage, debouncedSearchQuery]);

  // Memoize the mapped customers. This part is still useful.
  const customers: DisplayUser[] = useMemo(() => {
    if (!Array.isArray(apiUsers)) return [];
    return apiUsers.map(user => ({
      id: user.userId,
      fullName: user.userFullname,
      username: user.userUsername,
      email: user.userEmail,
      avatar: user.userImage,
      status: user.isUserEnabled,
      role: user.roleName,
    }));
  }, [apiUsers]);

  // 4. REMOVED client-side filtering and pagination. The `customers` array is now the final data to display.

  const handleDeleteCustomer = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this customer?")) {
      const success = await removeUser(id);
      if (success) {
        // 5. Refresh the data on the current page after a successful delete
        fetchUsers(currentPage, ITEMS_PER_PAGE, debouncedSearchQuery);
      } else {
        alert("Failed to delete customer. Please try again.");
      }
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <PageHeader searchQuery={searchQuery} onSearchChange={(e) => setSearchQuery(e.target.value)} />

        <Card>
          <CardHeader>
            {/* 6. Display total count from the pagination object */}
            <CardTitle>Customers ({pagination.totalCount})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading && customers.length === 0 && <p className="text-center py-24">Loading customers...</p>}
            {error && <p className="text-center py-24 text-red-500">{error}</p>}
            {!error && (
              <>
                {/* 7. Pass the directly mapped `customers` array. No more slicing. */}
                <CustomerTable customers={customers} onDeleteCustomer={handleDeleteCustomer} loading={loading} />

                {/* 8. Pass the pagination object and the page change handler */}
                <CustomerPagination pagination={pagination} onPageChange={setCurrentPage} />
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}