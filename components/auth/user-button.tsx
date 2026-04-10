"use client";

import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";

export function UserButton() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") {
    return (
      <div className="h-9 w-9 rounded-full bg-gray-200 animate-pulse" />
    );
  }

  if (!session) {
    return (
      <Button
        onClick={() => router.push("/login")}
        variant="outline"
        size="sm"
      >
        Entrar
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        {session.user.image ? (
          <img
            src={session.user.image}
            alt={session.user.name || "User"}
            className="h-8 w-8 rounded-full"
          />
        ) : (
          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
            <User className="h-4 w-4 text-gray-500" />
          </div>
        )}
        <span className="text-sm font-medium text-gray-700 hidden sm:inline">
          {session.user.name}
        </span>
      </div>
      <Button
        onClick={() => signOut({ callbackUrl: "/" })}
        variant="ghost"
        size="sm"
        className="text-gray-500 hover:text-gray-700"
      >
        <LogOut className="h-4 w-4" />
      </Button>
    </div>
  );
}
