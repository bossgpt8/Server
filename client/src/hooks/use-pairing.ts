import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { z } from "zod";

// Validated response type for safety
const PairingResponseSchema = api.pairing.get.responses[200];

export function usePairingCode(botId: string | null) {
  return useQuery({
    queryKey: [api.pairing.get.path, botId],
    queryFn: async () => {
      if (!botId) return null;
      
      const url = buildUrl(api.pairing.get.path, { botId });
      const res = await fetch(url);
      
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch pairing code");
      
      const data = await res.json();
      return PairingResponseSchema.parse(data);
    },
    enabled: !!botId,
    refetchInterval: (query) => {
      // Poll every second if we have a valid code to update UI/check expiration
      // Stop polling if expired or error
      return query.state.data ? 1000 : false;
    },
  });
}

// Admin hooks
export function useSessions() {
  return useQuery({
    queryKey: [api.sessions.list.path],
    queryFn: async () => {
      const res = await fetch(api.sessions.list.path);
      if (!res.ok) throw new Error("Failed to fetch sessions");
      return api.sessions.list.responses[200].parse(await res.json());
    },
  });
}

export function useDeleteSession() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (botId: string) => {
      const url = buildUrl(api.sessions.delete.path, { botId });
      const res = await fetch(url, { method: api.sessions.delete.method });
      
      if (!res.ok) {
        if (res.status === 404) throw new Error("Session not found");
        throw new Error("Failed to delete session");
      }
      
      return api.sessions.delete.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.sessions.list.path] });
    },
  });
}
