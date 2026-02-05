import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

interface CodeDisplayProps {
  code: string;
  expiresAt: number;
}

export function CodeDisplay({ code, expiresAt }: CodeDisplayProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  // Format code into groups (e.g., 123-456)
  const formattedCode = code.match(/.{1,3}/g)?.join("-") || code;
  const digits = code.split("");

  useEffect(() => {
    const updateTime = () => {
      const now = Date.now();
      const diff = Math.max(0, Math.ceil((expiresAt - now) / 1000));
      setTimeLeft(diff);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(formattedCode);
    setCopied(true);
    toast({
      title: "Copied!",
      description: "Pairing code copied to clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  // Calculate progress percentage (assuming max 60s for pairing codes usually)
  const progress = Math.min(100, (timeLeft / 60) * 100);
  
  // Progress color based on urgency
  const progressColor = timeLeft < 10 ? "bg-red-500" : timeLeft < 30 ? "bg-amber-500" : "bg-primary";

  if (timeLeft === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center p-8 rounded-2xl bg-destructive/10 border border-destructive/20"
      >
        <p className="text-destructive font-semibold text-lg mb-2">Code Expired</p>
        <p className="text-muted-foreground">Please request a new code from your bot.</p>
      </motion.div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-8">
      <div className="relative">
        {/* Glow effect */}
        <div className="absolute -inset-4 bg-primary/20 blur-3xl rounded-full opacity-50 animate-pulse" />
        
        <div className="relative flex justify-center gap-2 md:gap-4">
          <AnimatePresence mode="wait">
            {digits.map((digit, i) => (
              <motion.div
                key={`${i}-${digit}`}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: i * 0.1, type: "spring", stiffness: 300 }}
                className="code-digit"
              >
                {digit}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between text-sm font-medium text-muted-foreground px-1">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>Expires in {timeLeft}s</span>
          </div>
          <span>WhatsApp Web</span>
        </div>
        
        <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
          <motion.div 
            className={`h-full ${progressColor}`}
            initial={{ width: "100%" }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: "linear" }}
          />
        </div>
      </div>

      <Button 
        variant="outline" 
        size="lg" 
        className="w-full border-primary/20 hover:bg-primary/10 hover:text-primary hover:border-primary/50 transition-all group"
        onClick={copyToClipboard}
      >
        {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />}
        {copied ? "Copied to Clipboard" : "Copy Code"}
      </Button>
    </div>
  );
}
