"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard,
  FileText,
  Palette,
  Paintbrush,
  Settings,
  LogOut,
  ChevronDown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Pesquisas",
    href: "/dashboard/surveys",
    icon: FileText,
  },
  {
    label: "Aparência",
    href: "/dashboard/appearance",
    icon: Paintbrush,
  },
  {
    label: "Temas",
    href: "/dashboard/themes",
    icon: Palette,
  },
];

const comingSoonItems: { label: string; icon: React.ElementType }[] = [];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <aside className="w-56 h-screen bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-gray-100">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="19" width="18" height="10" rx="3" fill="white"/>
              <rect x="28" y="8" width="17" height="10" rx="3" fill="white"/>
              <rect x="28" y="30" width="17" height="10" rx="3" fill="white" fillOpacity="0.55"/>
              <path d="M21 24 C24.5 24 24.5 13 28 13" stroke="white" strokeWidth="2" strokeOpacity="0.7"/>
              <path d="M21 24 C24.5 24 24.5 35 28 35" stroke="white" strokeWidth="2" strokeOpacity="0.4"/>
              <circle cx="21" cy="24" r="3" fill="white"/>
              <circle cx="28" cy="13" r="2.5" fill="white"/>
              <circle cx="28" cy="35" r="2.5" fill="white" fillOpacity="0.55"/>
            </svg>
          </div>
          <span className="text-sm font-bold text-gray-900">SurveyFlow</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
        {comingSoonItems.map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-300 cursor-not-allowed"
          >
            <item.icon className="w-4 h-4" />
            <span>{item.label}</span>
            <span className="ml-auto text-[10px] font-medium bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded">
              Em breve
            </span>
          </div>
        ))}
      </nav>

      {/* Settings */}
      <div className="px-3 pb-2">
        <Link
          href="/dashboard/settings"
          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            pathname === "/dashboard/settings"
              ? "bg-gray-100 text-gray-900"
              : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Configurações</span>
        </Link>
      </div>

      {/* User Section */}
      <div className="p-3 border-t border-gray-100">
        <DropdownMenu>
          <DropdownMenuTrigger className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors outline-none">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                {session?.user?.image ? (
                  <Image
                    src={session.user.image}
                    alt=""
                    width={32}
                    height={32}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <span className="text-xs font-medium text-gray-600">
                    {session?.user?.name ? getInitials(session.user.name) : "U"}
                  </span>
                )}
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {session?.user?.name || "Usuário"}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {session?.user?.email}
                </p>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-red-600 cursor-pointer text-xs"
            >
              <LogOut className="w-3.5 h-3.5 mr-2" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
