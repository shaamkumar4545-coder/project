import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Send, Bot, User, RefreshCw, Mic, MicOff, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { generateContent } from '../AI-Gemini-Assistant/gemini';
import { transactionService } from '../services/transactionService';
import axios from 'axios';
import { toast } from 'react-hot-toast';


export default function AIChat() {
    const user = JSON.parse(localStorage.getItem('user') || '{"id": "anonymous"}');
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([
        { id: 1, text: "Hello! I'm your AI Finance Assistant. You can ask me questions like 'How much did I spend this month?' or use voice to 'Log 50 for coffee'.", sender: 'bot' }
    ]);
    const [isTyping, setIsTyping] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const scrollRef = useRef(null);
    const recognitionRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async (e, directInput = null) => {
        if (e) e.preventDefault();
        const textToSend = directInput || input;
        if (!textToSend.trim()) return;

        const userMsg = { id: Date.now(), text: textToSend, sender: 'user' };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        try {
            // 1. Fetch Financial Context from Backend
            let context = "";
            try {
                const contextRes = await axios.get(`http://localhost:8081/api/ai/context/${user.id}`);
                context = contextRes.data.context;
            } catch (ctxErr) {
                console.warn("Could not fetch context, sending without it.");
            }

            // 2. Generate AI Response
            const botResponse = await generateContent(textToSend, context);
            
            // 3. Parse for Actions (JSON)
            let finalOutput = botResponse;
            const jsonMatch = botResponse.match(/\{[\s\S]*?\}/);
            
            if (jsonMatch) {
                try {
                    const jsonStr = jsonMatch[0];
                    const action = JSON.parse(jsonStr);
                    
                    // Remove the JSON block from the display text
                    finalOutput = botResponse.replace(/```json[\s\S]*?```|```[\s\S]*?```|\{[\s\S]*?\}/, '').trim();

                    if (action.action === 'LOG_TRANSACTION') {
                        await handleLogAction(action.data);
                    }
                } catch (parseErr) {
                    console.error("Action parsing failed", parseErr);
                }
            }

            setMessages(prev => [...prev, { id: Date.now() + 1, text: finalOutput, sender: 'bot' }]);
        } catch (error) {
            console.error("Failed to get AI response:", error);
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                text: "Sorry, I'm having trouble connecting to the AI service right now. Please try again later.",
                sender: 'bot'
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleLogAction = async (data) => {
        try {
            const txData = {
                ...data,
                userId: user.id,
                date: new Date().toISOString()
            };
            await transactionService.create(txData);
            toast.success(`Logged: ${data.title} (₹${data.amount})`, {
                icon: '💰',
                duration: 4000
            });
        } catch (err) {
            toast.error("Failed to auto-log transaction.");
        }
    };

    const startListening = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            toast.error("Speech recognition not supported in this browser.");
            return;
        }

        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onstart = () => setIsListening(true);
        recognitionRef.current.onend = () => setIsListening(false);
        recognitionRef.current.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setInput(transcript);
            handleSend(null, transcript);
        };

        recognitionRef.current.start();
    };

    const stopListening = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
    };

    const handleClear = () => {
        setMessages([{ id: 1, text: "Chat cleared. How can I help you now?", sender: 'bot' }]);
    };

    return (
        <div className="max-w-3xl mx-auto h-[calc(100vh-140px)] flex flex-col space-y-4 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold flex items-center gap-2 text-primary">
                    <Bot className="w-8 h-8" /> AI Assistant
                </h2>
                <Button variant="outline" size="sm" onClick={handleClear}>
                    <RefreshCw className="w-4 h-4 mr-2" /> Restart
                </Button>
            </div>

            <Card className="flex-1 flex flex-col overflow-hidden glass-card">
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={cn(
                                "flex w-full",
                                msg.sender === 'user' ? "justify-end" : "justify-start"
                            )}
                        >
                            <div
                                className={cn(
                                    "max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-sm",
                                    msg.sender === 'user'
                                        ? "bg-primary text-primary-foreground rounded-br-none"
                                        : "bg-muted text-foreground rounded-bl-none"
                                )}
                            >
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="flex justify-start">
                            <div className="bg-muted rounded-2xl rounded-bl-none px-4 py-3 flex gap-1 items-center">
                                <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>
                        </div>
                    )}
                </CardContent>
                <div className="p-4 bg-background/50 border-t backdrop-blur-sm">
                    <form onSubmit={handleSend} className="flex gap-2">
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask or say 'Log 50 for coffee'..."
                            className="flex-1 rounded-xl h-12"
                        />
                        <Button 
                            type="button"
                            variant={isListening ? "destructive" : "secondary"}
                            size="icon"
                            onClick={isListening ? stopListening : startListening}
                            className={cn("rounded-xl h-12 w-12", isListening && "animate-pulse")}
                        >
                            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                        </Button>
                        <Button type="submit" disabled={!input || isTyping} className="rounded-xl h-12 w-12">
                            <Send className="w-5 h-5" />
                        </Button>
                    </form>
                </div>
            </Card>
        </div>
    );
}
