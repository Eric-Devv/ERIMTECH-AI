
"use client";

import { useState, useEffect, useRef, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Paperclip, Send, Mic, Bot, User, Image as ImageIcon, Film, Code, LinkIcon, AlertTriangle, Sparkles, Loader2, Copy } from 'lucide-react';
import { generateAiChatResponse } from '@/ai/flows/generate-ai-chat-response';
import { generateCodeExplanation } from '@/ai/flows/generate-code-explanation';
import { summarizeVideo } from '@/ai/flows/summarize-video';
import { transcribeAudio } from '@/ai/flows/transcribe-audio';
import { analyzeImage } from '@/ai/flows/analyze-image';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import 'highlight.js/styles/github-dark.css';
import * as hljs from 'highlight.js';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  type?: 'text' | 'code' | 'image_analysis' | 'audio_transcription' | 'video_summary' | 'url_analysis' | 'error';
  data?: any; // For code blocks, image URLs, etc.
  timestamp: Date;
}

type AiFeature = 
  | "chat"
  | "code_generation"
  | "code_explanation"
  | "image_analysis"
  | "audio_transcription"
  | "video_summarization"
  | "url_analysis";

const featureConfig: Record<AiFeature, { icon: JSX.Element, name: string, placeholder: string, requiresFileUpload?: boolean, requiresUrl?: boolean, requiresCodeInput?: boolean }> = {
  chat: { icon: <Sparkles className="h-5 w-5" />, name: "AI Chat", placeholder: "Ask ERIMTECH AI anything..." },
  code_generation: { icon: <Code className="h-5 w-5" />, name: "Generate Code", placeholder: "Describe the code you want to generate...", requiresCodeInput: true },
  code_explanation: { icon: <Code className="h-5 w-5" />, name: "Explain Code", placeholder: "Paste code here to get an explanation...", requiresCodeInput: true },
  image_analysis: { icon: <ImageIcon className="h-5 w-5" />, name: "Analyze Image", placeholder: "Upload an image to analyze...", requiresFileUpload: true },
  audio_transcription: { icon: <Mic className="h-5 w-5" />, name: "Transcribe Audio", placeholder: "Upload an audio file to transcribe...", requiresFileUpload: true },
  video_summarization: { icon: <Film className="h-5 w-5" />, name: "Summarize Video", placeholder: "Enter video URL to summarize...", requiresUrl: true },
  url_analysis: { icon: <LinkIcon className="h-5 w-5" />, name: "Analyze URL", placeholder: "Enter URL to analyze its content...", requiresUrl: true },
};


export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [codeInput, setCodeInput] = useState('');
  const [codeLanguage, setCodeLanguage] = useState('javascript');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<AiFeature>("chat");
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const currentFeature = featureConfig[selectedFeature];

  useEffect(() => {
    // Scroll to bottom when new messages are added
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }

    // Highlight code blocks on mount and when messages change
    const highlight = async () => {
      hljs.highlightAll();
    };
    highlight();
  }, [messages]);

  useEffect(() => {
      // Initialize highlight.js after the component has mounted to avoid hydration issues.
      const initHighlighting = async () => {
          hljs.highlightAll();
      };

      initHighlighting();
  }, []);


  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      // Basic validation (can be expanded)
      if (selectedFeature === "image_analysis" && !selectedFile.type.startsWith("image/")) {
        toast({ title: "Invalid File", description: "Please upload an image file.", variant: "destructive" });
        return;
      }
      if (selectedFeature === "audio_transcription" && !selectedFile.type.startsWith("audio/")) {
        toast({ title: "Invalid File", description: "Please upload an audio file.", variant: "destructive" });
        return;
      }
      setFile(selectedFile);
      // Add a user message indicating file upload
      addMessage( `Uploaded ${selectedFile.name}`, 'user');
    }
  };

  const addMessage = (text: string, sender: 'user' | 'ai', type: Message['type'] = 'text', data?: any) => {
    setMessages(prev => [...prev, { id: Date.now().toString(), text, sender, type, data, timestamp: new Date() }]);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input && !file && !urlInput && !codeInput) return;

    setIsLoading(true);
    const userMessage = input || (file ? `Analyzing ${file.name}` : (urlInput || codeInput));
    if (userMessage) addMessage(userMessage, 'user');
    
    setInput(''); // Clear main input after capturing its value
    
    try {
      let aiResponse: any;
      switch (selectedFeature) {
        case 'chat':
          aiResponse = await generateAiChatResponse({ prompt: userMessage, url: urlInput || undefined });
          addMessage(aiResponse.response, 'ai');
          break;
        case 'code_generation':
          // For code generation, the 'codeInput' is the description, 'codeLanguage' is the target lang
          aiResponse = await generateCodeExplanation({ code: `Generate ${codeLanguage} code for: ${codeInput}`, language: codeLanguage });
          addMessage(aiResponse.explanation, 'ai', 'code', { language: codeLanguage, code: aiResponse.explanation });
          break;
        case 'code_explanation':
          aiResponse = await generateCodeExplanation({ code: codeInput, language: codeLanguage });
          addMessage(aiResponse.explanation, 'ai', 'code', { language: codeLanguage, code: aiResponse.explanation });
          break;
        case 'image_analysis':
          if (!file) throw new Error("No image file provided for analysis.");
          const imageDataUri = await readFileAsDataURL(file);
          aiResponse = await analyzeImage({ photoDataUri: imageDataUri });
          addMessage(aiResponse.analysisResult.description, 'ai', 'image_analysis', { imageUrl: imageDataUri, description: aiResponse.analysisResult.description });
          break;
        case 'audio_transcription':
          if (!file) throw new Error("No audio file provided for transcription.");
          const audioDataUri = await readFileAsDataURL(file);
          aiResponse = await transcribeAudio({ audioDataUri });
          addMessage(aiResponse.transcription, 'ai', 'audio_transcription');
          break;
        case 'video_summarization':
          if (!urlInput) throw new Error("No video URL provided for summarization.");
          aiResponse = await summarizeVideo({ videoUrl: urlInput });
          addMessage(aiResponse.summary, 'ai', 'video_summary');
          break;
        case 'url_analysis':
           if (!urlInput) throw new Error("No URL provided for analysis.");
           // Uses the same AI flow as chat, but we can signal it's a URL analysis specifically
           aiResponse = await generateAiChatResponse({ prompt: `Summarize and analyze the content of this URL: ${urlInput}`, url: urlInput });
           addMessage(aiResponse.response, 'ai', 'url_analysis');
          break;
        default:
          throw new Error("Invalid feature selected.");
      }
    } catch (error: any) {
      console.error("AI Error:", error);
      addMessage(error.message || "An error occurred while processing your request.", 'ai', 'error');
      toast({ title: "Error", description: error.message || "Failed to get AI response.", variant: "destructive" });
    } finally {
      setIsLoading(false);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = ""; // Reset file input
      setUrlInput('');
      setCodeInput('');
    }
  };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({ title: "Copied!", description: "Code copied to clipboard." });
    };


  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };


  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] md:h-[calc(100vh-8rem)] glassmorphic rounded-xl shadow-xl overflow-hidden">
      <header className="p-4 border-b border-border/50 flex items-center justify-between bg-background/30">
        <div className="flex items-center gap-2">
           {currentFeature.icon}
          <h2 className="text-xl font-orbitron">{currentFeature.name}</h2>
        </div>
        <Select value={selectedFeature} onValueChange={(value) => setSelectedFeature(value as AiFeature)}>
          <SelectTrigger className="w-[200px] glassmorphic">
            <SelectValue placeholder="Select Feature" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(featureConfig).map(([key, { icon, name }]) => (
              <SelectItem key={key} value={key}>
                <div className="flex items-center gap-2">
                  {icon} {name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </header>

      <ScrollArea className="flex-grow p-4 space-y-4" ref={scrollAreaRef}>
        {messages.map(message => (
          <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
             <div className="max-w-xs md:max-w-2xl"> {/* Container for bubble and buttons */}
                <Card className={`p-3 rounded-2xl shadow ${message.sender === 'user' ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-secondary rounded-bl-none'}`}>
                  <div className="flex items-start space-x-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={message.sender === 'user' ? undefined : '/logo.svg'} /> {/* Replace with actual user avatar if available */}
                      <AvatarFallback>{message.sender === 'user' ? <Bot /> : <Bot />}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      {message.type === 'error' && <AlertTriangle className="h-5 w-5 text-destructive inline mr-1" />}
                      {message.type === 'code' && message.data?.code ? (
                        <div className="relative">
                          <pre className="bg-muted p-2 rounded-md overflow-x-auto text-sm my-1 whitespace-pre-wrap">
                            <code className={`language-${message.data.language}`} dangerouslySetInnerHTML={{ __html: hljs.highlight(message.data.code, {language: message.data.language}).value }} />
                          </pre>
                          <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-8 w-8" onClick={() => copyToClipboard(message.data.code)}>
                            <Copy className="h-4 w-4" />
                            <span className="sr-only">Copy code</span>
                          </Button>
                        </div>
                      ) : message.type === 'image_analysis' && message.data?.imageUrl ? (
                        <>
                          <img src={message.data.imageUrl} alt="Analyzed image" className="rounded-md max-h-64 my-1" />
                          <p className="text-sm mt-1 whitespace-pre-wrap">{message.text}</p>
                        </>
                      ) : (
                        <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                      )}
                      <p className="text-xs text-muted-foreground/70 mt-1 text-right">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
             <Card className="max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-2xl shadow bg-secondary rounded-bl-none">
               <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/logo.svg" />
                  <AvatarFallback><Bot /></AvatarFallback>
                </Avatar>
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">ERIMTECH AI is thinking...</p>
              </div>
            </Card>
          </div>
        )}
      </ScrollArea>

      <form onSubmit={handleSubmit} className="p-4 border-t border-border/50 bg-background/30 space-y-3">
        {currentFeature.requiresCodeInput && (
          <div className="space-y-1.5">
            <Label htmlFor="codeInput">Code Snippet</Label>
            <Textarea
              id="codeInput"
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value)}
              placeholder={currentFeature.placeholder}
              className="min-h-[100px] glassmorphic"
              disabled={isLoading}
            />
            <Select value={codeLanguage} onValueChange={setCodeLanguage} disabled={isLoading}>
              <SelectTrigger className="w-[180px] glassmorphic">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="javascript">JavaScript</SelectItem>
                <SelectItem value="python">Python</SelectItem>
                <SelectItem value="java">Java</SelectItem>
                <SelectItem value="csharp">C#</SelectItem>
                <SelectItem value="cpp">C++</SelectItem>
                <SelectItem value="php">PHP</SelectItem>
                <SelectItem value="ruby">Ruby</SelectItem>
                <SelectItem value="go">Go</SelectItem>
                <SelectItem value="swift">Swift</SelectItem>
                <SelectItem value="typescript">TypeScript</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {(currentFeature.requiresUrl || selectedFeature === 'chat') && ( // 'chat' can optionally take a URL
            <div className="space-y-1.5">
                <Label htmlFor="urlInput">URL (Optional for Chat)</Label>
                 <Input
                    id="urlInput"
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder={currentFeature.requiresUrl ? currentFeature.placeholder : "Enter URL to include in context..."}
                    className="glassmorphic"
                    disabled={isLoading}
                />
            </div>
        )}
        
        <div className="flex items-center space-x-2">
          {currentFeature.requiresFileUpload && (
            <>
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept={selectedFeature === 'image_analysis' ? 'image/*' : (selectedFeature === 'audio_transcription' ? 'audio/*' : '*/*')} />
              <Button type="button" variant="outline" size="icon" onClick={() => fileInputRef.current?.click()} disabled={isLoading} className="glassmorphic">
                <Paperclip className="h-5 w-5" />
                <span className="sr-only">Attach file</span>
              </Button>
            </>
          )}

          {!currentFeature.requiresCodeInput && !currentFeature.requiresUrl && (
            <Input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={currentFeature.placeholder}
              className="flex-grow glassmorphic"
              disabled={isLoading}
            />
          )}
          {(currentFeature.requiresCodeInput || currentFeature.requiresUrl) && !currentFeature.requiresFileUpload && (
             <Input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Add a comment or instructions..."
              className="flex-grow glassmorphic"
              disabled={isLoading}
            />
          )}


          <Button type="submit" size="icon" disabled={isLoading || (!input && !file && !urlInput && !codeInput)} className="bg-primary hover:bg-primary/90">
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            <span className="sr-only">Send</span>
          </Button>
        </div>
        {file && <p className="text-xs text-muted-foreground">Selected file: {file.name}</p>}
      </form>
    </div>
  );
}
