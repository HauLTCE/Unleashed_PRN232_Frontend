import React, { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { useAuth } from "../hooks/User/useAuth";
import { useUser } from "../hooks/User/useUser";
import { useImageUpload } from "../hooks/useImageUpload";
import { useNotificationUsers } from "../hooks/NotificationUser/useNotificationUsers";
import { useMyOrders } from "../hooks/Order/useMyOrders";


export function AccountPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const { userId, isAuthenticated, isLoading: authLoading } = useAuth();
  const { user, loading: userLoading, editUser } = useUser(userId);

  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "profile");
  const {
    orders,
    loading: ordersLoading,
    error: ordersError,
    pageNumber: ordersPageNum,
    totalPages: ordersTotalPages,
    setPageNumber: setOrdersPageNum,
    refresh: refreshOrders
  } = useMyOrders();


  const [selectedNotification, setSelectedNotification] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB"); // dd/mm/yyyy
  };


  /** ------------------- IMAGE UPLOAD ------------------- **/
  const { uploadFile, loading: uploadingAvatar } = useImageUpload();
  const fileInputRef = useRef(null);

  /** ------------------- PROFILE FORM STATE ------------------- **/
  const [profileData, setProfileData] = useState({
    userFullname: "",
    userUsername: "",
    userEmail: "",
    userPhone: "",
    userAddress: "",
    userBirthdate: "",
    userImage: "",
    userCreatedAt: "",
    userUpdatedAt: "",
    roleName: "",
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        userFullname: user.userFullname || "",
        userUsername: user.userUsername || "",
        userEmail: user.userEmail || "",
        userPhone: user.userPhone || "",
        userAddress: user.userAddress || "",
        userBirthdate: user.userBirthdate?.split("T")[0] || "",
        userImage: user.userImage || "",
        userCreatedAt: user.userCreatedAt || "",
        userUpdatedAt: user.userUpdatedAt || "",
        roleName: user.roleName || "",
      });
    }
  }, [user]);

  /** ------------------- NOTIFICATIONS ------------------- **/
  const {
    notifications,
    unviewCount,
    loading: notifLoading,
    markAsViewed,
    markAsDelete,
    setNotifications,
    setUnviewCount,
    pageNumber: notiPageNum,
    totalPages: notiTotalPages
  } = useNotificationUsers(userId);

  const handleMarkAsViewed = async (id) => {
    await markAsViewed(id);

    setNotifications(prev =>
      prev.map(n =>
        n.notificationId === id ? { ...n, isNotificationViewed: true } : n
      )
    );

    setUnviewCount(prev => Math.max(prev - 1, 0));
  };



  const handleOpenNotification = async (n) => {
    setSelectedNotification(n);
    setIsModalOpen(true);

    // Auto-mark as viewed
    if (!n.isNotificationViewed) {
      await handleMarkAsViewed(n.notificationId);

      // Update local state instantly
      notifications.map(item =>
        item.notificationId === n.notificationId
          ? { ...item, isNotificationViewed: true }
          : item
      );
    }
  };


  /** ------------------- AUTH REDIRECT ------------------- **/
  useEffect(() => {
    if (!authLoading && !isAuthenticated) navigate("/login");
  }, [authLoading, isAuthenticated, navigate]);

  /** ------------------- AVATAR UPLOAD ------------------- **/
  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    uploadFile(file).then((res) => {
      if (res?.imageUrl) {
        setProfileData((prev) => ({ ...prev, userImage: res.imageUrl }));
      }
    });
  };

  /** ------------------- UPDATE PROFILE ------------------- **/
  const handleProfileUpdate = async () => {
    if (!user) return toast.error("User data unavailable.");

    const updatePayload = {
      userFullname: profileData.userFullname,
      userPhone: profileData.userPhone,
      userBirthdate: profileData.userBirthdate,
      userAddress: profileData.userAddress,
      userImage: profileData.userImage,
      roleId: 2,
      isUserEnabled: user.isUserEnabled,
    };

    try {
      await editUser(userId, updatePayload);
      toast.success("Profile updated successfully!");
    } catch {
      toast.error("Failed to update profile.");
    }
  };

  /** ------------------- LOADING STATE ------------------- **/
  if (authLoading || userLoading) {
    return <div className="text-center p-10">Loading account details...</div>;
  }

  /** ------------------- UI ------------------- **/
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">My Account</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="notifications">
            Notifications {unviewCount > 0 && `(${unviewCount})`}
          </TabsTrigger>
        </TabsList>

        {/* ---------------- PROFILE TAB ---------------- */}
        <TabsContent value="profile" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Profile Information</CardTitle>
                {profileData.roleName && (
                  <Badge variant="outline">{profileData.roleName}</Badge>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-6">

              {/* Avatar Section */}
              <div className="flex items-center space-x-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={profileData.userImage} />
                  <AvatarFallback>
                    {profileData.userFullname?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>

                <div className="flex flex-col space-y-2">
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Change Avatar
                  </Button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField label="Full Name" value={profileData.userFullname}
                  onChange={(v) => setProfileData((p) => ({ ...p, userFullname: v }))} />

                <InputField label="Username" value={profileData.userUsername} disabled />

                <InputField label="Email" value={profileData.userEmail} disabled />

                <InputField label="Phone" value={profileData.userPhone}
                  onChange={(v) => setProfileData((p) => ({ ...p, userPhone: v }))} />

                <InputField label="Address" value={profileData.userAddress}
                  onChange={(v) => setProfileData((p) => ({ ...p, userAddress: v }))} />

                <InputField label="Birthdate" type="date" value={profileData.userBirthdate}
                  onChange={(v) => setProfileData((p) => ({ ...p, userBirthdate: v }))} />
              </div>

              <Button onClick={handleProfileUpdate} disabled={uploadingAvatar}>
                {uploadingAvatar ? "Uploading..." : "Update Profile"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="mt-6">
          <Card>
            <CardHeader className="flex justify-between items-center">
              <CardTitle>My Orders</CardTitle>
              <Button variant="outline" onClick={refreshOrders}>Refresh</Button>
            </CardHeader>

            <CardContent>
              {ordersLoading ? (
                <p className="text-center py-8">Loading orders...</p>
              ) : ordersError ? (
                <p className="text-center text-red-500 py-8">{ordersError}</p>
              ) : orders.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">You have no orders yet.</p>
              ) : (
                <>
                  <div className="space-y-4" id="ordersList">
                    {orders.map((o) => (
                      <Link
                        to={`/order/${o.orderId}`}
                        key={o.orderId}
                        className="border rounded-lg p-4 flex justify-between items-center hover:bg-gray-50 transition"
                      >
                        <div>
                          <p className="font-medium">Order #{o.orderTrackingNumber}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(o.orderDate).toLocaleDateString()}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="font-semibold">{o.orderTotalAmount?.toFixed(2)}đ</p>
                          <Badge variant="outline">{o.orderStatusName}</Badge>
                        </div>
                      </Link>
                    ))}
                  </div>

                  {/* 🔥 PAGINATION */}
                  <div className="flex justify-between items-center mt-6 pt-4 border-t">
                    <Button
                      variant="outline"
                      disabled={ordersPageNum <= 1}
                      onClick={() => {
                        setOrdersPageNum((p) => p - 1);
                        document.getElementById("ordersList")?.scrollIntoView({ behavior: "smooth" });
                      }}
                    >
                      Previous
                    </Button>

                    <span className="text-sm text-muted-foreground">
                      Page {ordersPageNum} of {ordersTotalPages}
                    </span>

                    <Button
                      variant="outline"
                      disabled={ordersPageNum >= ordersTotalPages}
                      onClick={() => {
                        setOrdersPageNum((p) => p + 1);
                        document.getElementById("ordersList")?.scrollIntoView({ behavior: "smooth" });
                      }}
                    >
                      Next
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>


        {/* ---------------- NOTIFICATIONS TAB ---------------- */}
        <TabsContent value="notifications" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
            </CardHeader>

            <CardContent>

              {notifLoading ? (
                <p className="text-center py-8">Loading notifications...</p>
              ) : notifications.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No notifications
                </p>
              ) : (
                <>
                  <div className="space-y-4" id="notifList">
                    {notifications.map((n) => (
                      <div
                        key={n.notificationId}
                        className={`border rounded-lg p-4 cursor-pointer ${!n.isNotificationViewed ? "bg-muted" : ""
                          }`}
                        onClick={() => handleOpenNotification(n)}
                      >
                        <div className="flex justify-between">
                          <div>
                            <h3 className="font-medium">
                              {n.notificationDTO.notificationTitle}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              {n.notificationDTO.notificationContent}
                            </p>
                          </div>
                          {!n.isNotificationViewed && (
                            <Badge variant="secondary">New</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 🔥 PAGINATION */}
                  <div className="flex justify-between items-center mt-6 pt-4 border-t">
                    <Button
                      variant="outline"
                      disabled={notiPageNum <= 1}
                      onClick={() => {
                        setPageNumber((p) => p - 1);
                        document.getElementById("notifList")?.scrollIntoView({ behavior: "smooth" });
                      }}
                    >
                      Previous
                    </Button>

                    <span className="text-sm text-muted-foreground">
                      Page {notiPageNum} of {notiTotalPages}
                    </span>

                    <Button
                      variant="outline"
                      disabled={notiPageNum >= notiTotalPages}
                      onClick={() => {
                        setPageNumber((p) => p + 1);
                        document.getElementById("notifList")?.scrollIntoView({ behavior: "smooth" });
                      }}
                    >
                      Next
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-lg">
          {selectedNotification && (
            <>
              <DialogHeader>
                <DialogTitle>
                  {selectedNotification.notificationDTO.notificationTitle}
                </DialogTitle>
              </DialogHeader>

              <p className="text-muted-foreground mt-2">
                {selectedNotification.notificationDTO.notificationContent}
              </p>

              <div className="text-xs text-gray-500 mt-4 border-t pt-3">
                <p>📅 {formatDate(selectedNotification.notificationDTO.notificationCreatedAt)}</p>
              </div>

              {/* --- Delete Button --- */}
              <div className="flex justify-end mt-4">
                <Button
                  variant="destructive"
                  onClick={() => markAsDelete(selectedNotification.notificationId)}
                >
                  Delete
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>


    </div>
  );
}

/** Small Input Wrapper */
function InputField({ label, value, onChange, ...props }) {
  return (
    <div>
      <Label>{label}</Label>
      <Input
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        {...props}
      />
    </div>
  );
}
