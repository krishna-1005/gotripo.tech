import { ReactNode, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { YatraMaintenance } from "./YatraMaintenance";

interface YatraLayoutProps {
  children: ReactNode;
  isUnderMaintenance?: boolean;
}

export function YatraLayout({ children, isUnderMaintenance = true }: YatraLayoutProps) {
  if (isUnderMaintenance) {
    return <YatraMaintenance />;
  }

  return (
    <AppShell>
      <div className="min-h-screen bg-background text-foreground font-sans selection:bg-[#F4B740]/30 transition-colors duration-500">
        {children}
      </div>
    </AppShell>
  );
}
