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
    <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-sm bg-white/95 backdrop-blur-xl border-t border-gray-200/50 px-4 py-3 z-50 shadow-soft">
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
                "flex flex-col items-center space-y-1 py-2 px-4 rounded-2xl transition-all duration-300 relative group",
                isActive
                  ? "bg-gradient-to-br from-naija-green/15 to-eko-teal/10 text-naija-green"
                  : "text-gray-400 hover:text-gray-700 hover:bg-gray-50"
              )}
            >
              {isActive && (
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-naija-green rounded-full animate-scale-in"></div>
              )}
              <div className={cn(
                "transition-transform duration-300",
                isActive ? "scale-110" : "group-hover:scale-105"
              )}>
                <Icon className={cn(
                  "text-xl transition-colors duration-300",
                  isActive ? "text-naija-green" : "text-gray-400 group-hover:text-gray-700"
                )} />
              </div>
              <span className={cn(
                "text-xs font-semibold transition-colors duration-300",
                isActive ? "text-naija-green" : "text-gray-500 group-hover:text-gray-700"
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

