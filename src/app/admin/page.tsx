"use client";
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { BarChart, Users, Eye, ShieldAlert, Settings, FileText, Search, Trash2, Edit3 } from "lucide-react";
// import { useAuth } from "@/hooks/use-auth"; // Placeholder for auth
// import { db } from "@/lib/firebase"; // Placeholder for Firebase
// import { collection, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore"; // Placeholder

// Mock data - replace with actual Firebase data
const mockUsers = [
  { id: "user1", email: "alpha@example.com", role: "admin", status: "active", lastLogin: new Date().toISOString(), promptsToday: 50 },
  { id: "user2", email: "beta@example.com", role: "user", status: "active", lastLogin: new Date(Date.now() - 86400000).toISOString(), promptsToday: 120 },
  { id: "user3", email: "gamma@example.com", role: "user", status: "suspended", lastLogin: new Date(Date.now() - 172800000).toISOString(), promptsToday: 5 },
];

const mockMedia = [
  { id: "media1", type: "image", name: "futuristic_city.jpg", uploader: "beta@example.com", uploadedAt: new Date().toISOString(), status: "approved" },
  { id: "media2", type: "audio", name: "conference_call.mp3", uploader: "alpha@example.com", uploadedAt: new Date(Date.now() - 3600000).toISOString(), status: "pending" },
];

const mockApiLogs = [
  { id: "log1", userId: "user2", endpoint: "/v1/chat", timestamp: new Date().toISOString(), status: 200, ipAddress: "192.168.1.100" },
  { id: "log2", userId: "user1", endpoint: "/v1/code/generate", timestamp: new Date(Date.now() - 60000).toISOString(), status: 200, ipAddress: "203.0.113.45" },
  { id: "log3", userId: "user2", endpoint: "/v1/image/analyze", timestamp: new Date(Date.now() - 120000).toISOString(), status: 429, ipAddress: "192.168.1.100" },
];

const mockFeatureToggles = [
  { id: "imageUploads", name: "Image Uploads", enabled: true },
  { id: "videoSummarization", name: "Video Summarization (Beta)", enabled: false },
  { id: "developerApi", name: "Developer API Access", enabled: true },
];


export default function AdminPage() {
  // const { user, isAdmin } = useAuth(); // Placeholder for auth and admin check
  const user = { uid: "admin-user-uid", email: "admin@erimtech.ai" }; // Placeholder admin user
  const isAdmin = true; // Placeholder admin status

  const [users, setUsers] = useState(mockUsers);
  const [media, setMedia] = useState(mockMedia);
  const [apiLogs, setApiLogs] = useState(mockApiLogs);
  const [featureToggles, setFeatureToggles] = useState(mockFeatureToggles);
  const [searchTerm, setSearchTerm] = useState("");

  // useEffect(() => {
  //   if (isAdmin) {
  //     // Fetch users, media, logs, feature toggles from Firestore
  //     const fetchData = async () => {
  //       const usersSnapshot = await getDocs(collection(db, "users"));
  //       setUsers(usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  //       // ... fetch other collections
  //     };
  //     fetchData();
  //   }
  // }, [isAdmin]);

  if (!user || !isAdmin) {
    return (
      <div className="container mx-auto py-12 px-4 md:px-6 text-center">
        <ShieldAlert className="mx-auto h-12 w-12 text-destructive mb-4" />
        <h1 className="text-3xl font-orbitron font-bold mb-4">Admin Access Only</h1>
        <p className="text-muted-foreground">You do not have permission to view this page.</p>
      </div>
    );
  }

  const handleUserStatusChange = async (userId: string, newStatus: string) => {
    // Placeholder: update user status in Firestore
    setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus } : u));
    // await updateDoc(doc(db, "users", userId), { status: newStatus });
  };

  const handleMediaStatusChange = async (mediaId: string, newStatus: string) => {
     // Placeholder: update media status in Firestore
    setMedia(media.map(m => m.id === mediaId ? { ...m, status: newStatus } : m));
    // await updateDoc(doc(db, "mediaUploads", mediaId), { status: newStatus });
  };
  
  const handleFeatureToggle = async (featureId: string, enabled: boolean) => {
    // Placeholder: update feature toggle in Firestore
    setFeatureToggles(featureToggles.map(f => f.id === featureId ? { ...f, enabled } : f));
    // await updateDoc(doc(db, "featureToggles", featureId), { enabled });
  };

  const filteredUsers = users.filter(u => u.email.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredApiLogs = apiLogs.filter(log => log.userId.toLowerCase().includes(searchTerm.toLowerCase()) || log.endpoint.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="container mx-auto py-12 px-4 md:px-6 space-y-8">
      <header className="text-center">
        <Settings className="mx-auto h-16 w-16 text-primary mb-4 animate-spin-slow" />
        <h1 className="text-4xl font-orbitron font-bold tracking-tight sm:text-5xl holographic-text">Admin Panel</h1>
        <p className="mt-4 text-lg text-muted-foreground">Manage ERIMTECH AI platform resources and settings.</p>
      </header>

      <Input 
        type="search"
        placeholder="Search users or logs..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="max-w-md mx-auto glassmorphic"
        icon={<Search className="h-4 w-4 text-muted-foreground" />}
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
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Prompts Today</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map(user => (
                    <TableRow key={user.id}>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.role}</TableCell>
                      <TableCell>
                        <Select value={user.status} onValueChange={(value) => handleUserStatusChange(user.id, value)}>
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
                      <TableCell>{new Date(user.lastLogin).toLocaleDateString()}</TableCell>
                      <TableCell>{user.promptsToday}</TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8"><Edit3 className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="h-4 w-4" /></Button>
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
                      <TableCell>{item.uploader}</TableCell>
                      <TableCell>{new Date(item.uploadedAt).toLocaleString()}</TableCell>
                      <TableCell>
                         <Select value={item.status} onValueChange={(value) => handleMediaStatusChange(item.id, value)}>
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
                        <Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="h-4 w-4" /></Button> {/* Preview */}
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="h-4 w-4" /></Button>
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
              <CardDescription>View logs of API requests made to the platform.</CardDescription>
            </CardHeader>
            <CardContent>
               <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User ID</TableHead>
                    <TableHead>Endpoint</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>IP Address</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApiLogs.map(log => (
                    <TableRow key={log.id}>
                      <TableCell>{log.userId}</TableCell>
                      <TableCell>{log.endpoint}</TableCell>
                      <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                      <TableCell className={log.status === 200 ? 'text-green-500' : 'text-red-500'}>{log.status}</TableCell>
                      <TableCell>{log.ipAddress}</TableCell>
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
              {featureToggles.map(feature => (
                <div key={feature.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                  <Label htmlFor={feature.id} className="text-base">{feature.name}</Label>
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

      {/* Placeholder for a simple stats overview */}
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
            <p className="text-muted-foreground">API Requests (Today - Mock)</p>
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

// Helper for Input with icon
const InputWithIcon = React.forwardRef<
  HTMLInputElement,
  React.ComponentPropsWithoutRef<typeof Input> & { icon?: React.ReactNode }
>(({ icon, className, ...props }, ref) => {
  return (
    <div className="relative">
      {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">{icon}</div>}
      <Input ref={ref} className={cn(icon ? "pl-10" : "", className)} {...props} />
    </div>
  );
});
InputWithIcon.displayName = "InputWithIcon";
