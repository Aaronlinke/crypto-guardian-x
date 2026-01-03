import { useState, useRef, useEffect } from "react";
import { Bot, Send, Trash2, Sparkles, Brain, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/research-ai`;

export function ResearchAIChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    let assistantContent = "";

    try {
      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Fehler bei der Anfrage");
      }

      if (!response.body) throw new Error("Kein Response Body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      const upsertAssistant = (chunk: string) => {
        assistantContent += chunk;
        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant") {
            return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantContent } : m));
          }
          return [...prev, { role: "assistant", content: assistantContent }];
        });
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) upsertAssistant(content);
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }

      // Flush remaining buffer
      if (buffer.trim()) {
        for (let raw of buffer.split("\n")) {
          if (!raw || raw.startsWith(":") || raw.trim() === "") continue;
          if (!raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) upsertAssistant(content);
          } catch { /* ignore */ }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: error instanceof Error ? error.message : "Unbekannter Fehler",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    toast({ title: "Chat gelöscht" });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-mono flex items-center gap-2">
          <Brain className="w-4 h-4 text-destructive" />
          <span className="text-primary">[</span>
          NEXUS · FORSCHUNGS-KI
          <span className="text-primary">]</span>
          <Badge variant="outline" className="ml-auto text-[10px] bg-destructive/10 text-destructive border-destructive/30">
            EXPERIMENTELL
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Warning */}
        <div className="p-2 rounded bg-destructive/10 border border-destructive/30 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
          <div className="text-[10px] text-destructive/80">
            Gedankenexperiment: Diese KI hat Zugriff auf alle wissenschaftlichen Tools. 
            Unzensierte Forschungsdiskussionen. Nur für wissenschaftliche Zwecke.
          </div>
        </div>

        {/* Chat Messages */}
        <ScrollArea className="h-[300px] pr-2" ref={scrollRef}>
          <div className="space-y-3">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground text-xs py-8">
                <Sparkles className="w-8 h-8 mx-auto mb-2 text-primary/50" />
                <p>Frage mich über ECDSA, SAT-Solver, Chaos-Theorie,</p>
                <p>SHA-256, OMNIGENESIS oder Blockchain-Analyse.</p>
              </div>
            )}
            
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="w-6 h-6 rounded-full bg-destructive/20 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-3 h-3 text-destructive" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] p-2 rounded-lg text-xs ${
                    msg.role === "user"
                      ? "bg-primary/20 text-foreground"
                      : "bg-muted/50 text-foreground"
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                </div>
              </div>
            ))}
            
            {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
              <div className="flex gap-2">
                <div className="w-6 h-6 rounded-full bg-destructive/20 flex items-center justify-center">
                  <Bot className="w-3 h-3 text-destructive animate-pulse" />
                </div>
                <div className="bg-muted/50 p-2 rounded-lg">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-destructive animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 rounded-full bg-destructive animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 rounded-full bg-destructive animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Frage stellen... (Enter zum Senden)"
            className="min-h-[60px] text-xs resize-none"
            disabled={isLoading}
          />
        </div>
        
        {/* Actions */}
        <div className="flex gap-2">
          <Button
            size="sm"
            className="flex-1 gap-2"
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
          >
            <Send className="w-3 h-3" />
            Senden
          </Button>
          <Button size="sm" variant="outline" onClick={clearChat}>
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
