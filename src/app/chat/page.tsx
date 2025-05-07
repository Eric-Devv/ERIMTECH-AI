"use client";
import React, { useState, useEffect, useRef, FormEvent, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Paperclip, Send, Mic, Bot, User, ImageIcon, Film, Code, Link as LinkIconLucide, AlertTriangle, Sparkles, Loader2, Copy, Settings2, Brain, Palette, Languages, Plus, Trash2, Edit2, CircleArrowLeft, Menu, SidebarClose, SidebarOpen, MessageSquare, X, GripVertical } from 'lucide-react';
import { generateAiChatResponse } from '@/ai/flows/generate-ai-chat-response';
import { generateCodeExplanation } from '@/ai/flows/generate-code-explanation';
import { summarizeVideo } from '@/ai/flows/summarize-video';
import { transcribeAudio } from '@/ai/flows/transcribe-audio';
import { analyzeImage } from '@/ai/flows/analyze-image';
import { Card } from '@/components/ui/card';
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
  data?: any; // To store image URLs, code language, etc.
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

export const featureConfig: Record<AiFeature, { icon: React.ElementType, name: string, placeholder: string, requiresFileUpload?: boolean, requiresUrl?: boolean, requiresCodeInput?: boolean, inputType?: 'text' | 'textarea' | 'url' | 'file', defaultLanguage?: string, acceptedFileTypes?: string }> = {
  chat: { icon: Brain, name: "AI Chat", placeholder: "Message ERIMTECH AI...", inputType: 'textarea' },
  code_generation: { icon: Code, name: "Generate Code", placeholder: "Describe the code you want to generate...", requiresCodeInput: true, inputType: 'textarea', defaultLanguage: 'python' },
  code_explanation: { icon: Languages, name: "Explain Code", placeholder: "Paste code here to get an explanation...", requiresCodeInput: true, inputType: 'textarea', defaultLanguage: 'javascript' },
  image_analysis: { icon: ImageIcon, name: "Analyze Image", placeholder: "Upload an image to analyze...", requiresFileUpload: true, inputType: 'file', acceptedFileTypes: 'image/*' },
  audio_transcription: { icon: Mic, name: "Transcribe Audio", placeholder: "Upload an audio file to transcribe...", requiresFileUpload: true, inputType: 'file', acceptedFileTypes: 'audio/*' },
  video_summarization: { icon: Film, name: "Summarize Video", placeholder: "Enter video URL to summarize...", requiresUrl: true, inputType: 'url' },
  url_analysis: { icon: LinkIconLucide, name: "Analyze URL", placeholder: "Enter URL to analyze its content...", requiresUrl: true, inputType: 'url' },
};

const ERIMTECH_LOGO_URL = "https://erimtechsolutions.co.ke/wp-content/uploads/2023/10/Erimlecita-logo-landscape-e1696571560902-1.png";


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
  const micInputRef = useRef<HTMLInputElement>(null); // For voice input
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [editingConversationId, setEditingConversationId] = useState<string | null>(null);
  const [editingConversationName, setEditingConversationName] = useState("");

  const activeConversation = useMemo(() => {
    return conversations.find(conv => conv.id === activeConversationId);
  }, [conversations, activeConversationId]);

  const currentFeature: AiFeature = activeConversation?.feature || 'chat';
  const currentFeatureDetails = featureConfig[currentFeature];
  const CurrentFeatureIcon = currentFeatureDetails.icon;
  
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, []);

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
    if (micInputRef.current) micInputRef.current.value = "";
    if (currentFeatureDetails.defaultLanguage) {
      setCodeLanguage(currentFeatureDetails.defaultLanguage);
    }
  }, [currentFeature, activeConversationId, currentFeatureDetails.defaultLanguage]);


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
      // User message will be added in handleSubmit
    }
  };

  const addMessageToConversation = (convoId: string | null, text: string, sender: 'user' | 'ai', type: Message['type'] = 'text', data?: any, featureUsed?: AiFeature) => {
    if (!convoId) return;
    setConversations(prevConvos =>
      prevConvos.map(convo =>
        convo.id === convoId
          ? { ...convo, messages: [...convo.messages, { id: Date.now().toString(), text, sender, type, data, timestamp: new Date(), feature: featureUsed || convo.feature }], timestamp: new Date() }
          : convo
      ).sort((a,b) => b.timestamp.getTime() - a.timestamp.getTime())
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
        'js': 'javascript', 'ts': 'typescript', 'py': 'python',
        'jsx': 'javascript', 'tsx': 'typescript', 'html': 'xml', 'sh': 'bash',
    };
    return aliases[lowerLang] || 'plaintext';
  };

  const handleSubmit = async (e?: FormEvent, voiceInputText?: string) => {
    if (e) e.preventDefault();

    if (!activeConversationId) {
        toast({ title: "No Active Conversation", description: "Please select or start a new conversation.", variant: "destructive"});
        return;
    }
    
    let userMessageText = voiceInputText || input;
    let userMessageData: any = {};

    if (!voiceInputText) { // If not from voice input, consider current feature inputs
        if (currentFeatureDetails.requiresCodeInput) userMessageText = codeInput;
        else if (currentFeatureDetails.requiresUrl) userMessageText = urlInput;
        else if (currentFeatureDetails.requiresFileUpload && file) {
          userMessageText = `Processing ${file.name}`;
        }
    }

    if (!userMessageText && !file && !voiceInputText) return;

    setIsLoading(true);
    
    const currentInputVal = input;
    const currentCodeVal = codeInput;
    const currentUrlVal = urlInput;
    const currentFileVal = file;

    // Add user message
    if (currentFeatureDetails.requiresFileUpload && currentFileVal && !voiceInputText) {
      const dataUri = await readFileAsDataURL(currentFileVal);
      userMessageData = {
        fileType: currentFeature === 'image_analysis' ? 'image' : 'audio',
        dataUri: dataUri,
        fileName: currentFileVal.name,
      };
      addMessageToConversation(activeConversationId, `Uploaded ${currentFileVal.name}`, 'user', 'text', userMessageData, currentFeature);
    } else if (userMessageText) {
       addMessageToConversation(activeConversationId, userMessageText, 'user', 'text', undefined, currentFeature);
    }
    
    setInput(''); 
    setCodeInput('');
    setUrlInput('');
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = ""; 
    
    try {
      let aiResponse: any;
      let responseType: Message['type'] = 'text';
      let responseData: any = {};

      const promptForAi = voiceInputText || currentInputVal;

      switch (currentFeature) {
        case 'chat':
          aiResponse = await generateAiChatResponse({ prompt: promptForAi, url: currentUrlVal || undefined });
          addMessageToConversation(activeConversationId, aiResponse.response, 'ai', 'text', undefined, 'chat');
          break;
        case 'code_generation':
          const codeGenPrompt = `Generate ${codeLanguage} code for the following task: "${voiceInputText || currentCodeVal}". ${currentInputVal && !voiceInputText ? `Additional details: "${currentInputVal}"` : ''}. Output only the code block in markdown format.`;
          aiResponse = await generateAiChatResponse({ prompt: codeGenPrompt });
          responseType = 'code'; 
          responseData = { language: codeLanguage, code: aiResponse.response }; 
          addMessageToConversation(activeConversationId, aiResponse.response, 'ai', responseType, responseData, 'code_generation');
          break;
        case 'code_explanation':
          const codeToExplain = voiceInputText || currentCodeVal;
          aiResponse = await generateCodeExplanation({ code: codeToExplain, language: codeLanguage }); 
          responseType = 'text'; 
          addMessageToConversation(activeConversationId, aiResponse.explanation, 'ai', responseType, { language: codeLanguage, originalCode: codeToExplain }, 'code_explanation');
          break;
        case 'image_analysis':
          if (!currentFileVal) throw new Error("No image file provided for analysis.");
          const imageDataUri = userMessageData.dataUri || await readFileAsDataURL(currentFileVal);
          aiResponse = await analyzeImage({ photoDataUri: imageDataUri });
          responseType = 'image_analysis';
          responseData = { imageUrl: imageDataUri, description: aiResponse.analysisResult.description };
          addMessageToConversation(activeConversationId, aiResponse.analysisResult.description, 'ai', responseType, responseData, 'image_analysis');
          break;
        case 'audio_transcription':
          if (!currentFileVal) throw new Error("No audio file provided for transcription.");
          const audioDataUri = userMessageData.dataUri || await readFileAsDataURL(currentFileVal);
          aiResponse = await transcribeAudio({ audioDataUri });
          responseType = 'audio_transcription';
          addMessageToConversation(activeConversationId, aiResponse.transcription, 'ai', responseType, { originalAudioFileName: currentFileVal.name }, 'audio_transcription');
          break;
        case 'video_summarization':
          const videoUrlToSummarize = voiceInputText || currentUrlVal;
          if (!videoUrlToSummarize) throw new Error("No video URL provided for summarization.");
          aiResponse = await summarizeVideo({ videoUrl: videoUrlToSummarize });
          responseType = 'video_summary';
          addMessageToConversation(activeConversationId, aiResponse.summary, 'ai', responseType, undefined, 'video_summarization');
          break;
        case 'url_analysis':
           const urlToAnalyze = voiceInputText || currentUrlVal;
           if (!urlToAnalyze) throw new Error("No URL provided for analysis.");
           aiResponse = await generateAiChatResponse({ prompt: `Summarize and analyze the content of this URL: ${urlToAnalyze}. ${!voiceInputText && currentInputVal ? `Specific focus: ${currentInputVal}` : ''}`, url: urlToAnalyze });
           responseType = 'url_analysis';
           addMessageToConversation(activeConversationId, aiResponse.response, 'ai', responseType, undefined, 'url_analysis');
          break;
        default:
          throw new Error("Invalid feature selected.");
      }
    } catch (error: any) {
      console.error("AI Error:", error);
      let detailedErrorMessage = error.message || "An error occurred while processing your request.";
      if (error.cause && typeof error.cause === 'object' && error.cause.message) {
        detailedErrorMessage += ` Cause: ${error.cause.message}`;
      } else if (typeof error.cause === 'string') {
         detailedErrorMessage += ` Cause: ${error.cause}`;
      }
      addMessageToConversation(activeConversationId, detailedErrorMessage, 'ai', 'error', undefined, currentFeature);
      toast({ title: "Error", description: detailedErrorMessage, variant: "destructive" });
    } finally {
      setIsLoading(false);
      // File state already cleared above
    }
  };


  const handleMicUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
        const audioFile = event.target.files[0];
        if (!audioFile.type.startsWith("audio/")) {
            toast({ title: "Invalid File", description: "Please upload an audio file for voice input.", variant: "destructive" });
            if (micInputRef.current) micInputRef.current.value = "";
            return;
        }
        setIsLoading(true);
        toast({ title: "Processing Voice Input", description: "Transcribing your audio..." });
        try {
            const audioDataUri = await readFileAsDataURL(audioFile);
            const transcriptionResponse = await transcribeAudio({ audioDataUri });
            const transcribedText = transcriptionResponse.transcription;
            
            if (transcribedText) {
                // Directly submit this transcription as input for the current feature
                await handleSubmit(undefined, transcribedText);
            } else {
                toast({ title: "Transcription Failed", description: "Could not understand audio.", variant: "destructive" });
            }
        } catch (error: any) {
            console.error("Voice input transcription error:", error);
            toast({ title: "Voice Input Error", description: error.message || "Failed to transcribe audio.", variant: "destructive" });
        } finally {
            setIsLoading(false);
            if (micInputRef.current) micInputRef.current.value = "";
        }
    }
  };


  const copyToClipboard = (text: string) => {
      navigator.clipboard.writeText(text);
      toast({ title: "Copied!", description: "Content copied to clipboard." });
  };

  const readFileAsDataURL = (fileToRead: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(fileToRead);
    });
  };

  const handleStartNewConversation = (feature: AiFeature) => {
    const newConversationId = `${feature}-${Date.now()}`;
    const newConversationName = `${featureConfig[feature].name} ${conversations.filter(c => c.feature === feature).length + 1}`;
    const newConversation: Conversation = {
      id: newConversationId,
      name: newConversationName,
      messages: [{ id: `msg-init-${newConversationId}`, text: `Starting new ${featureConfig[feature].name} session. ${featureConfig[feature].placeholder}`, sender: 'ai', timestamp: new Date(), feature }],
      feature: feature,
      timestamp: new Date(),
    };
    setConversations(prev => [newConversation, ...prev.sort((a,b) => b.timestamp.getTime() - a.timestamp.getTime())]);
    setActiveConversationId(newConversationId);
    if (typeof window !== 'undefined' && window.innerWidth < 768) setSidebarOpen(false);
  };
  
  const handleDeleteConversation = (convoId: string) => {
    setConversations(prev => prev.filter(c => c.id !== convoId));
    if (activeConversationId === convoId) {
      const remainingConversations = conversations.filter(c => c.id !== convoId).sort((a,b) => b.timestamp.getTime() - a.timestamp.getTime());
      setActiveConversationId(remainingConversations.length > 0 ? remainingConversations[0].id : null);
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
            <ScrollArea className="max-h-[60vh] p-0">
              <pre className="p-3 m-0 whitespace-pre text-sm leading-relaxed">
                <code className={`language-${language} hljs`} dangerouslySetInnerHTML={{ __html: highlightedCode }} />
              </pre>
            </ScrollArea>
          </div>
        );
      } catch (error) {
        console.error("Highlighting error:", error);
        parts.push(
          <pre key={`code-error-${match.index}`} className="p-3 m-0 whitespace-pre text-sm bg-muted/50 rounded-md my-2 overflow-x-auto">
            <code>{code}</code>
          </pre>
        );
      }
      lastIndex = match.index + fullMatch.length;
    }
  
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }
    
    return parts.length > 0 ? parts : [text]; 
  };


  const renderMessageContent = (message: Message) => {
    if (message.sender === 'user' && message.data?.fileType === 'image' && message.data.dataUri) {
        return (
            <div className="space-y-1">
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.text}</p>
                <img src={message.data.dataUri} alt={message.data.fileName || "uploaded image"} className="rounded-md max-h-48 my-1 border border-border/50" data-ai-hint="user upload" />
            </div>
        );
    }
    if (message.sender === 'user' && message.data?.fileType === 'audio' && message.data.dataUri) {
        return (
            <div className="space-y-1">
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.text}</p>
                <audio controls src={message.data.dataUri} className="w-full h-10 my-1">Your browser does not support the audio element.</audio>
            </div>
        );
    }

    if (message.type === 'code' && message.data?.code) { 
      const language = getLanguageForHighlighting(message.data.language);
      // Ensure code is a string and remove markdown backticks
      const codeToHighlight = String(message.data.code).replace(/^```(\w+)?\n|```$/g, '');
      
      try {
        const highlightedCode = hljs.highlight(codeToHighlight, { language, ignoreIllegals: true }).value;
        return (
          <div className="code-block relative bg-black/80 rounded-md shadow-inner my-1 w-full overflow-x-auto">
            <div className="flex justify-between items-center px-3 py-1.5 bg-muted/30 border-b border-border/50 rounded-t-md">
              <span className="text-xs text-muted-foreground capitalize">{language}</span>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyToClipboard(codeToHighlight)}>
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
      } catch (e) {
         console.error("Highlighting error for type 'code':", e);
         return <pre className="p-3 m-0 whitespace-pre text-sm bg-muted/50 rounded-md my-1 overflow-x-auto"><code>{codeToHighlight}</code></pre>;
      }
    }
    if (message.sender === 'ai' && (message.type === 'text' || message.type === 'code_explanation' || message.type === 'url_analysis' || message.type === 'video_summary' || message.type === 'audio_transcription')) {
      const contentParts = parseAndHighlight(message.text, message.data?.language);
      return <div className="text-sm whitespace-pre-wrap leading-relaxed">{contentParts.map((part, i) => <React.Fragment key={i}>{part}</React.Fragment>)}</div>;
    }
    if (message.type === 'image_analysis' && message.data?.imageUrl && message.sender === 'ai') {
      const descriptionParts = parseAndHighlight(message.text);
      return (
        <div className="space-y-2">
          <img src={message.data.imageUrl} alt="Analyzed content" className="rounded-md max-h-64 my-1 border border-border/50" data-ai-hint="analysis preview" />
          <div className="text-sm mt-1 whitespace-pre-wrap">{descriptionParts.map((part, i) => <React.Fragment key={i}>{part}</React.Fragment>)}</div>
        </div>
      );
    }
    return <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.text}</p>;
  };

  return (
    <div className="flex h-full border border-border/50 rounded-lg overflow-hidden shadow-xl bg-muted/20">
      <div className={cn(
        "bg-background/80 backdrop-blur-sm transition-all duration-300 ease-in-out flex flex-col border-r border-border/50",
        sidebarOpen ? "w-64 p-2" : "w-0 p-0 opacity-0 md:w-16 md:p-1 md:opacity-100" 
      )}>
        {sidebarOpen ? (
          <>
            <div className="flex justify-between items-center mb-2 p-1">
              <h2 className="text-md font-orbitron text-primary">Conversations</h2>
              <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)} className="md:hidden h-7 w-7">
                <SidebarClose className="h-4 w-4" />
              </Button>
            </div>
            <Select onValueChange={(value) => handleStartNewConversation(value as AiFeature)}>
              <SelectTrigger className="w-full h-9 mb-2 glassmorphic focus:ring-primary/50 text-xs">
                <Plus className="h-3.5 w-3.5 mr-1.5" /> New Chat
              </SelectTrigger>
              <SelectContent>
                {Object.entries(featureConfig).map(([key, { icon: IconComponent, name }]) => (
                  <SelectItem key={key} value={key} className="text-xs py-1.5">
                    <div className="flex items-center gap-1.5">
                      <IconComponent className="h-3.5 w-3.5" /> {name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <ScrollArea className="flex-grow -mr-1 pr-1">
              <div className="space-y-1">
              {conversations.map(convo => (
                <ConversationListItem
                  key={convo.id}
                  convo={convo}
                  isActive={activeConversationId === convo.id}
                  onClick={() => {
                    setActiveConversationId(convo.id);
                    if (typeof window !== 'undefined' && window.innerWidth < 768) setSidebarOpen(false);
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
          <div className="flex flex-col items-center space-y-2 mt-1">
             <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)} title="Open Sidebar" className="h-8 w-8">
                <Menu className="h-4 w-4" />
              </Button>
            {Object.entries(featureConfig).map(([key, { icon: IconComponent, name }]) => (
                <Button key={key} variant="ghost" size="icon" onClick={() => handleStartNewConversation(key as AiFeature)} title={`New ${name} Chat`} className="h-8 w-8">
                    <IconComponent className="h-4 w-4"/>
                </Button>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col bg-background overflow-hidden">
        <header className="p-2 border-b border-border/50 flex items-center justify-between bg-muted/30 h-12 shrink-0">
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)} className={cn(sidebarOpen && "md:hidden", "h-8 w-8")}>
                {sidebarOpen ? <CircleArrowLeft className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          <div className="flex items-center gap-1.5">
            {activeConversation && <CurrentFeatureIcon className="h-5 w-5 text-primary" />}
            <h2 className="text-md font-orbitron text-primary truncate">
              {activeConversation ? activeConversation.name : "ERIMTECH AI"}
            </h2>
          </div>
          <Select value={currentFeature} onValueChange={(value) => handleStartNewConversation(value as AiFeature)}>
            <SelectTrigger className="w-auto md:w-[180px] h-8 text-xs glassmorphic focus:ring-primary/50 px-2">
              <div className="flex items-center gap-1"> <CurrentFeatureIcon className="h-3.5 w-3.5"/> <span className="hidden md:inline truncate">{currentFeatureDetails.name}</span></div>
            </SelectTrigger>
            <SelectContent>
              {Object.entries(featureConfig).map(([key, { icon: IconComponent, name }]) => (
                <SelectItem key={key} value={key} className="text-xs py-1.5">
                  <div className="flex items-center gap-1.5">
                    <IconComponent className="h-3.5 w-3.5"/> {name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </header>

        <ScrollArea className="flex-1 p-3 space-y-3" ref={scrollAreaRef}> 
          {(!activeConversation || activeConversation.messages.length === 0) && !isLoading && (
             <div className="flex flex-col items-center justify-center h-full text-center p-4">
              <div className="p-6 bg-muted/50 rounded-full mb-4 animate-pulse">
                <Avatar className="h-16 w-16 text-primary">
                  <AvatarImage src={ERIMTECH_LOGO_URL} alt="AI Avatar" />
                  <AvatarFallback><Bot className="h-8 w-8"/></AvatarFallback>
                </Avatar>
              </div>
              <h2 className="text-xl font-orbitron mb-1.5">Welcome to ERIMTECH AI</h2>
              <p className="text-muted-foreground text-sm max-w-sm">
                Select a feature or start a new chat from the sidebar to begin. 
              </p>
            </div>
          )}
          {activeConversation?.messages.map(message => (
            <div key={message.id} className={`flex flex-col mb-2 items-stretch ${message.sender === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={cn(
                  "flex items-start gap-2 w-full", 
                  message.sender === 'user' ? 'justify-end' : 'justify-start'
                )}>
                {message.sender === 'ai' && (
                  <Avatar className="h-7 w-7 shrink-0"> 
                    <AvatarImage src={ERIMTECH_LOGO_URL} alt="AI Avatar" />
                    <AvatarFallback><Bot className="h-4 w-4"/></AvatarFallback>
                  </Avatar>
                )}
                <div 
                  className={cn(
                    "p-2.5 rounded-lg shadow-md relative max-w-[85%] md:max-w-[75%] overflow-hidden", 
                    message.sender === 'user' ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-muted text-foreground rounded-bl-none',
                     (message.type === 'code' || (message.text && message.text.includes("```")) || message.type === 'image_analysis' || (message.data?.fileType === 'image' || message.data?.fileType === 'audio') ) ? 'w-full break-words' : 'w-auto' 
                  )}
                >
                  {message.type === 'error' && <AlertTriangle className="h-4 w-4 text-destructive inline mr-1 mb-0.5" />}
                  {renderMessageContent(message)}
                  <p className="text-xs text-muted-foreground/70 mt-1 text-right"> 
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                {message.sender === 'user' && (
                  <Avatar className="h-7 w-7 shrink-0"> 
                    <AvatarImage src="" alt="User Avatar"/>
                    <AvatarFallback><User className="h-4 w-4"/></AvatarFallback>
                  </Avatar>
                )}
              </div>
            </div>
          ))}
          {isLoading && activeConversationId && (
            <div className="flex items-start gap-2 max-w-[85%] md:max-w-[75%]">
              <Avatar className="h-7 w-7 shrink-0">
                <AvatarImage src={ERIMTECH_LOGO_URL} alt="AI Avatar" />
                <AvatarFallback><Bot className="h-4 w-4"/></AvatarFallback>
              </Avatar>
              <div className="p-2.5 rounded-lg shadow-md bg-muted text-foreground rounded-bl-none flex items-center space-x-1.5">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                <p className="text-xs text-muted-foreground">ERIMTECH AI is thinking...</p> 
              </div>
            </div>
          )}
        </ScrollArea>

        <footer className="p-2 border-t border-border/50 bg-muted/30 shrink-0"> 
          <form onSubmit={handleSubmit} className="space-y-1.5"> 
            {currentFeatureDetails.requiresCodeInput && (
              <div className="grid grid-cols-[1fr_auto] gap-1.5 items-end">
                <Textarea
                  id="codeInput"
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value)}
                  placeholder={currentFeatureDetails.placeholder}
                  className="min-h-[60px] max-h-[150px] text-xs glassmorphic focus:ring-primary/50 resize-y py-1.5 px-2" 
                  disabled={isLoading || !activeConversationId}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey && !isLoading) { e.preventDefault(); handleSubmit(e);}}}
                />
                <Select value={codeLanguage} onValueChange={setCodeLanguage} disabled={isLoading || !activeConversationId}>
                  <SelectTrigger className="w-auto md:w-[120px] h-9 text-xs glassmorphic focus:ring-primary/50 px-2"> 
                    <Code className="h-3 w-3 mr-1 text-muted-foreground" /> <span className="truncate">{codeLanguage}</span>
                  </SelectTrigger>
                  <SelectContent>
                    {['javascript', 'python', 'java', 'csharp', 'cpp', 'php', 'ruby', 'go', 'swift', 'typescript', 'html', 'css', 'json', 'bash', 'shell', 'plaintext', 'other'].map(lang => (
                      <SelectItem key={lang} value={lang} className="text-xs py-1">{lang}</SelectItem>
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
                    className="h-9 text-xs glassmorphic focus:ring-primary/50 px-2" 
                    disabled={isLoading || !activeConversationId}
                />
            )}
            
            <div className="flex items-end space-x-1.5"> 
              {currentFeatureDetails.requiresFileUpload && (
                <>
                  <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept={currentFeatureDetails.acceptedFileTypes || '*/*'} disabled={!activeConversationId} />
                  <Button type="button" variant="outline" size="icon" onClick={() => fileInputRef.current?.click()} disabled={isLoading || !activeConversationId} className="h-9 w-9 glassmorphic focus:ring-primary/50 hover:bg-primary/10">
                    <Paperclip className="h-3.5 w-3.5" />
                    <span className="sr-only">Attach file</span>
                  </Button>
                </>
              )}
               {/* Mic Button for voice input - uses audio_transcription internally */}
               <>
                  <input type="file" ref={micInputRef} onChange={handleMicUpload} className="hidden" accept="audio/*" disabled={!activeConversationId || isLoading} />
                  <Button type="button" variant="outline" size="icon" onClick={() => micInputRef.current?.click()} disabled={isLoading || !activeConversationId} className="h-9 w-9 glassmorphic focus:ring-primary/50 hover:bg-primary/10">
                    <Mic className="h-3.5 w-3.5" />
                    <span className="sr-only">Use microphone</span>
                  </Button>
                </>


              {currentFeatureDetails.inputType === 'textarea' && !currentFeatureDetails.requiresCodeInput && (
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={currentFeatureDetails.placeholder}
                  className="flex-grow min-h-[36px] max-h-[120px] text-xs glassmorphic focus:ring-primary/50 resize-y py-1.5 px-2" 
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
                  className="flex-grow h-9 text-xs glassmorphic focus:ring-primary/50 px-2" 
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
                      className="flex-grow h-9 text-xs glassmorphic focus:ring-primary/50 px-2" 
                      disabled={isLoading || !activeConversationId}
                      onKeyDown={(e) => { if (e.key === 'Enter' && !isLoading) { e.preventDefault(); handleSubmit(e);}}}
                  />
              )}


              <Button type="submit" size="icon" disabled={isLoading || (!input && !file && !urlInput && !codeInput) || !activeConversationId} className="h-9 w-9 bg-primary hover:bg-primary/90 disabled:bg-muted">
                {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                <span className="sr-only">Send</span>
              </Button>
            </div>
            {file && <p className="text-xs text-muted-foreground pt-0.5">Selected: {file.name}</p>} 
          </form>
        </footer>
      </div>
    </div>
  );
}
