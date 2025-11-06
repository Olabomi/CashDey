"use client";

import Link from "next/link";
import { Crown } from "lucide-react";

export default function PremiumBanner() {
  return (
    <div className="bg-gradient-to-r from-palm-gold to-yellow-500 rounded-2xl p-6 text-white relative overflow-hidden mb-6">
      <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-4 -mt-4"></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold">Upgrade to CashDey+</h3>
          <Crown className="text-2xl" />
        </div>
        
        <p className="text-white/90 text-sm mb-4">
          Get unlimited coach insights, advanced analytics, and premium features for just ₦2,999/month
        </p>
        
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/subscription">
            <button className="bg-white text-palm-gold px-4 py-2 rounded-xl font-semibold text-sm hover:bg-white/90 transition-colors">
              Upgrade Now
            </button>
          </Link>
          <Link href="/dashboard/subscription">
            <button className="text-white/80 text-sm underline hover:text-white transition-colors">
              Learn More
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

