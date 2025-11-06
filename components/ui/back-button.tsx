"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BackButtonProps {
  href?: string;
  label?: string;
  className?: string;
  variant?: "default" | "ghost" | "outline";
  onClick?: () => void;
}

export default function BackButton({ 
  href, 
  label = "Back", 
  className,
  variant = "ghost",
  onClick
}: BackButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (href) {
      router.push(href);
    } else {
      router.back();
    }
  };

  return (
    <Button
      variant={variant}
      onClick={handleClick}
      className={cn(
        "flex items-center gap-2 font-medium transition-all duration-200",
        className
      )}
    >
      <ArrowLeft className="w-4 h-4" />
      <span>{label}</span>
    </Button>
  );
}

