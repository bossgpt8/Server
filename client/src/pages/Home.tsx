import { useState } from "react";
import { usePairingCode } from "@/hooks/use-pairing";
import { CodeDisplay } from "@/components/CodeDisplay";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loader2, Search, Smartphone } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const [botIdInput, setBotIdInput] = useState("");
  const [activeBotId, setActiveBotId] = useState<string | null>(null);
  
  const { data, isLoading, error, refetch } = usePairingCode(activeBotId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (botIdInput.trim()) {
      setActiveBotId(botIdInput.trim());
    }
  };

  const isCodeValid = data && Date.now() < data.expiresAt;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[100px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <div className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/10 shadow-lg shadow-primary/5 mb-4">
            <Smartphone className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
            WhatsApp Pairing
          </h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Connect your bot securely using official Baileys pairing codes.
          </p>
        </div>

        <Card className="glass-card p-6 md:p-8 rounded-3xl overflow-hidden relative">
          {!isCodeValid ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="botId" className="text-sm font-medium text-muted-foreground ml-1">
                  Enter Bot Identifier
                </label>
                <div className="relative group">
                  <Input
                    id="botId"
                    value={botIdInput}
                    onChange={(e) => setBotIdInput(e.target.value)}
                    placeholder="e.g. my-bot-1"
                    className="input-modern pl-11 h-14 text-lg"
                    autoComplete="off"
                    autoFocus
                  />
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                </div>
              </div>

              <Button 
                type="submit" 
                size="lg" 
                className="w-full h-14 text-lg font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all"
                disabled={isLoading || !botIdInput.trim()}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Checking...
                  </>
                ) : (
                  "Find Pairing Code"
                )}
              </Button>

              {activeBotId && !isLoading && !data && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 text-center"
                >
                  <p className="text-destructive font-medium">No active code found</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Make sure the bot sent a code within the last 60 seconds.
                  </p>
                  <Button 
                    variant="link" 
                    size="sm" 
                    onClick={() => refetch()} 
                    className="mt-2 h-auto p-0 text-destructive hover:text-destructive/80"
                  >
                    Try Again
                  </Button>
                </motion.div>
              )}
            </form>
          ) : (
            <div className="space-y-8">
              <div className="flex items-center justify-between mb-8">
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold text-foreground">Pairing Code</h3>
                  <p className="text-sm text-muted-foreground">Bot: <span className="font-mono text-primary">{activeBotId}</span></p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setActiveBotId(null)}>
                  Check Another
                </Button>
              </div>

              <CodeDisplay code={data.code} expiresAt={data.expiresAt} />
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
}
