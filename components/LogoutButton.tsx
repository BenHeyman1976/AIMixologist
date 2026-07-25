"use client";

import { useRouter } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabase-browser";

export default function LogoutButton() {
  const router = useRouter();
  async function logout() {
    // Real auth: clear the Supabase session. Also clear the mock cookie so both
    // modes end up signed out.
    const supabase = getSupabaseBrowser();
    if (supabase) await supabase.auth.signOut();
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }
  return (
    <button
      onClick={logout}
      className="px-3 py-2 rounded-full hover:bg-white/70 text-cocktail-plum/70"
    >
      Log out
    </button>
  );
}
