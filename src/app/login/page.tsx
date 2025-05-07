"use client";
import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, LogIn, Mail, KeyRound, UserPlus, Loader2 } from 'lucide-react';
// import { signInWithGoogle, signInWithEmail, signUpWithEmail, signInAnonymously } from '@/lib/firebase/auth'; // Placeholder for actual Firebase auth functions
import { useToast } from "@/hooks/use-toast";
import Image from 'next/image';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const handleAuthAction = async (action: 'login' | 'signup' | 'google' | 'anonymous') => {
    setIsLoading(true);
    setError(null);
    try {
      let userCredential;
      switch (action) {
        case 'login':
          if (!email || !password) {
            setError("Email and password are required.");
            setIsLoading(false);
            return;
          }
          // userCredential = await signInWithEmail(email, password);
          toast({ title: "Login Successful (Mock)", description: "Welcome back!" });
          router.push('/chat'); // Redirect to chat or dashboard
          break;
        case 'signup':
          if (!email || !password || !confirmPassword) {
            setError("All fields are required for signup.");
            setIsLoading(false);
            return;
          }
          if (password !== confirmPassword) {
            setError("Passwords do not match.");
            setIsLoading(false);
            return;
          }
          // userCredential = await signUpWithEmail(email, password);
          toast({ title: "Signup Successful (Mock)", description: "Your account has been created." });
          router.push('/chat');
          break;
        case 'google':
          // userCredential = await signInWithGoogle();
          toast({ title: "Google Sign-In Successful (Mock)" });
          router.push('/chat');
          break;
        case 'anonymous':
          // userCredential = await signInAnonymously();
          toast({ title: "Anonymous Sign-In Successful (Mock)", description: "You are browsing as a guest." });
          router.push('/chat');
          break;
      }
      // console.log("Auth success:", userCredential); // Placeholder
    } catch (err: any) {
      console.error("Auth error:", err);
      setError(err.message || "An unknown error occurred.");
      toast({ title: "Authentication Error", description: err.message || "Failed to authenticate.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-10rem)] md:min-h-[calc(100vh-8rem)] py-12 px-4">
      <Card className="w-full max-w-md glassmorphic shadow-2xl">
        <CardHeader className="text-center">
          <LogIn className="mx-auto h-12 w-12 text-primary mb-4" />
          <CardTitle className="text-3xl font-orbitron holographic-text">Access ERIMTECH AI</CardTitle>
          <CardDescription>
            Sign in or create an account to unlock the future of AI.
          </CardDescription>
        </CardHeader>
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 glassmorphic p-1">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <CardContent className="space-y-4 pt-6">
              {error && (
                <div className="bg-destructive/20 p-3 rounded-md flex items-center text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 mr-2" /> {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="login-email" type="email" placeholder="horizon@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="pl-10" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                 <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="login-password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required className="pl-10" />
                </div>
              </div>
              <Button onClick={() => handleAuthAction('login')} disabled={isLoading} className="w-full group">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />} Login
              </Button>
            </CardContent>
          </TabsContent>
          <TabsContent value="signup">
            <CardContent className="space-y-4 pt-6">
              {error && (
                <div className="bg-destructive/20 p-3 rounded-md flex items-center text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 mr-2" /> {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="signup-email" type="email" placeholder="pioneer@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="pl-10" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                 <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="signup-password" type="password" placeholder="Choose a strong password" value={password} onChange={(e) => setPassword(e.target.value)} required className="pl-10" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                 <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="confirm-password" type="password" placeholder="Re-enter your password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="pl-10" />
                </div>
              </div>
              <Button onClick={() => handleAuthAction('signup')} disabled={isLoading} className="w-full group">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />} Create Account
              </Button>
            </CardContent>
          </TabsContent>
        </Tabs>
        <CardFooter className="flex flex-col space-y-4 pt-6">
            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 w-full">
              <Button variant="outline" onClick={() => handleAuthAction('google')} disabled={isLoading} className="w-full group">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 
                <Image src="/google-logo.svg" alt="Google" width={16} height={16} className="mr-2 group-hover:scale-110 transition-transform" />} 
                Google
              </Button>
              <Button variant="outline" onClick={() => handleAuthAction('anonymous')} disabled={isLoading} className="w-full group">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <User className="mr-2 h-4 w-4 group-hover:rotate-[360deg] transition-transform duration-500" />} 
                Anonymous
              </Button>
            </div>
            <p className="px-8 text-center text-sm text-muted-foreground">
              By clicking continue, you agree to our{" "}
              <Link
                href="/terms"
                className="underline underline-offset-4 hover:text-primary"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="underline underline-offset-4 hover:text-primary"
              >
                Privacy Policy
              </Link>
              .
            </p>
        </CardFooter>
      </Card>
    </div>
  );
}
