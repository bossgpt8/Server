import { useSessions, useDeleteSession } from "@/hooks/use-pairing";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader2, Server, Trash2, ShieldCheck, Wifi } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

export default function Admin() {
  const { data: sessions, isLoading, error } = useSessions();
  const deleteSession = useDeleteSession();
  const { toast } = useToast();

  const handleDelete = async (botId: string) => {
    try {
      await deleteSession.mutateAsync(botId);
      toast({
        title: "Session Deleted",
        description: `Session for ${botId} has been removed. The bot will need to re-pair.`,
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete session. Please try again.",
      });
    }
  };

  return (
    <div className="min-h-screen pt-24 px-4 pb-12">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
              Active Sessions
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage connected WhatsApp bot sessions
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-white/5 text-sm font-medium text-muted-foreground">
            <Wifi className="w-4 h-4 text-green-500" />
            <span>Server Online</span>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="p-8 rounded-2xl bg-destructive/10 border border-destructive/20 text-center">
            <p className="text-destructive font-semibold">Failed to load sessions</p>
            <p className="text-muted-foreground text-sm mt-1">{(error as Error).message}</p>
          </div>
        ) : sessions?.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-white/10 rounded-3xl bg-secondary/20">
            <Server className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-xl font-medium text-foreground">No Active Sessions</h3>
            <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
              No bots have authenticated yet. Sessions will appear here once bots successfully pair.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sessions?.map((botId) => (
              <SessionCard 
                key={botId} 
                botId={botId} 
                onDelete={() => handleDelete(botId)} 
                isDeleting={deleteSession.isPending && deleteSession.variables === botId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SessionCard({ botId, onDelete, isDeleting }: { botId: string, onDelete: () => void, isDeleting: boolean }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
    >
      <Card className="glass-card p-6 rounded-2xl group hover:border-primary/30 transition-colors">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg shadow-primary/20">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-mono text-lg font-bold text-foreground">{botId}</h3>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs text-muted-foreground font-medium">Active</span>
              </div>
            </div>
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 -mr-2"
                disabled={isDeleting}
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-secondary border-border">
              <AlertDialogHeader>
                <AlertDialogTitle>Disconnect Bot?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete the session for <span className="font-mono text-foreground">{botId}</span>. 
                  The bot will stop working and require re-pairing.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-transparent border-white/10 hover:bg-white/5 hover:text-foreground">Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Disconnect
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        
        <div className="mt-6 pt-6 border-t border-white/5 flex justify-between items-center text-xs text-muted-foreground">
          <span>Auth Type: Baileys JSON</span>
          <span>Encrypted Storage</span>
        </div>
      </Card>
    </motion.div>
  );
}
