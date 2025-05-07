
"use client";
import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KeyRound, Copy, Download, Eye, EyeOff, AlertTriangle, CodeXml, CloudCog, Loader2, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/providers/auth-provider"; 
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, increment } from "firebase/firestore";

const generateApiKey = () => `erim_live_${[...Array(32)].map(() => Math.random().toString(36)[2]).join('')}`;

interface ApiKeyData {
  key: string;
  createdAt: any; // Firestore Timestamp
  status: 'active' | 'revoked';
  lastUsed?: any;
}

interface ApiUsageData {
  requestsToday: number;
  limitPerDay: number;
  lastReset: any; // Firestore Timestamp
}

export default function DeveloperPage() {
  const [apiKeyData, setApiKeyData] = useState<ApiKeyData | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [usage, setUsage] = useState<ApiUsageData>({ requestsToday: 0, limitPerDay: 1000, lastReset: null });
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();

  const fetchApiKeyAndUsage = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      // Fetch API Key
      const apiKeyRef = doc(db, "apiKeys", user.uid);
      const apiKeySnap = await getDoc(apiKeyRef);
      if (apiKeySnap.exists()) {
        setApiKeyData(apiKeySnap.data() as ApiKeyData);
      } else {
        setApiKeyData(null); // No key yet
      }

      // Fetch/Initialize API Usage
      const usageRef = doc(db, "apiUsage", user.uid);
      const usageSnap = await getDoc(usageRef);
      if (usageSnap.exists()) {
        const currentUsage = usageSnap.data() as ApiUsageData;
        // Check if usage needs reset
        const today = new Date();
        const lastResetDate = currentUsage.lastReset?.toDate ? currentUsage.lastReset.toDate() : new Date(0);
        
        if (lastResetDate.toDateString() !== today.toDateString()) {
          // Reset usage for the new day
          const newUsage = { ...currentUsage, requestsToday: 0, lastReset: serverTimestamp() };
          await setDoc(usageRef, newUsage);
          setUsage(newUsage);
        } else {
          setUsage(currentUsage);
        }
      } else {
        // Initialize usage for new user
        const initialUsage: ApiUsageData = { requestsToday: 0, limitPerDay: 1000, lastReset: serverTimestamp() };
        await setDoc(usageRef, initialUsage);
        setUsage(initialUsage);
      }
    } catch (error: any) {
      console.error("Error fetching API key/usage:", error);
      toast({ title: "Error", description: "Could not load API data: " + error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    if (user && !authLoading) {
      fetchApiKeyAndUsage();
    } else if (!authLoading && !user) {
      setApiKeyData(null);
      setUsage({ requestsToday: 0, limitPerDay: 1000, lastReset: null });
    }
  }, [user, authLoading, fetchApiKeyAndUsage]);

  const handleGenerateKey = async (isRegenerate = false) => {
    if (!user) {
      toast({ title: "Authentication Required", description: "Please log in to generate an API key.", variant: "destructive" });
      return;
    }
    if (isRegenerate && !window.confirm("Are you sure you want to regenerate your API key? Your current key will be revoked and will stop working.")) {
        return;
    }

    setIsGenerating(true);
    const newKey = generateApiKey();
    const newApiKeyData: ApiKeyData = {
      key: newKey,
      createdAt: serverTimestamp(),
      status: 'active',
    };

    try {
      const apiKeyRef = doc(db, "apiKeys", user.uid);
      await setDoc(apiKeyRef, newApiKeyData); // Overwrites or creates
      setApiKeyData(newApiKeyData);
      setShowApiKey(true); // Show new key immediately
      toast({ title: `API Key ${isRegenerate ? 'Regenerated' : 'Generated'}`, description: "Your new API key is ready." });
    } catch (error: any) {
      console.error("Error generating API key:", error);
      toast({ title: "Error", description: "Failed to generate API key: " + error.message, variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string | undefined) => {
    if(!text) return;
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: "API Key copied to clipboard." });
  };

  // Mock API request for usage increment - In a real app, this would be done server-side or via a Cloud Function
  const simulateApiRequest = async () => {
    if (!user) return;
    const usageRef = doc(db, "apiUsage", user.uid);
    try {
      await updateDoc(usageRef, {
        requestsToday: increment(1),
        lastUsed: serverTimestamp() // Also update lastUsed on the apiKeyDoc if desired
      });
      // Re-fetch usage to update UI, or update local state optimistically
      fetchApiKeyAndUsage(); 
      toast({ title: "API Request Simulated", description: "Usage count incremented." });
    } catch (error) {
       toast({ title: "Error Simulating", description: "Could not update usage.", variant: "destructive" });
    }
  };


  const javascriptSample = `
async function callErimtechAI(promptText) {
  const apiKey = "${apiKeyData?.status === 'active' ? apiKeyData.key : 'YOUR_API_KEY'}";
  const response = await fetch('https://api.erimtech.ai/v1/chat', { // Fictional API endpoint
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': \`Bearer \${apiKey}\`
    },
    body: JSON.stringify({ prompt: promptText })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(\`API request failed with status \${response.status}: \${errorData.message || response.statusText}\`);
  }
  return response.json();
}

// Example usage:
callErimtechAI("Explain quantum computing in simple terms.")
  .then(data => console.log(data.response))
  .catch(error => console.error(error));
`;

  const pythonSample = `
import requests
import json

API_KEY = "${apiKeyData?.status === 'active' ? apiKeyData.key : 'YOUR_API_KEY'}"
API_URL = "https://api.erimtech.ai/v1/chat" # Fictional API endpoint

def call_erimtech_ai(prompt_text):
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {API_KEY}"
    }
    data = {"prompt": prompt_text}
    
    response = requests.post(API_URL, headers=headers, json=data)
    
    if response.status_code != 200:
        try:
            error_data = response.json()
            error_message = error_data.get("message", response.text)
        except json.JSONDecodeError:
            error_message = response.text
        raise Exception(f"API request failed with status {response.status_code}: {error_message}")
        
    return response.json()

# Example usage:
try:
    result = call_erimtech_ai("Explain quantum computing in simple terms.")
    print(result.get("response"))
except Exception as e:
    print(f"Error: {e}")
`;


  if (authLoading) {
    return (
      <div className="container mx-auto py-12 px-4 md:px-6 text-center">
        <CloudCog className="mx-auto h-12 w-12 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground">Loading developer portal...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto py-12 px-4 md:px-6 text-center">
        <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
        <h1 className="text-3xl font-orbitron font-bold mb-4">Access Denied</h1>
        <p className="text-muted-foreground mb-6">You need to be logged in to access the Developer API section.</p>
        <Link href="/login">
          <Button>Login to Continue</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4 md:px-6 space-y-8">
      <header className="text-center">
        <CodeXml className="mx-auto h-16 w-16 text-primary mb-4" />
        <h1 className="text-4xl font-orbitron font-bold tracking-tight sm:text-5xl holographic-text">Developer API</h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Integrate ERIMTECH AI's powerful capabilities into your applications. Our API is free to use, empowering your projects with cutting-edge AI.
        </p>
      </header>

      <Card className="glassmorphic shadow-xl">
        <CardHeader>
          <CardTitle className="font-orbitron flex items-center"><KeyRound className="mr-2 h-5 w-5"/>Your API Key</CardTitle>
          <CardDescription>
            Use this key to authenticate your API requests. Keep it secret, keep it safe!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
          {!isLoading && apiKeyData && apiKeyData.status === 'active' && (
            <div className="flex items-center space-x-2 p-3 bg-muted/50 rounded-md border border-border/70">
              <Input 
                type={showApiKey ? "text" : "password"} 
                value={apiKeyData.key} 
                readOnly 
                className="flex-grow !border-0 !ring-0 !shadow-none !bg-transparent !px-0 text-sm"
              />
              <Button variant="ghost" size="icon" onClick={() => setShowApiKey(!showApiKey)} className="h-8 w-8">
                {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={() => copyToClipboard(apiKeyData.key)} className="h-8 w-8">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          )}
          {!isLoading && (!apiKeyData || apiKeyData.status === 'revoked') && (
            <p className="text-muted-foreground">
              {apiKeyData?.status === 'revoked' ? 'Your API key has been revoked. Generate a new one.' : "You haven't generated an API key yet."}
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => handleGenerateKey(!apiKeyData)} disabled={isGenerating || isLoading} className="w-full sm:w-auto">
              {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : (apiKeyData ? <RotateCcw className="mr-2 h-4 w-4"/> : <KeyRound className="mr-2 h-4 w-4"/>)}
              {isGenerating ? "Processing..." : (apiKeyData ? "Regenerate API Key" : "Generate API Key")}
            </Button>
          </div>
          {apiKeyData && <p className="text-xs text-muted-foreground">Key created on: {apiKeyData.createdAt?.toDate ? apiKeyData.createdAt.toDate().toLocaleDateString() : 'N/A'}. Regenerating will invalidate your current key.</p>}
        </CardContent>
      </Card>

      <Card className="glassmorphic shadow-xl">
        <CardHeader>
          <CardTitle className="font-orbitron">API Usage</CardTitle>
          <CardDescription>Monitor your API request consumption. Our API is free, subject to fair use.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && <Loader2 className="h-5 w-5 animate-spin text-primary my-4" />}
          {!isLoading && (
            <div className="space-y-2">
                <p>Requests Today: <span className="font-semibold">{usage.requestsToday} / {usage.limitPerDay}</span></p>
                <div className="w-full bg-muted rounded-full h-2.5">
                <div 
                    className="bg-primary h-2.5 rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min((usage.requestsToday / usage.limitPerDay) * 100, 100)}%` }}
                ></div>
                </div>
                <p className="text-xs text-muted-foreground">Usage resets daily at 00:00 UTC. Last reset: {usage.lastReset?.toDate ? usage.lastReset.toDate().toLocaleDateString() : 'N/A'}</p>
                <Button onClick={simulateApiRequest} variant="outline" size="sm" className="mt-2">Simulate API Request</Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="documentation" className="w-full">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 gap-2 glassmorphic p-1 mb-6">
          <TabsTrigger value="documentation" className="font-orbitron">Documentation</TabsTrigger>
          <TabsTrigger value="code-samples" className="font-orbitron">Code Samples</TabsTrigger>
          <TabsTrigger value="rate-limits" className="font-orbitron">Usage Policy</TabsTrigger>
        </TabsList>
        <TabsContent value="documentation" className="mt-0 p-6 rounded-lg glassmorphic shadow-lg">
          <h3 className="text-2xl font-orbitron font-semibold mb-4">API Documentation</h3>
          <p className="mb-2">Welcome to the ERIMTECH AI API. Our API is designed to be RESTful and uses JSON for requests and responses.</p>
          <h4 className="text-xl font-orbitron font-semibold mt-4 mb-2">Authentication</h4>
          <p className="mb-2">All API requests must be authenticated using a Bearer token in the Authorization header. Use the API key generated above.</p>
          <pre className="bg-muted/50 p-3 rounded-md text-sm overflow-x-auto"><code>Authorization: Bearer YOUR_API_KEY</code></pre>
          
          <h4 className="text-xl font-orbitron font-semibold mt-4 mb-2">Base URL</h4>
          <pre className="bg-muted/50 p-3 rounded-md text-sm overflow-x-auto"><code>https://api.erimtech.ai/v1</code></pre>
          
          <h4 className="text-xl font-orbitron font-semibold mt-4 mb-2">Available Endpoints</h4>
          <ul className="list-disc list-inside space-y-2 my-2">
            <li>
              <strong className="font-medium">POST /chat</strong>
              <p className="text-sm text-muted-foreground ml-4">Send a text prompt for AI chat response. Optionally include a URL for context.</p>
              <pre className="bg-muted/50 p-2 rounded-md text-xs overflow-x-auto mt-1 ml-4"><code>
{`Request Body (JSON):
{
  "prompt": "Your text prompt",
  "url": "optional_url_for_context" 
}

Response (JSON):
{
  "response": "AI generated text"
}`}
              </code></pre>
            </li>
            <li>
              <strong className="font-medium">POST /code/generate</strong>
              <p className="text-sm text-muted-foreground ml-4">Generate code based on a description and language.</p>
               <pre className="bg-muted/50 p-2 rounded-md text-xs overflow-x-auto mt-1 ml-4"><code>
{`Request Body (JSON):
{
  "description": "Description of code to generate",
  "language": "python" // e.g., python, javascript
}

Response (JSON):
{
  "code": "Generated code snippet",
  "language": "python"
}`}
              </code></pre>
            </li>
             <li>
              <strong className="font-medium">POST /code/explain</strong>
              <p className="text-sm text-muted-foreground ml-4">Explain a provided code snippet.</p>
               <pre className="bg-muted/50 p-2 rounded-md text-xs overflow-x-auto mt-1 ml-4"><code>
{`Request Body (JSON):
{
  "code": "Your code snippet",
  "language": "javascript" // e.g., python, javascript
}

Response (JSON):
{
  "explanation": "Detailed explanation of the code"
}`}
              </code></pre>
            </li>
            <li>
              <strong className="font-medium">POST /image/analyze</strong>
              <p className="text-sm text-muted-foreground ml-4">Analyze an image. Send as form-data with an 'image' field or JSON with 'imageUrl'.</p>
               <pre className="bg-muted/50 p-2 rounded-md text-xs overflow-x-auto mt-1 ml-4"><code>
{`Request Body (form-data):
image: (file)

OR Request Body (JSON):
{
  "imageUrl": "https://example.com/image.jpg"
}

Response (JSON):
{
  "analysisResult": {
    "description": "Detailed description of the image content",
    "objects": ["object1", "object2"], // Example
    "tags": ["tag1", "tag2"] // Example
  }
}`}
              </code></pre>
            </li>
             <li>
              <strong className="font-medium">POST /audio/transcribe</strong>
              <p className="text-sm text-muted-foreground ml-4">Transcribe an audio file. Send as form-data with an 'audio' field.</p>
               <pre className="bg-muted/50 p-2 rounded-md text-xs overflow-x-auto mt-1 ml-4"><code>
{`Request Body (form-data):
audio: (file)

Response (JSON):
{
  "transcription": "The transcribed text from the audio."
}`}
              </code></pre>
            </li>
            <li>
              <strong className="font-medium">POST /video/summarize</strong>
              <p className="text-sm text-muted-foreground ml-4">Summarize a video from a given URL.</p>
               <pre className="bg-muted/50 p-2 rounded-md text-xs overflow-x-auto mt-1 ml-4"><code>
{`Request Body (JSON):
{
  "videoUrl": "https://example.com/video.mp4"
}

Response (JSON):
{
  "summary": "A concise summary of the video content."
}`}
              </code></pre>
            </li>
          </ul>
          <p className="mt-4">Full endpoint specifications including all parameters, response schemas, and error codes will be detailed here. (Placeholder for comprehensive docs)</p>
          <Button variant="outline" className="mt-6 group" onClick={() => alert("Full API documentation download (mock: OpenAPI spec would be linked here)")}>
            <Download className="mr-2 h-4 w-4 group-hover:animate-bounce" /> Download Full API Spec (OpenAPI)
          </Button>
        </TabsContent>
        <TabsContent value="code-samples" className="mt-0 p-6 rounded-lg glassmorphic shadow-lg">
          <h3 className="text-2xl font-orbitron font-semibold mb-4">Code Samples</h3>
          <Tabs defaultValue="javascript" className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-1 mb-4 glassmorphic p-0.5">
              <TabsTrigger value="javascript">JavaScript</TabsTrigger>
              <TabsTrigger value="python">Python</TabsTrigger>
              <TabsTrigger value="curl">cURL</TabsTrigger>
              <TabsTrigger value="other">Other (Coming)</TabsTrigger>
            </TabsList>
            <TabsContent value="javascript">
              <h4 className="text-lg font-semibold mb-2">JavaScript (Node.js / Browser)</h4>
              <pre className="bg-muted/50 p-3 rounded-md text-sm overflow-x-auto max-h-96"><code>{javascriptSample}</code></pre>
            </TabsContent>
            <TabsContent value="python">
              <h4 className="text-lg font-semibold mb-2">Python</h4>
              <pre className="bg-muted/50 p-3 rounded-md text-sm overflow-x-auto max-h-96"><code>{pythonSample}</code></pre>
            </TabsContent>
             <TabsContent value="curl">
              <h4 className="text-lg font-semibold mb-2">cURL (Chat Example)</h4>
              <pre className="bg-muted/50 p-3 rounded-md text-sm overflow-x-auto max-h-96"><code>
{`curl -X POST \\
  https://api.erimtech.ai/v1/chat \\
  -H "Authorization: Bearer ${apiKeyData?.status === 'active' ? apiKeyData.key : 'YOUR_API_KEY'}" \\
  -H "Content-Type: application/json" \\
  -d '{
        "prompt": "Hello, AI!"
      }'`}
              </code></pre>
            </TabsContent>
            <TabsContent value="other">
              <p className="text-muted-foreground">More code samples (e.g., Java, Go, Swift) coming soon!</p>
            </TabsContent>
          </Tabs>
        </TabsContent>
        <TabsContent value="rate-limits" className="mt-0 p-6 rounded-lg glassmorphic shadow-lg">
          <h3 className="text-2xl font-orbitron font-semibold mb-4">Fair Usage Policy</h3>
          <p className="mb-2">ERIMTECH AI is currently free to use. To ensure service availability and quality for all users, we operate under a fair usage policy.</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm my-4">
              <thead>
                <tr className="border-b">
                  <th className="p-2 text-left font-semibold">Tier</th>
                  <th className="p-2 text-left font-semibold">Requests per Day</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-2">Free Access</td>
                  <td className="p-2">{usage.limitPerDay} RPD</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm text-muted-foreground">
            These limits are subject to change. Excessive usage that degrades service for others may result in temporary rate limiting. 
            If you have high-volume requirements, please <Link href="/contact?subject=APIUsage" className="underline hover:text-primary">contact us</Link>.
            Exceeding fair use limits may result in a <code className="bg-muted/50 px-1 rounded-sm">429 Too Many Requests</code> error.
          </p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
