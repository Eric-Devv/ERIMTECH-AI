
"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KeyRound, Copy, Download, Eye, EyeOff, AlertTriangle, CodeXml, CloudCog } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/providers/auth-provider"; 
// import { db } from "@/lib/firebase"; // Placeholder for Firebase
// import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore"; // Placeholder

// Placeholder for actual API key generation logic
const generateApiKey = () => `erimtech_free_${[...Array(30)].map(() => Math.random().toString(36)[2]).join('')}`;

export default function DeveloperPage() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [usage, setUsage] = useState({ requestsToday: 0, limit: 1000 }); // Placeholder
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();

  // Mocking API key fetching/generation since Firebase isn't fully set up
  useEffect(() => {
    if (user && !authLoading) {
      setIsLoading(true);
      // Simulate fetching an existing key or generating a new one
      setTimeout(() => {
        const existingMockKey = localStorage.getItem(`apiKey_${user.uid}`);
        if (existingMockKey) {
          setApiKey(existingMockKey);
        } else {
          // Don't auto-generate, let user click button
          // const newKey = generateApiKey();
          // localStorage.setItem(`apiKey_${user.uid}`, newKey);
          // setApiKey(newKey);
        }
        // Simulate fetching usage data
        const mockUsage = parseInt(localStorage.getItem(`apiUsage_${user.uid}`) || '0');
        setUsage({ requestsToday: mockUsage, limit: 1000 }); // Illustrative limit
        setIsLoading(false);
      }, 500);
    } else if (!authLoading && !user) {
      setApiKey(null); // Clear API key if user logs out
    }
  }, [user, authLoading]);

  const handleGenerateKey = async () => {
    if (!user) {
      toast({ title: "Authentication Required", description: "Please log in to generate an API key.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    const newKey = generateApiKey();
    // Simulate saving the key
    localStorage.setItem(`apiKey_${user.uid}`, newKey);
    setApiKey(newKey);
    localStorage.setItem(`apiUsage_${user.uid}`, '0'); // Reset usage on new key
    setUsage({ requestsToday: 0, limit: 1000 });
    toast({ title: "API Key Generated", description: "Your new API key has been generated successfully." });
    setIsLoading(false);
  };

  const copyToClipboard = (text: string) => {
    if(!text) return;
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: "API Key copied to clipboard." });
  };

  const javascriptSample = `
async function callErimtechAI(promptText) {
  const apiKey = "${apiKey || 'YOUR_API_KEY'}";
  const response = await fetch('https://api.erimtech.ai/v1/chat', { // Fictional API endpoint
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': \`Bearer \${apiKey}\`
    },
    body: JSON.stringify({ prompt: promptText })
  });

  if (!response.ok) {
    throw new Error(\`API request failed with status \${response.status}\`);
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

API_KEY = "${apiKey || 'YOUR_API_KEY'}"
API_URL = "https://api.erimtech.ai/v1/chat" # Fictional API endpoint

def call_erimtech_ai(prompt_text):
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {API_KEY}"
    }
    data = {"prompt": prompt_text}
    
    response = requests.post(API_URL, headers=headers, json=data)
    
    if response.status_code != 200:
        raise Exception(f"API request failed with status {response.status_code}: {response.text}")
        
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
          {apiKey ? (
            <div className="flex items-center space-x-2 p-3 bg-muted/50 rounded-md border border-border/70">
              <Input 
                type={showApiKey ? "text" : "password"} 
                value={apiKey} 
                readOnly 
                className="flex-grow !border-0 !ring-0 !shadow-none !bg-transparent !px-0 text-sm"
              />
              <Button variant="ghost" size="icon" onClick={() => setShowApiKey(!showApiKey)} className="h-8 w-8">
                {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                <span className="sr-only">{showApiKey ? "Hide" : "Show"} API Key</span>
              </Button>
              <Button variant="ghost" size="icon" onClick={() => copyToClipboard(apiKey)} className="h-8 w-8">
                <Copy className="h-4 w-4" />
                <span className="sr-only">Copy API Key</span>
              </Button>
            </div>
          ) : (
            <p className="text-muted-foreground">You haven't generated an API key yet.</p>
          )}
          <Button onClick={handleGenerateKey} disabled={isLoading} className="w-full sm:w-auto">
            {isLoading ? "Generating..." : (apiKey ? "Regenerate API Key" : "Generate API Key")}
          </Button>
          {apiKey && <p className="text-xs text-muted-foreground">Regenerating will invalidate your current key.</p>}
        </CardContent>
      </Card>

      <Card className="glassmorphic shadow-xl">
        <CardHeader>
          <CardTitle className="font-orbitron">API Usage</CardTitle>
          <CardDescription>Monitor your API request consumption. Our API is free, subject to fair use.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p>Requests Today: <span className="font-semibold">{usage.requestsToday} / {usage.limit} (Illustrative)</span></p>
            <div className="w-full bg-muted rounded-full h-2.5">
              <div 
                className="bg-primary h-2.5 rounded-full transition-all duration-500" 
                style={{ width: `${Math.min((usage.requestsToday / usage.limit) * 100, 100)}%` }}
              ></div>
            </div>
            <p className="text-xs text-muted-foreground">Usage resets daily at 00:00 UTC.</p>
          </div>
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
          <h4 className="text-xl font-orbitron font-semibold mt-4 mb-2">Endpoints</h4>
          <ul className="list-disc list-inside space-y-1">
            <li><code className="bg-muted/50 px-1 rounded-sm">POST /v1/chat</code>: Send a text prompt for AI chat response.</li>
            <li><code className="bg-muted/50 px-1 rounded-sm">POST /v1/code/generate</code>: Generate code based on a description.</li>
            <li><code className="bg-muted/50 px-1 rounded-sm">POST /v1/code/explain</code>: Explain a code snippet.</li>
            <li><code className="bg-muted/50 px-1 rounded-sm">POST /v1/image/analyze</code>: Analyze an uploaded image.</li>
            {/* Add more endpoints as needed */}
          </ul>
          <p className="mt-4">Full endpoint specifications, request/response schemas, and error codes will be detailed here. (Placeholder for comprehensive docs)</p>
          <Button variant="outline" className="mt-6 group" onClick={() => alert("Full API documentation download (mock)")}>
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
              <h4 className="text-lg font-semibold mb-2">cURL</h4>
              <pre className="bg-muted/50 p-3 rounded-md text-sm overflow-x-auto max-h-96"><code>
{`curl -X POST \\
  https://api.erimtech.ai/v1/chat \\ # Fictional Endpoint
  -H "Authorization: Bearer ${apiKey || 'YOUR_API_KEY'}" \\
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
                  <th className="p-2 text-left font-semibold">Requests per Minute (Illustrative)</th>
                  <th className="p-2 text-left font-semibold">Requests per Day (Illustrative)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-2">Free Access</td>
                  <td className="p-2">~60 RPM</td>
                  <td className="p-2">~1,000 RPD</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm text-muted-foreground">
            These limits are illustrative and may be adjusted. Excessive usage that degrades service for others may result in temporary rate limiting. 
            If you have high-volume requirements, please <Link href="/contact?subject=APIUsage" className="underline hover:text-primary">contact us</Link>.
            Exceeding fair use limits may result in a <code className="bg-muted/50 px-1 rounded-sm">429 Too Many Requests</code> error.
          </p>
        </TabsContent>
      </Tabs>
    </div>
  );
}

