"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  async function logout() {
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
