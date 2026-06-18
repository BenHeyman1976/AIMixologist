import React, { createContext, useContext, useState } from "react";
import type { SessionUser } from "../types";

// Minimal in-memory session (resets on app reload — fine for the PoC).
// TODO(auth): persist with expo-secure-store and swap mock login for Supabase.
interface SessionCtx {
  user: SessionUser | null;
  setUser: (u: SessionUser | null) => void;
}

const Ctx = createContext<SessionCtx>({ user: null, setUser: () => {} });

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  return <Ctx.Provider value={{ user, setUser }}>{children}</Ctx.Provider>;
}

export const useSession = () => useContext(Ctx);
