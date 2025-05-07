"use client";
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KeyRound, Copy, Download, Eye, EyeOff, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
// import { useAuth } from "@/hooks/use-auth"; // Placeholder for auth
// import { db } from "@/lib/firebase"; // Placeholder for Firebase
// import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore"; // Placeholder

// Placeholder for actual API key generation logic
const generateApiKey = () => `erimtech_${[...Array(32)].map(() => Math.random().toString(36)[2]).join('')}`;

export default function DeveloperPage() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [usage, setUsage] = useState({ requestsToday: 0, limit: 1000 }); // Placeholder
  const { toast } = useToast();
  // const { user } = useAuth(); // Placeholder
  const user = { uid: "test-user-uid", email: "developer@example.com" }; // Placeholder user

  // useEffect(() => {
  //   if (user) {
  //     const fetchApiKey = async () => {
  //       setIsLoading(true);
  //       const userApiDocRef = doc(db, "apiKeys", user.uid);
  //       const docSnap = await getDoc(userApiDocRef);
  //       if (docSnap.exists()) {
  //         setApiKey(docSnap.data().key);
  //         // Fetch usage data here
  //       }
  //       setIsLoading(false);
  //     };
  //     fetchApiKey();
  //   }
  // }, [user]);

  const handleGenerateKey = async () => {
    // if (!user) {
    //   toast({ title: "Authentication Required", description: "Please log in to generate an API key.", variant: "destructive" });
    //   return;
    // }
    // setIsLoading(true);
    // const newKey = generateApiKey();
    // const userApiDocRef = doc(db, "apiKeys", user.uid);
    // try {
    //   await setDoc(userApiDocRef, { 
    //     key: newKey, 
    //     userId: user.uid, 
    //     email: user.email, 
    //     createdAt: serverTimestamp(), 
    //     status: "active",
    //     requestsToday: 0, // Initialize usage
    //     limitPerDay: 1000 // Example limit
    //   });
    //   setApiKey(newKey);
    //   toast({ title: "API Key Generated", description: "Your new API key has been generated successfully." });
    // } catch (error) {
    //   console.error("Error generating API key:", error);
    //   toast({ title: "Error", description: "Failed to generate API key.", variant: "destructive" });
    // }
    // setIsLoading(false);
    
    // Placeholder logic:
    setIsLoading(true);
    setTimeout(() => {
      const newKey = generateApiKey();
      setApiKey(newKey);
      toast({ title: "API Key Generated", description: "Your new API key has been generated successfully." });
      setIsLoading(false);
    }, 1000);
  };

  const copyToClipboard = (text: string) => {
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
    <div className="container mx-auto py-12 px-4 md:px-6 space-y-12">
      <header className="text-center">
        <KeyRound className="mx-auto h-16 w-16 text-primary mb-4" />
        <h1 className="text-4xl font-orbitron font-bold tracking-tight sm:text-5xl holographic-text">Developer API</h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Integrate ERIMTECH AI's powerful capabilities into your applications. Access our API to build next-generation AI-powered tools.
        </p>
      </header>

      <Card className="glassmorphic">
        <CardHeader>
          <CardTitle className="font-orbitron">Your API Key</CardTitle>
          <CardDescription>
            Use this key to authenticate your API requests. Keep it secret, keep it safe!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {apiKey ? (
            <div className="flex items-center space-x-2 p-3 bg-muted rounded-md border border-border/70">
              <Input 
                type={showApiKey ? "text" : "password"} 
                value={apiKey} 
                readOnly 
                className="flex-grow !border-0 !ring-0 !shadow-none !bg-transparent !px-0"
              />
              <Button variant="ghost" size="icon" onClick={() => setShowApiKey(!showApiKey)}>
                {showApiKey ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                <span className="sr-only">{showApiKey ? "Hide" : "Show"} API Key</span>
              </Button>
              <Button variant="ghost" size="icon" onClick={() => copyToClipboard(apiKey)}>
                <Copy className="h-5 w-5" />
                <span className="sr-only">Copy API Key</span>
              </Button>
            </div>
          ) : (
            <p className="text-muted-foreground">You haven't generated an API key yet.</p>
          )}
          <Button onClick={handleGenerateKey} disabled={isLoading || !!apiKey} className="w-full sm:w-auto">
            {isLoading ? "Generating..." : (apiKey ? "Regenerate Key (Coming Soon)" : "Generate API Key")}
          </Button>
          {apiKey && <p className="text-xs text-destructive">Regenerating will invalidate your current key. This feature is illustrative.</p>}
        </CardContent>
      </Card>

      <Card className="glassmorphic">
        <CardHeader>
          <CardTitle className="font-orbitron">API Usage</CardTitle>
          <CardDescription>Monitor your API request consumption.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p>Requests Today: <span className="font-semibold">{usage.requestsToday} / {usage.limit}</span></p>
            <div className="w-full bg-muted rounded-full h-2.5">
              <div 
                className="bg-primary h-2.5 rounded-full transition-all duration-500" 
                style={{ width: `${(usage.requestsToday / usage.limit) * 100}%` }}
              ></div>
            </div>
            <p className="text-xs text-muted-foreground">Usage resets daily at 00:00 UTC. (Placeholder values)</p>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="documentation" className="w-full">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 gap-2 glassmorphic p-1">
          <TabsTrigger value="documentation" className="font-orbitron">Documentation</TabsTrigger>
          <TabsTrigger value="code-samples" className="font-orbitron">Code Samples</TabsTrigger>
          <TabsTrigger value="rate-limits" className="font-orbitron">Rate Limits</TabsTrigger>
        </TabsList>
        <TabsContent value="documentation" className="mt-6 p-6 rounded-lg glassmorphic">
          <h3 className="text-2xl font-orbitron font-semibold mb-4">API Documentation</h3>
          <p className="mb-2">Welcome to the ERIMTECH AI API. Our API is designed to be RESTful and uses JSON for requests and responses.</p>
          <h4 className="text-xl font-orbitron font-semibold mt-4 mb-2">Authentication</h4>
          <p className="mb-2">All API requests must be authenticated using a Bearer token in the Authorization header. Use the API key generated above.</p>
          <pre className="bg-muted p-3 rounded-md text-sm overflow-x-auto"><code>Authorization: Bearer YOUR_API_KEY</code></pre>
          <h4 className="text-xl font-orbitron font-semibold mt-4 mb-2">Endpoints</h4>
          <ul className="list-disc list-inside space-y-1">
            <li><code className="bg-muted px-1 rounded-sm">POST /v1/chat</code>: Send a text prompt for AI chat response.</li>
            <li><code className="bg-muted px-1 rounded-sm">POST /v1/code/generate</code>: Generate code based on a description.</li>
            <li><code className="bg-muted px-1 rounded-sm">POST /v1/code/explain</code>: Explain a code snippet.</li>
            <li><code className="bg-muted px-1 rounded-sm">POST /v1/image/analyze</code>: Analyze an uploaded image.</li>
            {/* Add more endpoints as needed */}
          </ul>
          <p className="mt-4">Full endpoint specifications, request/response schemas, and error codes will be detailed here. (Placeholder for comprehensive docs)</p>
          <Button variant="outline" className="mt-6 group" onClick={() => alert("Full API documentation download (mock)")}>
            <Download className="mr-2 h-4 w-4 group-hover:animate-bounce" /> Download Full API Spec (OpenAPI)
          </Button>
        </TabsContent>
        <TabsContent value="code-samples" className="mt-6 p-6 rounded-lg glassmorphic">
          <h3 className="text-2xl font-orbitron font-semibold mb-4">Code Samples</h3>
          <Tabs defaultValue="javascript" className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-1 mb-4 glassmorphic p-0.5">
              <TabsTrigger value="javascript">JavaScript</TabsTrigger>
              <TabsTrigger value="python">Python</TabsTrigger>
              <TabsTrigger value="curl">cURL</TabsTrigger>
              <TabsTrigger value="whatsapp">WhatsApp (Soon)</TabsTrigger>
            </TabsList>
            <TabsContent value="javascript">
              <h4 className="text-lg font-semibold mb-2">JavaScript (Node.js / Browser)</h4>
              <pre className="bg-muted p-3 rounded-md text-sm overflow-x-auto max-h-96"><code>{javascriptSample}</code></pre>
            </TabsContent>
            <TabsContent value="python">
              <h4 className="text-lg font-semibold mb-2">Python</h4>
              <pre className="bg-muted p-3 rounded-md text-sm overflow-x-auto max-h-96"><code>{pythonSample}</code></pre>
            </TabsContent>
             <TabsContent value="curl">
              <h4 className="text-lg font-semibold mb-2">cURL</h4>
              <pre className="bg-muted p-3 rounded-md text-sm overflow-x-auto max-h-96"><code>
{`curl -X POST \\
  https://api.erimtech.ai/v1/chat \\
  -H "Authorization: Bearer ${apiKey || 'YOUR_API_KEY'}" \\
  -H "Content-Type: application/json" \\
  -d '{
        "prompt": "Hello, AI!"
      }'`}
              </code></pre>
            </TabsContent>
            <TabsContent value="whatsapp">
              <p className="text-muted-foreground">WhatsApp bot integration examples coming soon!</p>
            </TabsContent>
          </Tabs>
        </TabsContent>
        <TabsContent value="rate-limits" className="mt-6 p-6 rounded-lg glassmorphic">
          <h3 className="text-2xl font-orbitron font-semibold mb-4">Rate Limits & Quotas</h3>
          <p className="mb-2">To ensure fair usage and stability of our services, API requests are subject to rate limits and quotas based on your subscription plan.</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="p-2 text-left font-semibold">Plan</th>
                  <th className="p-2 text-left font-semibold">Requests per Minute</th>
                  <th className="p-2 text-left font-semibold">Requests per Day</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-2">Explorer (Free Tier)</td>
                  <td className="p-2">10 RPM</td>
                  <td className="p-2">100 RPD</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2">Innovator</td>
                  <td className="p-2">60 RPM</td>
                  <td className="p-2">5,000 RPD</td>
                </tr>
                <tr>
                  <td className="p-2">Visionary</td>
                  <td className="p-2">120 RPM</td>
                  <td className="p-2">20,000 RPD</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Exceeding these limits will result in a <code className="bg-muted px-1 rounded-sm">429 Too Many Requests</code> error.
            Rate limits are subject to change. Please refer to the latest documentation or your dashboard for current limits.
            (Rate limits are illustrative).
          </p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
