
"use client";
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Users, Eye, ShieldAlert, Settings, FileText, Search, Trash2, Edit3, Loader2 } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, updateDoc, deleteDoc, query, orderBy, limit, onSnapshot, setDoc, serverTimestamp, where } from "firebase/firestore";
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface UserData {
  id: string;
  email: string;
  role: string;
  status: string;
  lastLogin: any; // Firestore Timestamp or ISO string
  promptsToday?: number; // Optional
  displayName?: string;
  photoURL?: string;
  createdAt?: any;
}

interface MediaData {
  id: string;
  type: string;
  name: string;
  uploaderEmail: string; // Changed from uploader for clarity
  uploadedAt: any; // Firestore Timestamp or ISO string
  status: 'approved' | 'pending' | 'rejected';
  fileURL?: string;
}

interface ApiLogData {
  id: string;
  userId: string;
  userEmail?: string; // For easier display
  endpoint: string;
  timestamp: any; // Firestore Timestamp or ISO string
  status: number;
  ipAddress?: string;
}

interface FeatureToggleData {
  id: string;
  name: string;
  enabled: boolean;
  description?: string;
}


export default function AdminPage() {
  const { user: authUser, loading: authLoading, isAdmin: authIsAdmin } = useAuth();
  const { toast } = useToast();

  const [users, setUsers] = useState<UserData[]>([]);
  const [media, setMedia] = useState<MediaData[]>([]);
  const [apiLogs, setApiLogs] = useState<ApiLogData[]>([]);
  const [featureToggles, setFeatureToggles] = useState<FeatureToggleData[]>([]);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoadingData, setIsLoadingData] = useState(true);
  
  // Use effective admin status, considering auth loading state
  const isAdmin = !authLoading && authUser && authIsAdmin;


  useEffect(() => {
    if (authLoading) return; // Wait for auth state to resolve

    if (!authUser || !isAdmin) {
      setIsLoadingData(false);
      return;
    }

    setIsLoadingData(true);
    const unsubscribers: (() => void)[] = [];

    // Fetch Users
    const usersQuery = query(collection(db, "users"), orderBy("email"));
    unsubscribers.push(onSnapshot(usersQuery, (snapshot) => {
      const fetchedUsers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserData));
      setUsers(fetchedUsers);
    }, (error) => {
      console.error("Error fetching users:", error);
      toast({ title: "Error", description: "Could not fetch users.", variant: "destructive" });
    }));

    // Fetch Media (example: 'mediaUploads' collection)
    const mediaQuery = query(collection(db, "mediaUploads"), orderBy("uploadedAt", "desc"), limit(50));
    unsubscribers.push(onSnapshot(mediaQuery, (snapshot) => {
      const fetchedMedia = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MediaData));
      setMedia(fetchedMedia);
    }, (error) => {
      console.error("Error fetching media:", error);
      toast({ title: "Error", description: "Could not fetch media.", variant: "destructive" });
    }));
    
    // Fetch API Logs (example: 'apiLogs' collection)
    const apiLogsQuery = query(collection(db, "apiLogs"), orderBy("timestamp", "desc"), limit(100));
     unsubscribers.push(onSnapshot(apiLogsQuery, async (snapshot) => {
        const fetchedLogsPromises = snapshot.docs.map(async (logDoc) => {
            const logData = logDoc.data() as Omit<ApiLogData, 'id' | 'userEmail'>;
            let userEmail = 'N/A';
            if (logData.userId) {
                const userDocRef = doc(db, "users", logData.userId);
                const userDocSnap = await getDoc(userDocRef);
                if (userDocSnap.exists()) {
                    userEmail = userDocSnap.data()?.email || 'Unknown User';
                }
            }
            return { id: logDoc.id, ...logData, userEmail } as ApiLogData;
        });
        const fetchedLogs = await Promise.all(fetchedLogsPromises);
        setApiLogs(fetchedLogs);
    }, (error) => {
        console.error("Error fetching API logs:", error);
        toast({ title: "Error", description: "Could not fetch API logs.", variant: "destructive" });
    }));


    // Fetch Feature Toggles
    const featuresQuery = query(collection(db, "featureToggles"), orderBy("name"));
    unsubscribers.push(onSnapshot(featuresQuery, (snapshot) => {
      const fetchedFeatures = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FeatureToggleData));
      setFeatureToggles(fetchedFeatures);
    }, (error) => {
      console.error("Error fetching feature toggles:", error);
      toast({ title: "Error", description: "Could not fetch feature toggles.", variant: "destructive" });
    }));

    setIsLoadingData(false);
    return () => unsubscribers.forEach(unsub => unsub());
  }, [authUser, isAdmin, authLoading, toast]);

  if (authLoading || isLoadingData && !(!authUser || !isAdmin)) { // Show loader if auth is loading or if admin and data is loading
    return (
      <div className="container mx-auto py-12 px-4 md:px-6 text-center">
        <Loader2 className="mx-auto h-12 w-12 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground">Loading admin panel...</p>
      </div>
    );
  }
  
  if (!authUser || !isAdmin) {
    return (
      <div className="container mx-auto py-12 px-4 md:px-6 text-center">
        <ShieldAlert className="mx-auto h-12 w-12 text-destructive mb-4" />
        <h1 className="text-3xl font-orbitron font-bold mb-4">Admin Access Only</h1>
        <p className="text-muted-foreground">You do not have permission to view this page. Ensure you are logged in with an admin account.</p>
      </div>
    );
  }

  const handleUserUpdate = async (userId: string, data: Partial<UserData>) => {
    try {
      await updateDoc(doc(db, "users", userId), {...data, updatedAt: serverTimestamp()});
      toast({ title: "User Updated", description: "User details saved successfully." });
    } catch (error) {
      console.error("Error updating user:", error);
      toast({ title: "Error", description: "Failed to update user.", variant: "destructive" });
    }
  };
  
  const handleMediaStatusChange = async (mediaId: string, newStatus: MediaData['status']) => {
    try {
      await updateDoc(doc(db, "mediaUploads", mediaId), { status: newStatus });
      toast({ title: "Media Status Updated", description: `Media marked as ${newStatus}.` });
    } catch (error) {
      console.error("Error updating media status:", error);
      toast({ title: "Error", description: "Failed to update media status.", variant: "destructive" });
    }
  };
  
  const handleFeatureToggle = async (featureId: string, enabled: boolean) => {
    try {
      await updateDoc(doc(db, "featureToggles", featureId), { enabled });
      toast({ title: "Feature Toggle Updated", description: `Feature ${enabled ? 'enabled' : 'disabled'}.` });
    } catch (error) {
      console.error("Error updating feature toggle:", error);
      toast({ title: "Error", description: "Failed to update feature toggle.", variant: "destructive" });
    }
  };

  // Implement delete functions (use with caution, add confirmation dialogs)
  const handleDeleteUser = async (userId: string) => {
    if (window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      try {
        await deleteDoc(doc(db, "users", userId));
        // Note: Deleting a Firebase Auth user requires Admin SDK (backend)
        toast({ title: "User Deleted (Firestore)", description: "User document removed from Firestore." });
      } catch (error) {
        toast({ title: "Error", description: "Failed to delete user from Firestore.", variant: "destructive" });
      }
    }
  };

  const handleDeleteMedia = async (mediaId: string) => {
     if (window.confirm("Are you sure you want to delete this media item?")) {
        try {
            // TODO: Also delete from Firebase Storage if applicable
            await deleteDoc(doc(db, "mediaUploads", mediaId));
            toast({ title: "Media Deleted", description: "Media item removed." });
        } catch (error) {
            toast({ title: "Error", description: "Failed to delete media.", variant: "destructive" });
        }
     }
  };


  const filteredUsers = users.filter(u => u.email?.toLowerCase().includes(searchTerm.toLowerCase()) || u.displayName?.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredApiLogs = apiLogs.filter(log => log.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) || log.endpoint.toLowerCase().includes(searchTerm.toLowerCase()));

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    if (timestamp.toDate) return timestamp.toDate().toLocaleString(); // Firestore Timestamp
    if (typeof timestamp === 'string') return new Date(timestamp).toLocaleString();
    return 'Invalid Date';
  };


  return (
    <div className="container mx-auto py-12 px-4 md:px-6 space-y-8">
      <header className="text-center">
        <Settings className="mx-auto h-16 w-16 text-primary mb-4 animate-spin-slow" />
        <h1 className="text-4xl font-orbitron font-bold tracking-tight sm:text-5xl holographic-text">Admin Panel</h1>
        <p className="mt-4 text-lg text-muted-foreground">Manage ERIMTECH AI platform resources and settings.</p>
      </header>

      <Input 
        type="search"
        placeholder="Search users, logs, or features..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="max-w-md mx-auto glassmorphic"
      />

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 gap-2 glassmorphic p-1">
          <TabsTrigger value="users" className="font-orbitron"><Users className="inline mr-2 h-4 w-4" />Users</TabsTrigger>
          <TabsTrigger value="media" className="font-orbitron"><Eye className="inline mr-2 h-4 w-4" />Media Review</TabsTrigger>
          <TabsTrigger value="api-logs" className="font-orbitron"><FileText className="inline mr-2 h-4 w-4" />API Logs</TabsTrigger>
          <TabsTrigger value="features" className="font-orbitron"><Settings className="inline mr-2 h-4 w-4" />Features</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-6">
          <Card className="glassmorphic">
            <CardHeader>
              <CardTitle className="font-orbitron">User Management</CardTitle>
              <CardDescription>View and manage platform users.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Display Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map(user => (
                    <TableRow key={user.id}>
                      <TableCell>{user.displayName || 'N/A'}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Select value={user.role} onValueChange={(value) => handleUserUpdate(user.id, { role: value })}>
                            <SelectTrigger className="w-[120px] h-8 text-xs glassmorphic">
                                <SelectValue placeholder="Role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="user">User</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select value={user.status} onValueChange={(value) => handleUserUpdate(user.id, { status: value })}>
                            <SelectTrigger className="w-[120px] h-8 text-xs glassmorphic">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="suspended">Suspended</SelectItem>
                                <SelectItem value="banned">Banned</SelectItem>
                            </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>{formatTimestamp(user.lastLogin)}</TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => alert(`View/Edit user ${user.id} (not implemented)`)}><Edit3 className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteUser(user.id)}><Trash2 className="h-4 w-4" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="media" className="mt-6">
          <Card className="glassmorphic">
            <CardHeader>
              <CardTitle className="font-orbitron">Uploaded Media Review</CardTitle>
              <CardDescription>Review and moderate user-uploaded media.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Uploader</TableHead>
                    <TableHead>Uploaded At</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {media.map(item => (
                    <TableRow key={item.id}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.type}</TableCell>
                      <TableCell>{item.uploaderEmail}</TableCell>
                      <TableCell>{formatTimestamp(item.uploadedAt)}</TableCell>
                      <TableCell>
                         <Select value={item.status} onValueChange={(value) => handleMediaStatusChange(item.id, value as MediaData['status'])}>
                            <SelectTrigger className="w-[120px] h-8 text-xs glassmorphic">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="approved">Approved</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="rejected">Rejected</SelectItem>
                            </SelectContent>
                        </Select>
                      </TableCell>
                       <TableCell className="text-right space-x-1">
                        {item.fileURL && <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => window.open(item.fileURL, '_blank')}><Eye className="h-4 w-4" /></Button>}
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteMedia(item.id)}><Trash2 className="h-4 w-4" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="api-logs" className="mt-6">
          <Card className="glassmorphic">
            <CardHeader>
              <CardTitle className="font-orbitron">API Usage Logs</CardTitle>
              <CardDescription>View logs of API requests made to the platform. (Recent 100 logs)</CardDescription>
            </CardHeader>
            <CardContent>
               <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User Email</TableHead>
                    <TableHead>Endpoint</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>IP Address</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApiLogs.map(log => (
                    <TableRow key={log.id}>
                      <TableCell>{log.userEmail || log.userId}</TableCell>
                      <TableCell>{log.endpoint}</TableCell>
                      <TableCell>{formatTimestamp(log.timestamp)}</TableCell>
                      <TableCell className={log.status === 200 ? 'text-green-500' : (log.status >= 400 && log.status < 500 ? 'text-orange-500' : 'text-red-500')}>{log.status}</TableCell>
                      <TableCell>{log.ipAddress || 'N/A'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="mt-6">
          <Card className="glassmorphic">
            <CardHeader>
              <CardTitle className="font-orbitron">Feature Toggles</CardTitle>
              <CardDescription>Enable or disable platform features globally.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {featureToggles.length === 0 && <p className="text-muted-foreground">No feature toggles configured yet.</p>}
              {featureToggles.map(feature => (
                <div key={feature.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                  <div>
                    <Label htmlFor={feature.id} className="text-base">{feature.name}</Label>
                    {feature.description && <p className="text-xs text-muted-foreground">{feature.description}</p>}
                  </div>
                  <Switch
                    id={feature.id}
                    checked={feature.enabled}
                    onCheckedChange={(checked) => handleFeatureToggle(feature.id, checked)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="glassmorphic">
        <CardHeader>
          <CardTitle className="font-orbitron flex items-center"><BarChart className="inline mr-2 h-6 w-6" />Platform Overview</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-3xl font-bold holographic-text !bg-clip-text !text-transparent">{users.length}</p>
            <p className="text-muted-foreground">Total Users</p>
          </div>
          <div>
            <p className="text-3xl font-bold holographic-text !bg-clip-text !text-transparent">{apiLogs.length}</p>
            <p className="text-muted-foreground">API Requests (Loaded)</p>
          </div>
          <div>
            <p className="text-3xl font-bold holographic-text !bg-clip-text !text-transparent">{media.filter(m => m.status === 'pending').length}</p>
            <p className="text-muted-foreground">Media Pending Review</p>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
