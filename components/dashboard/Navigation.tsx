"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MessageCircle, Wallet, Compass, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/dashboard/coach", label: "Coach", icon: MessageCircle },
  { href: "/dashboard/wallet", label: "Wallet", icon: Wallet },
  { href: "/dashboard/explore", label: "Explore", icon: Compass },
  { href: "/dashboard/profile", label: "Profile", icon: User },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-sm bg-white border-t border-gray-100 px-4 py-2 z-50">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || 
            (item.href === "/dashboard" && pathname === "/dashboard");
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center space-y-1 py-2 px-3 rounded-2xl transition-colors relative",
                isActive
                  ? "bg-naija-green/10 text-naija-green"
                  : "text-gray-400 hover:text-gray-600"
              )}
            >
              {isActive && (
                <div className="w-1 h-1 bg-naija-green rounded-full absolute -top-1"></div>
              )}
              <Icon className={cn("text-lg", isActive ? "text-naija-green" : "")} />
              <span className={cn("text-xs font-medium", isActive ? "text-naija-green" : "")}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

