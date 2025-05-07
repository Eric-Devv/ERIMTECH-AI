
"use client";
import React, { useState, useEffect, useRef, FormEvent, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Paperclip, Send, Mic, Bot, User, Image as ImageIcon, Film, Code, LinkIcon, AlertTriangle, Sparkles, Loader2, Copy, CornerDownLeft, Settings2, Brain, Palette, Languages, Plus, Trash2, Edit2, CircleArrowLeft, Menu, SidebarClose, SidebarOpen, MessageSquare } from 'lucide-react';
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
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import python from 'highlight.js/lib/languages/python';
import java from 'highlight.js/lib/languages/java';
import csharp from 'highlight.js/lib/languages/csharp';
import cpp from 'highlight.js/lib/languages/cpp';
import php from 'highlight.js/lib/languages/php';
import ruby from 'highlight.js/lib/languages/ruby';
import go from 'highlight.js/lib/languages/go';
import swift from 'highlight.js/lib/languages/swift';
import typescript from 'highlight.js/lib/languages/typescript';
import xml from 'highlight.js/lib/languages/xml'; // For HTML/XML
import css from 'highlight.js/lib/languages/css';
import json from 'highlight.js/lib/languages/json';
import bash from 'highlight.js/lib/languages/bash';
import shell from 'highlight.js/lib/languages/shell'; // Shell session
import plaintext from 'highlight.js/lib/languages/plaintext';

// Register languages
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('python', python);
hljs.registerLanguage('java', java);
hljs.registerLanguage('csharp', csharp);
hljs.registerLanguage('cpp', cpp);
hljs.registerLanguage('php', php);
hljs.registerLanguage('ruby', ruby);
hljs.registerLanguage('go', go);
hljs.registerLanguage('swift', swift);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('html', xml); // Alias HTML to XML
hljs.registerLanguage('css', css);
hljs.registerLanguage('json', json);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('shell', shell);
hljs.registerLanguage('plaintext', plaintext);


interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  type?: 'text' | 'code' | 'image_analysis' | 'audio_transcription' | 'video_summary' | 'url_analysis' | 'error';
  data?: any;
  timestamp: Date;
  feature?: AiFeature;
  isEditing?: boolean;
}

type AiFeature =
  | "chat"
  | "code_generation"
  | "code_explanation"
  | "image_analysis"
  | "audio_transcription"
  | "video_summarization"
  | "url_analysis";

interface Conversation {
  id: string;
  name: string;
  messages: Message[];
  feature: AiFeature;
  timestamp: Date;
}

const featureConfig: Record<AiFeature, { icon: JSX.Element, name: string, placeholder: string, requiresFileUpload?: boolean, requiresUrl?: boolean, requiresCodeInput?: boolean, inputType?: 'text' | 'textarea' | 'url' | 'file', defaultLanguage?: string }> = {
  chat: { icon: <Brain className="h-5 w-5" />, name: "AI Chat", placeholder: "Message ERIMTECH AI...", inputType: 'textarea' },
  code_generation: { icon: <Code className="h-5 w-5" />, name: "Generate Code", placeholder: "Describe the code you want to generate...", requiresCodeInput: true, inputType: 'textarea', defaultLanguage: 'python' },
  code_explanation: { icon: <Languages className="h-5 w-5" />, name: "Explain Code", placeholder: "Paste code here to get an explanation...", requiresCodeInput: true, inputType: 'textarea', defaultLanguage: 'javascript' },
  image_analysis: { icon: <ImageIcon className="h-5 w-5" />, name: "Analyze Image", placeholder: "Upload an image to analyze...", requiresFileUpload: true, inputType: 'file' },
  audio_transcription: { icon: <Mic className="h-5 w-5" />, name: "Transcribe Audio", placeholder: "Upload an audio file to transcribe...", requiresFileUpload: true, inputType: 'file' },
  video_summarization: { icon: <Film className="h-5 w-5" />, name: "Summarize Video", placeholder: "Enter video URL to summarize...", requiresUrl: true, inputType: 'url' },
  url_analysis: { icon: <LinkIcon className="h-5 w-5" />, name: "Analyze URL", placeholder: "Enter URL to analyze its content...", requiresUrl: true, inputType: 'url' },
};

const initialConversations: Conversation[] = [
  { id: 'chat-init-1', name: "Welcome Chat", messages: [{ id: 'msg-init-1', text: "Hello! How can I help you today?", sender: 'ai', timestamp: new Date(), feature: 'chat' }], feature: 'chat', timestamp: new Date() }
];

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(initialConversations[0]?.id || null);
  
  const [input, setInput] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [codeInput, setCodeInput] = useState('');
  const [codeLanguage, setCodeLanguage] = useState('javascript');
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [editingConversationId, setEditingConversationId] = useState<string | null>(null);
  const [editingConversationName, setEditingConversationName] = useState("");

  const activeConversation = useMemo(() => {
    return conversations.find(conv => conv.id === activeConversationId);
  }, [conversations, activeConversationId]);

  const currentFeature = activeConversation?.feature || 'chat';
  const currentFeatureDetails = featureConfig[currentFeature];
  
  useEffect(() => {
    // Scroll to bottom when messages in active conversation change
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [activeConversation?.messages]);

  useEffect(() => {
    // Reset inputs when feature changes (i.e., active conversation changes to one with a different feature)
    setInput('');
    setUrlInput('');
    setCodeInput('');
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (currentFeatureDetails.defaultLanguage) {
      setCodeLanguage(currentFeatureDetails.defaultLanguage);
    }
  }, [currentFeature, currentFeatureDetails.defaultLanguage]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      if (currentFeature === "image_analysis" && !selectedFile.type.startsWith("image/")) {
        toast({ title: "Invalid File", description: "Please upload an image file.", variant: "destructive" });
        return;
      }
      if (currentFeature === "audio_transcription" && !selectedFile.type.startsWith("audio/")) {
        toast({ title: "Invalid File", description: "Please upload an audio file.", variant: "destructive" });
        return;
      }
      setFile(selectedFile);
      addMessageToConversation(activeConversationId, `Uploaded ${selectedFile.name}`, 'user', 'text', undefined, currentFeature);
    }
  };

  const addMessageToConversation = (convoId: string | null, text: string, sender: 'user' | 'ai', type: Message['type'] = 'text', data?: any, featureUsed?: AiFeature) => {
    if (!convoId) return;
    setConversations(prevConvos =>
      prevConvos.map(convo =>
        convo.id === convoId
          ? { ...convo, messages: [...convo.messages, { id: Date.now().toString(), text, sender, type, data, timestamp: new Date(), feature: featureUsed || convo.feature }] }
          : convo
      )
    );
  };

  const getLanguageForHighlighting = (lang: string | undefined): string => {
    if (!lang || lang.toLowerCase() === 'other') {
      return 'plaintext';
    }
    const lowerLang = lang.toLowerCase();
    if (hljs.getLanguage(lowerLang)) {
      return lowerLang;
    }
    // Aliases for common variations
    const aliases: Record<string, string> = {
        'js': 'javascript',
        'ts': 'typescript',
        'py': 'python',
        'jsx': 'javascript', // or 'xml' if you prefer for JSX structure highlighting
        'tsx': 'typescript',
        'html': 'xml', // HTML is often highlighted as XML
        'sh': 'bash',
    };
    return aliases[lowerLang] || 'plaintext';
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!activeConversationId) {
        toast({ title: "No Active Conversation", description: "Please select or start a new conversation.", variant: "destructive"});
        return;
    }
    
    let userMessageText = input;
    if (currentFeatureDetails.requiresCodeInput) userMessageText = codeInput;
    else if (currentFeatureDetails.requiresUrl) userMessageText = urlInput;
    else if (currentFeatureDetails.requiresFileUpload && file) userMessageText = `Analyzing ${file.name}`;

    if (!userMessageText && !file) return;

    setIsLoading(true);
    if(userMessageText) addMessageToConversation(activeConversationId, userMessageText, 'user', 'text', undefined, currentFeature);
    
    const currentInput = input;
    const currentCode = codeInput;
    const currentUrl = urlInput;

    setInput(''); 
    setCodeInput('');
    setUrlInput('');
    
    try {
      let aiResponse: any;
      let responseType: Message['type'] = 'text';
      let responseData: any = {};

      switch (currentFeature) {
        case 'chat':
          aiResponse = await generateAiChatResponse({ prompt: currentInput, url: currentUrl || undefined });
          addMessageToConversation(activeConversationId, aiResponse.response, 'ai', 'text', undefined, 'chat');
          break;
        case 'code_generation':
          const generationPrompt = `Generate ${codeLanguage} code for: ${currentCode}. ${currentInput ? `Additional instructions: ${currentInput}` : ''}`;
          // Using generateCodeExplanation for structured code output for now
          aiResponse = await generateCodeExplanation({ code: generationPrompt, language: codeLanguage }); 
          responseType = 'code';
          // The actual code might be embedded within the explanation. For direct code output,
          // the AI flow would need to return a specific field for just the code.
          // Here, we assume the explanation IS or CONTAINS the code.
          responseData = { language: codeLanguage, code: aiResponse.explanation }; 
          addMessageToConversation(activeConversationId, aiResponse.explanation, 'ai', responseType, responseData, 'code_generation');
          break;
        case 'code_explanation':
          const explanationPrompt = `${currentInput ? `Regarding this code: ${currentInput}\n\n` : ''}${currentCode}`;
          aiResponse = await generateCodeExplanation({ code: explanationPrompt, language: codeLanguage });
          responseType = 'text'; // The explanation itself is text, but might contain code blocks if AI includes them
          addMessageToConversation(activeConversationId, aiResponse.explanation, 'ai', responseType, { language: codeLanguage, originalCode: currentCode }, 'code_explanation');
          break;
        case 'image_analysis':
          if (!file) throw new Error("No image file provided for analysis.");
          const imageDataUri = await readFileAsDataURL(file);
          aiResponse = await analyzeImage({ photoDataUri: imageDataUri });
          responseType = 'image_analysis';
          responseData = { imageUrl: imageDataUri, description: aiResponse.analysisResult.description };
          addMessageToConversation(activeConversationId, aiResponse.analysisResult.description, 'ai', responseType, responseData, 'image_analysis');
          break;
        case 'audio_transcription':
          if (!file) throw new Error("No audio file provided for transcription.");
          const audioDataUri = await readFileAsDataURL(file);
          aiResponse = await transcribeAudio({ audioDataUri });
          responseType = 'audio_transcription';
          addMessageToConversation(activeConversationId, aiResponse.transcription, 'ai', responseType, undefined, 'audio_transcription');
          break;
        case 'video_summarization':
          if (!currentUrl) throw new Error("No video URL provided for summarization.");
          aiResponse = await summarizeVideo({ videoUrl: currentUrl });
          responseType = 'video_summary';
          addMessageToConversation(activeConversationId, aiResponse.summary, 'ai', responseType, undefined, 'video_summarization');
          break;
        case 'url_analysis':
           if (!currentUrl) throw new Error("No URL provided for analysis.");
           aiResponse = await generateAiChatResponse({ prompt: `Summarize and analyze the content of this URL: ${currentUrl}. ${currentInput ? `Specific focus: ${currentInput}` : ''}`, url: currentUrl });
           responseType = 'url_analysis';
           addMessageToConversation(activeConversationId, aiResponse.response, 'ai', responseType, undefined, 'url_analysis');
          break;
        default:
          throw new Error("Invalid feature selected.");
      }
    } catch (error: any) {
      console.error("AI Error:", error);
      addMessageToConversation(activeConversationId, error.message || "An error occurred while processing your request.", 'ai', 'error', undefined, currentFeature);
      toast({ title: "Error", description: error.message || "Failed to get AI response.", variant: "destructive" });
    } finally {
      setIsLoading(false);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = ""; 
    }
  };

  const copyToClipboard = (text: string) => {
      navigator.clipboard.writeText(text);
      toast({ title: "Copied!", description: "Content copied to clipboard." });
  };

  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleStartNewConversation = (feature: AiFeature) => {
    const newConversationId = `${feature}-${Date.now()}`;
    const newConversationName = `${featureConfig[feature].name} Session ${conversations.filter(c => c.feature === feature).length + 1}`;
    const newConversation: Conversation = {
      id: newConversationId,
      name: newConversationName,
      messages: [{ id: `msg-init-${newConversationId}`, text: `Starting new ${featureConfig[feature].name} session. ${featureConfig[feature].placeholder}`, sender: 'ai', timestamp: new Date(), feature }],
      feature: feature,
      timestamp: new Date(),
    };
    setConversations(prev => [newConversation, ...prev]);
    setActiveConversationId(newConversationId);
    if (window.innerWidth < 768) setSidebarOpen(false); // Close sidebar on mobile after new chat
  };
  
  const handleDeleteConversation = (convoId: string) => {
    setConversations(prev => prev.filter(c => c.id !== convoId));
    if (activeConversationId === convoId) {
      setActiveConversationId(conversations.length > 1 ? conversations.find(c => c.id !== convoId)?.id || null : null);
    }
    toast({title: "Conversation Deleted"});
  };

  const handleEditConversationName = (convoId: string) => {
    const conversation = conversations.find(c => c.id === convoId);
    if (conversation) {
      setEditingConversationId(convoId);
      setEditingConversationName(conversation.name);
    }
  };

  const handleSaveConversationName = (convoId: string) => {
    setConversations(prev => prev.map(c => c.id === convoId ? {...c, name: editingConversationName} : c));
    setEditingConversationId(null);
    toast({title: "Conversation Renamed"});
  };

  const parseAndHighlight = (text: string, defaultLang?: string): (string | JSX.Element)[] => {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    let lastIndex = 0;
    const parts: (string | JSX.Element)[] = [];
    let match;
  
    while ((match = codeBlockRegex.exec(text)) !== null) {
      const [fullMatch, lang, code] = match;
      const language = getLanguageForHighlighting(lang || defaultLang);
      
      // Add text before the code block
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      
      // Add highlighted code block
      try {
        const highlightedCode = hljs.highlight(code, { language, ignoreIllegals: true }).value;
        parts.push(
          <div key={`code-${match.index}`} className="code-block relative bg-black/80 rounded-md shadow-inner my-2 overflow-x-auto">
            <div className="flex justify-between items-center px-3 py-1.5 bg-muted/30 border-b border-border/50 rounded-t-md">
              <span className="text-xs text-muted-foreground capitalize">{language}</span>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyToClipboard(code)}>
                <Copy className="h-3.5 w-3.5" />
                <span className="sr-only">Copy code</span>
              </Button>
            </div>
            <ScrollArea className="max-h-[400px]"> {/* Added ScrollArea for vertical scrolling of long code blocks */}
              <pre className="p-3 m-0 whitespace-pre text-sm leading-relaxed">
                <code className={`language-${language} hljs`} dangerouslySetInnerHTML={{ __html: highlightedCode }} />
              </pre>
            </ScrollArea>
          </div>
        );
      } catch (error) {
        console.error("Highlighting error:", error);
        // Fallback for non-highlightable code
        parts.push(
          <pre className="p-3 m-0 whitespace-pre text-sm bg-muted/50 rounded-md my-2 overflow-x-auto">
            <code>{code}</code>
          </pre>
        );
      }
      lastIndex = match.index + fullMatch.length;
    }
  
    // Add any remaining text after the last code block
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }
    
    // If no code blocks, return the plain text
    if (parts.length === 0 && text) {
        return [text];
    }

    return parts;
  };


  const renderMessageContent = (message: Message) => {
    // For AI messages of specified types, use parseAndHighlight
    if (message.sender === 'ai' && (message.type === 'text' || message.type === 'code_explanation' || message.type === 'url_analysis' || message.type === 'video_summary' || message.type === 'audio_transcription')) {
      const contentParts = parseAndHighlight(message.text, message.data?.language);
      return <div className="text-sm whitespace-pre-wrap leading-relaxed">{contentParts.map((part, i) => <React.Fragment key={i}>{part}</React.Fragment>)}</div>;
    }
    // For specific 'code' type messages (potentially from code generation if it returns just code)
    if (message.type === 'code' && message.data?.code) {
      const language = getLanguageForHighlighting(message.data.language);
      const highlightedCode = hljs.highlight(message.data.code, { language, ignoreIllegals: true }).value;
      return (
        <div className="code-block relative bg-black/80 rounded-md shadow-inner my-1 w-full overflow-x-auto">
          <div className="flex justify-between items-center px-3 py-1.5 bg-muted/30 border-b border-border/50 rounded-t-md">
            <span className="text-xs text-muted-foreground capitalize">{language}</span>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyToClipboard(message.data.code)}>
              <Copy className="h-3.5 w-3.5" />
              <span className="sr-only">Copy code</span>
            </Button>
          </div>
          <ScrollArea className="max-h-[400px] p-0"> 
            <pre className="p-3 m-0 whitespace-pre text-sm leading-relaxed">
                <code className={`language-${language} hljs`} dangerouslySetInnerHTML={{ __html: highlightedCode }} />
            </pre>
          </ScrollArea>
        </div>
      );
    }
    if (message.type === 'image_analysis' && message.data?.imageUrl) {
      return (
        <>
          <img src={message.data.imageUrl} alt="Analyzed content" className="rounded-md max-h-64 my-1 border border-border/50" data-ai-hint="analysis preview" />
          <p className="text-sm mt-1 whitespace-pre-wrap">{message.text}</p>
        </>
      );
    }
    // Default for user messages and other AI messages not covered above
    return <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.text}</p>;
  };

  return (
    <div className="flex h-[calc(100vh-5rem)]"> {/* Adjusted height for header */}
      {/* Sidebar */}
      <div className={cn(
        "bg-muted/30 transition-all duration-300 ease-in-out flex flex-col border-r border-border/50", // Slightly less opaque sidebar
        sidebarOpen ? "w-72 p-2 md:p-3" : "w-0 p-0 opacity-0 hidden md:block md:w-16 md:p-2 md:opacity-100"
      )}>
        {sidebarOpen ? (
          <>
            <div className="flex justify-between items-center mb-2 md:mb-3">
              <h2 className="text-lg font-orbitron text-primary">Conversations</h2>
              <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)} className="md:hidden">
                <SidebarClose className="h-5 w-5" />
              </Button>
            </div>
            <Select onValueChange={(value) => handleStartNewConversation(value as AiFeature)}>
              <SelectTrigger className="w-full h-9 md:h-10 mb-2 md:mb-3 glassmorphic focus:ring-primary/50">
                <Plus className="h-4 w-4 mr-2" /> New Chat
              </SelectTrigger>
              <SelectContent>
                {Object.entries(featureConfig).map(([key, { icon, name }]) => (
                  <SelectItem key={key} value={key} className="text-sm">
                    <div className="flex items-center gap-2">
                      {React.cloneElement(icon, {className: "h-4 w-4"})} {name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <ScrollArea className="flex-grow">
              <div className="space-y-1.5">
                {conversations.map(convo => (
                  <Card 
                    key={convo.id} 
                    onClick={() => {
                      setActiveConversationId(convo.id);
                      if (window.innerWidth < 768) setSidebarOpen(false); // Close sidebar on mobile
                    }}
                    className={cn(
                      "p-2 rounded-lg cursor-pointer transition-colors hover:bg-primary/10",
                      activeConversationId === convo.id ? "bg-primary/20 border-primary/50" : "bg-background/30"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      {editingConversationId === convo.id ? (
                        <Input 
                          value={editingConversationName}
                          onChange={(e) => setEditingConversationName(e.target.value)}
                          onBlur={() => handleSaveConversationName(convo.id)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSaveConversationName(convo.id)}
                          className="h-7 text-sm flex-grow mr-1"
                          autoFocus
                        />
                      ) : (
                        <span className="text-sm font-medium truncate flex-grow">{convo.name}</span>
                      )}
                      <div className="flex items-center shrink-0">
                        {editingConversationId !== convo.id && (
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => {e.stopPropagation(); handleEditConversationName(convo.id);}}>
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" className="h-6 w-6 hover:text-destructive" onClick={(e) => {e.stopPropagation(); handleDeleteConversation(convo.id)}}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <div className="flex items-center text-xs text-muted-foreground">
                        {React.cloneElement(featureConfig[convo.feature].icon, {className: "h-3.5 w-3.5 mr-1"})}
                        {featureConfig[convo.feature].name}
                      </div>
                      <p className="text-xs text-muted-foreground">{new Date(convo.timestamp).toLocaleDateString()}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </>
        ) : ( // Collapsed sidebar for desktop
          <div className="flex flex-col items-center space-y-2 md:space-y-3">
             <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)} className="mt-1">
                <SidebarOpen className="h-5 w-5" />
              </Button>
            {Object.entries(featureConfig).map(([key, { icon, name }]) => (
                <Button key={key} variant="ghost" size="icon" onClick={() => handleStartNewConversation(key as AiFeature)} title={`New ${name} Chat`}>
                    {React.cloneElement(icon, {className: "h-5 w-5"})}
                </Button>
            ))}
          </div>
        )}
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-background overflow-hidden">
        <header className="p-2 md:p-3 border-b border-border/50 flex items-center justify-between bg-muted/20">
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)} className={cn(sidebarOpen && "md:hidden")}>
                {sidebarOpen ? <CircleArrowLeft className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          <div className="flex items-center gap-2">
            {activeConversation && React.cloneElement(featureConfig[activeConversation.feature].icon, {className: "h-5 w-5 md:h-6 md:w-6 text-primary"})}
            <h2 className="text-md md:text-lg font-orbitron text-primary truncate">
              {activeConversation ? activeConversation.name : "ERIMTECH AI"}
            </h2>
          </div>
          <Select value={currentFeature} onValueChange={(value) => handleStartNewConversation(value as AiFeature)}>
            <SelectTrigger className="w-auto md:w-[200px] h-8 md:h-9 text-xs glassmorphic focus:ring-primary/50">
              <div className="flex items-center gap-1.5"> {React.cloneElement(currentFeatureDetails.icon, {className:"h-4 w-4"})} <span className="hidden md:inline">{currentFeatureDetails.name}</span></div>
            </SelectTrigger>
            <SelectContent>
              {Object.entries(featureConfig).map(([key, { icon, name }]) => (
                <SelectItem key={key} value={key} className="text-xs">
                  <div className="flex items-center gap-2">
                    {React.cloneElement(icon, {className: "h-4 w-4"})} {name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </header>

        <ScrollArea className="flex-grow p-3 md:p-4 space-y-3 md:space-y-4" ref={scrollAreaRef}>
          {(!activeConversation || activeConversation.messages.length === 0) && !isLoading && (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
              <MessageSquare className="h-12 w-12 md:h-16 md:w-16 mb-3 md:mb-4 text-primary/70" />
              <p className="text-md md:text-lg">Start a new conversation</p>
              <p className="text-sm">Select a feature or choose from your past chats.</p>
            </div>
          )}
          {activeConversation?.messages.map(message => (
            <div key={message.id} className={`flex flex-col mb-3 ${message.sender === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={cn(
                  "flex items-start gap-2 w-full",
                  message.sender === 'user' ? 'justify-end' : 'justify-start'
                )}>
                {message.sender === 'ai' && (
                  <Avatar className="h-7 w-7 md:h-8 md:w-8 shrink-0">
                    <AvatarImage src="/logo.svg" alt="AI Avatar" />
                    <AvatarFallback><Bot className="h-4 w-4 md:h-5 md:w-5"/></AvatarFallback>
                  </Avatar>
                )}
                <Card 
                  className={cn(
                    "p-2.5 md:p-3 rounded-xl md:rounded-2xl shadow-md relative max-w-[90%] md:max-w-[80%]",
                    message.sender === 'user' ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-muted text-foreground rounded-bl-none',
                     (message.type === 'code' || (message.text && message.text.includes("```"))) ? 'w-full' : '' // Make code blocks take more width
                  )}
                >
                  {message.type === 'error' && <AlertTriangle className="h-4 w-4 md:h-5 md:w-5 text-destructive inline mr-1 mb-0.5" />}
                  {renderMessageContent(message)}
                  <p className="text-xs text-muted-foreground/60 mt-1 text-right">
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </Card>
                {message.sender === 'user' && (
                  <Avatar className="h-7 w-7 md:h-8 md:w-8 shrink-0">
                    <AvatarImage src="" alt="User Avatar"/> {/* Placeholder for user avatar if available */}
                    <AvatarFallback><User className="h-4 w-4 md:h-5 md:w-5"/></AvatarFallback>
                  </Avatar>
                )}
              </div>
            </div>
          ))}
          {isLoading && activeConversationId && (
            <div className="flex items-start gap-2 max-w-[90%] md:max-w-[80%]">
              <Avatar className="h-7 w-7 md:h-8 md:w-8 shrink-0">
                <AvatarImage src="/logo.svg" alt="AI Avatar" />
                <AvatarFallback><Bot className="h-4 w-4 md:h-5 md:w-5"/></AvatarFallback>
              </Avatar>
              <div className="p-2.5 md:p-3 rounded-xl md:rounded-2xl shadow-md bg-muted text-foreground rounded-bl-none flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">ERIMTECH AI is thinking...</p>
              </div>
            </div>
          )}
        </ScrollArea>

        <footer className="p-2 md:p-3 border-t border-border/50 bg-muted/20">
          <form onSubmit={handleSubmit} className="space-y-1.5 md:space-y-2">
            {currentFeatureDetails.requiresCodeInput && (
              <div className="grid grid-cols-[1fr_auto] gap-1.5 md:gap-2 items-end">
                <Textarea
                  id="codeInput"
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value)}
                  placeholder={currentFeatureDetails.placeholder}
                  className="min-h-[60px] md:min-h-[80px] max-h-[150px] md:max-h-[200px] text-sm glassmorphic focus:ring-primary/50 resize-y"
                  disabled={isLoading || !activeConversationId}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey && !isLoading) { e.preventDefault(); handleSubmit(e);}}}
                />
                <Select value={codeLanguage} onValueChange={setCodeLanguage} disabled={isLoading || !activeConversationId}>
                  <SelectTrigger className="w-auto md:w-[140px] h-9 md:h-10 text-xs glassmorphic focus:ring-primary/50">
                    <Code className="h-3.5 w-3.5 mr-1 text-muted-foreground" /> <span className="truncate">{codeLanguage}</span>
                  </SelectTrigger>
                  <SelectContent>
                    {['javascript', 'python', 'java', 'csharp', 'cpp', 'php', 'ruby', 'go', 'swift', 'typescript', 'html', 'css', 'json', 'bash', 'shell', 'plaintext', 'other'].map(lang => (
                      <SelectItem key={lang} value={lang} className="text-xs">{lang}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {(currentFeatureDetails.inputType === 'url' || (currentFeature === 'chat' && currentFeatureDetails.inputType === 'textarea')) && (
                <Input
                    id="urlInput"
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder={currentFeature === 'chat' ? "Optional: Enter URL for context..." : currentFeatureDetails.placeholder}
                    className="h-9 md:h-10 text-sm glassmorphic focus:ring-primary/50"
                    disabled={isLoading || !activeConversationId}
                />
            )}
            
            <div className="flex items-center space-x-1.5 md:space-x-2">
              {currentFeatureDetails.requiresFileUpload && (
                <>
                  <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept={currentFeature === 'image_analysis' ? 'image/*' : (currentFeature === 'audio_transcription' ? 'audio/*' : '*/*')} disabled={!activeConversationId} />
                  <Button type="button" variant="outline" size="icon" onClick={() => fileInputRef.current?.click()} disabled={isLoading || !activeConversationId} className="h-9 w-9 md:h-10 md:w-10 glassmorphic focus:ring-primary/50 hover:bg-primary/10">
                    <Paperclip className="h-4 w-4" />
                    <span className="sr-only">Attach file</span>
                  </Button>
                </>
              )}

              {currentFeatureDetails.inputType === 'textarea' && !currentFeatureDetails.requiresCodeInput && (
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={currentFeatureDetails.placeholder}
                  className="flex-grow min-h-[36px] md:min-h-[40px] max-h-[120px] md:max-h-[150px] text-sm glassmorphic focus:ring-primary/50 resize-y"
                  disabled={isLoading || !activeConversationId}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey && !isLoading) { e.preventDefault(); handleSubmit(e);}}}
                />
              )}
              {currentFeatureDetails.inputType !== 'textarea' && !currentFeatureDetails.requiresCodeInput && !currentFeatureDetails.requiresFileUpload && currentFeatureDetails.inputType !== 'url' &&(
                 <Input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={currentFeatureDetails.placeholder}
                  className="flex-grow h-9 md:h-10 text-sm glassmorphic focus:ring-primary/50"
                  disabled={isLoading || !activeConversationId}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !isLoading) { e.preventDefault(); handleSubmit(e);}}}
                />
              )}
               {/* Input for general text if not covered by specific types */}
              {(currentFeatureDetails.requiresCodeInput || (currentFeatureDetails.requiresUrl && currentFeature !== 'chat') || currentFeatureDetails.requiresFileUpload) && (
                  <Input
                      type="text"
                      value={input} // Use main input for general comments with these features
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Add a comment or specific instructions..."
                      className="flex-grow h-9 md:h-10 text-sm glassmorphic focus:ring-primary/50"
                      disabled={isLoading || !activeConversationId}
                      onKeyDown={(e) => { if (e.key === 'Enter' && !isLoading) { e.preventDefault(); handleSubmit(e);}}}
                  />
              )}


              <Button type="submit" size="icon" disabled={isLoading || (!input && !file && !urlInput && !codeInput) || !activeConversationId} className="h-9 w-9 md:h-10 md:w-10 bg-primary hover:bg-primary/90 disabled:bg-muted">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                <span className="sr-only">Send</span>
              </Button>
            </div>
            {file && <p className="text-xs text-muted-foreground pt-0.5 md:pt-1">Selected: {file.name}</p>}
          </form>
        </footer>
      </div>
    </div>
  );
}

    
