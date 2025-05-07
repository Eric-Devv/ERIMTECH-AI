
"use client";
import React, { useState, useEffect, useRef, FormEvent, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Paperclip, Send, Mic, Bot, User, Image as ImageIcon, Film, Code, LinkIcon, AlertTriangle, Sparkles, Loader2, Copy, CornerDownLeft, Settings2, Brain, Palette, Languages, Plus, Trash2, Edit2, CircleArrowLeft, Menu, SidebarClose, SidebarOpen, MessageSquare, X, GripVertical } from 'lucide-react';
import { generateAiChatResponse } from '@/ai/flows/generate-ai-chat-response';
import { generateCodeExplanation } from '@/ai/flows/generate-code-explanation';
import { summarizeVideo } from '@/ai/flows/summarize-video';
import { transcribeAudio } from '@/ai/flows/transcribe-audio';
import { analyzeImage } from '@/ai/flows/analyze-image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import { ConversationListItem } from '@/components/chat/conversation-list-item';


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

export type AiFeature =
  | "chat"
  | "code_generation"
  | "code_explanation"
  | "image_analysis"
  | "audio_transcription"
  | "video_summarization"
  | "url_analysis";

export interface Conversation {
  id: string;
  name: string;
  messages: Message[];
  feature: AiFeature;
  timestamp: Date;
}

export const featureConfig: Record<AiFeature, { icon: JSX.Element, name: string, placeholder: string, requiresFileUpload?: boolean, requiresUrl?: boolean, requiresCodeInput?: boolean, inputType?: 'text' | 'textarea' | 'url' | 'file', defaultLanguage?: string }> = {
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
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [activeConversation?.messages]);

  useEffect(() => {
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
    const aliases: Record<string, string> = {
        'js': 'javascript',
        'ts': 'typescript',
        'py': 'python',
        'jsx': 'javascript',
        'tsx': 'typescript',
        'html': 'xml',
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
          aiResponse = await generateCodeExplanation({ code: generationPrompt, language: codeLanguage }); 
          responseType = 'code';
          responseData = { language: codeLanguage, code: aiResponse.explanation }; 
          addMessageToConversation(activeConversationId, aiResponse.explanation, 'ai', responseType, responseData, 'code_generation');
          break;
        case 'code_explanation':
          const explanationPrompt = `${currentInput ? `Regarding this code: ${currentInput}\n\n` : ''}${currentCode}`;
          aiResponse = await generateCodeExplanation({ code: explanationPrompt, language: codeLanguage });
          responseType = 'text';
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
    if (window.innerWidth < 768) setSidebarOpen(false);
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
      
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      
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
            <ScrollArea className="max-h-[400px] p-0">
              <pre className="p-3 m-0 whitespace-pre text-sm leading-relaxed">
                <code className={`language-${language} hljs`} dangerouslySetInnerHTML={{ __html: highlightedCode }} />
              </pre>
            </ScrollArea>
          </div>
        );
      } catch (error) {
        console.error("Highlighting error:", error);
        parts.push(
          <pre className="p-3 m-0 whitespace-pre text-sm bg-muted/50 rounded-md my-2 overflow-x-auto">
            <code>{code}</code>
          </pre>
        );
      }
      lastIndex = match.index + fullMatch.length;
    }
  
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }
    
    if (parts.length === 0 && text) {
        return [text];
    }

    return parts;
  };


  const renderMessageContent = (message: Message) => {
    if (message.sender === 'ai' && (message.type === 'text' || message.type === 'code_explanation' || message.type === 'url_analysis' || message.type === 'video_summary' || message.type === 'audio_transcription')) {
      const contentParts = parseAndHighlight(message.text, message.data?.language);
      return <div className="text-sm whitespace-pre-wrap leading-relaxed">{contentParts.map((part, i) => <React.Fragment key={i}>{part}</React.Fragment>)}</div>;
    }
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
          <ScrollArea className="max-h-[60vh] p-0"> 
            <pre className="p-3 m-0 whitespace-pre text-sm leading-relaxed">
                <code className={`language-${language} hljs`} dangerouslySetInnerHTML={{ __html: highlightedCode }} />
            </pre>
          </ScrollArea>
        </div>
      );
    }
    if (message.type === 'image_analysis' && message.data?.imageUrl) {
      return (
        <div className="space-y-2">
          <img src={message.data.imageUrl} alt="Analyzed content" className="rounded-md max-h-64 my-1 border border-border/50" data-ai-hint="analysis preview" />
          <p className="text-sm mt-1 whitespace-pre-wrap">{message.text}</p>
        </div>
      );
    }
    return <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.text}</p>;
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] border border-border/50 rounded-lg overflow-hidden shadow-xl bg-muted/20"> {/* Main container with border & shadow */}
      {/* Sidebar */}
      <div className={cn(
        "bg-background/80 backdrop-blur-sm transition-all duration-300 ease-in-out flex flex-col border-r border-border/50",
        sidebarOpen ? "w-72 p-3" : "w-0 p-0 opacity-0 md:w-20 md:p-2 md:opacity-100"
      )}>
        {sidebarOpen ? (
          <>
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-orbitron text-primary">Conversations</h2>
              <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)} className="md:hidden">
                <SidebarClose className="h-5 w-5" />
              </Button>
            </div>
            <Select onValueChange={(value) => handleStartNewConversation(value as AiFeature)}>
              <SelectTrigger className="w-full h-10 mb-3 glassmorphic focus:ring-primary/50">
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
            <ScrollArea className="flex-grow -mr-2 pr-2"> {/* Negative margin to hide scrollbar track */}
              <div className="space-y-1.5">
              {conversations.map(convo => (
                <ConversationListItem
                  key={convo.id}
                  convo={convo}
                  isActive={activeConversationId === convo.id}
                  onClick={() => {
                    setActiveConversationId(convo.id);
                    if (window.innerWidth < 768) setSidebarOpen(false);
                  }}
                  isEditing={editingConversationId === convo.id}
                  editingName={editingConversationName}
                  onNameChange={setEditingConversationName}
                  onSaveName={handleSaveConversationName}
                  onEdit={handleEditConversationName}
                  onDelete={handleDeleteConversation}
                />
              ))}
              </div>
            </ScrollArea>
          </>
        ) : ( 
          <div className="flex flex-col items-center space-y-3 mt-1">
             <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)} title="Open Sidebar">
                <Menu className="h-5 w-5" />
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
        <header className="p-3 border-b border-border/50 flex items-center justify-between bg-muted/30">
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)} className={cn(sidebarOpen && "md:hidden")}>
                {sidebarOpen ? <CircleArrowLeft className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          <div className="flex items-center gap-2">
            {activeConversation && React.cloneElement(featureConfig[activeConversation.feature].icon, {className: "h-6 w-6 text-primary"})}
            <h2 className="text-lg font-orbitron text-primary truncate">
              {activeConversation ? activeConversation.name : "ERIMTECH AI"}
            </h2>
          </div>
          <Select value={currentFeature} onValueChange={(value) => handleStartNewConversation(value as AiFeature)}>
            <SelectTrigger className="w-auto md:w-[200px] h-9 text-xs glassmorphic focus:ring-primary/50">
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

        <ScrollArea className="flex-grow p-4 space-y-4" ref={scrollAreaRef}>
          {(!activeConversation || activeConversation.messages.length === 0) && !isLoading && (
             <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="p-8 bg-muted/50 rounded-full mb-6 animate-pulse">
                <Bot className="h-20 w-20 text-primary" />
              </div>
              <h2 className="text-2xl font-orbitron mb-2">Welcome to ERIMTECH AI</h2>
              <p className="text-muted-foreground max-w-md">
                Select a feature or start a new chat from the sidebar to begin. 
                Your journey into advanced AI starts now.
              </p>
            </div>
          )}
          {activeConversation?.messages.map(message => (
            <div key={message.id} className={`flex flex-col mb-3 items-stretch ${message.sender === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={cn(
                  "flex items-start gap-2.5 w-full",
                  message.sender === 'user' ? 'justify-end' : 'justify-start'
                )}>
                {message.sender === 'ai' && (
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarImage src="/logo.svg" alt="AI Avatar" />
                    <AvatarFallback><Bot className="h-5 w-5"/></AvatarFallback>
                  </Avatar>
                )}
                <div 
                  className={cn(
                    "p-3 rounded-xl shadow-md relative max-w-[90%] md:max-w-[80%] overflow-hidden", // Added overflow-hidden
                    message.sender === 'user' ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-muted text-foreground rounded-bl-none',
                    (message.type === 'code' || (message.text && message.text.includes("```")) || message.type === 'image_analysis' ) ? 'w-full sm:w-auto' : 'w-auto' // Full width for code/image on small, auto on larger
                  )}
                >
                  {message.type === 'error' && <AlertTriangle className="h-5 w-5 text-destructive inline mr-1 mb-0.5" />}
                  {renderMessageContent(message)}
                  <p className="text-xs text-muted-foreground/70 mt-1.5 text-right">
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                {message.sender === 'user' && (
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarImage src="" alt="User Avatar"/>
                    <AvatarFallback><User className="h-5 w-5"/></AvatarFallback>
                  </Avatar>
                )}
              </div>
            </div>
          ))}
          {isLoading && activeConversationId && (
            <div className="flex items-start gap-2.5 max-w-[90%] md:max-w-[80%]">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarImage src="/logo.svg" alt="AI Avatar" />
                <AvatarFallback><Bot className="h-5 w-5"/></AvatarFallback>
              </Avatar>
              <div className="p-3 rounded-xl shadow-md bg-muted text-foreground rounded-bl-none flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">ERIMTECH AI is thinking...</p>
              </div>
            </div>
          )}
        </ScrollArea>

        <footer className="p-3 border-t border-border/50 bg-muted/30">
          <form onSubmit={handleSubmit} className="space-y-2">
            {currentFeatureDetails.requiresCodeInput && (
              <div className="grid grid-cols-[1fr_auto] gap-2 items-end">
                <Textarea
                  id="codeInput"
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value)}
                  placeholder={currentFeatureDetails.placeholder}
                  className="min-h-[80px] max-h-[200px] text-sm glassmorphic focus:ring-primary/50 resize-y"
                  disabled={isLoading || !activeConversationId}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey && !isLoading) { e.preventDefault(); handleSubmit(e);}}}
                />
                <Select value={codeLanguage} onValueChange={setCodeLanguage} disabled={isLoading || !activeConversationId}>
                  <SelectTrigger className="w-auto md:w-[140px] h-10 text-xs glassmorphic focus:ring-primary/50">
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
                    className="h-10 text-sm glassmorphic focus:ring-primary/50"
                    disabled={isLoading || !activeConversationId}
                />
            )}
            
            <div className="flex items-end space-x-2"> {/* Changed to items-end for better alignment with Textarea */}
              {currentFeatureDetails.requiresFileUpload && (
                <>
                  <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept={currentFeature === 'image_analysis' ? 'image/*' : (currentFeature === 'audio_transcription' ? 'audio/*' : '*/*')} disabled={!activeConversationId} />
                  <Button type="button" variant="outline" size="icon" onClick={() => fileInputRef.current?.click()} disabled={isLoading || !activeConversationId} className="h-10 w-10 glassmorphic focus:ring-primary/50 hover:bg-primary/10">
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
                  className="flex-grow min-h-[40px] max-h-[150px] text-sm glassmorphic focus:ring-primary/50 resize-y"
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
                  className="flex-grow h-10 text-sm glassmorphic focus:ring-primary/50"
                  disabled={isLoading || !activeConversationId}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !isLoading) { e.preventDefault(); handleSubmit(e);}}}
                />
              )}
              {(currentFeatureDetails.requiresCodeInput || (currentFeatureDetails.requiresUrl && currentFeature !== 'chat') || currentFeatureDetails.requiresFileUpload) && (
                  <Input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Add a comment or specific instructions..."
                      className="flex-grow h-10 text-sm glassmorphic focus:ring-primary/50"
                      disabled={isLoading || !activeConversationId}
                      onKeyDown={(e) => { if (e.key === 'Enter' && !isLoading) { e.preventDefault(); handleSubmit(e);}}}
                  />
              )}


              <Button type="submit" size="icon" disabled={isLoading || (!input && !file && !urlInput && !codeInput) || !activeConversationId} className="h-10 w-10 bg-primary hover:bg-primary/90 disabled:bg-muted">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                <span className="sr-only">Send</span>
              </Button>
            </div>
            {file && <p className="text-xs text-muted-foreground pt-1">Selected: {file.name}</p>}
          </form>
        </footer>
      </div>
    </div>
  );
}
