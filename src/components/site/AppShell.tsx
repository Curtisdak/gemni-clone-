"use client";

import type { CSSProperties } from "react";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sidebar } from "@/components/site/Sidebar";
import { Header } from "@/components/site/Header";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const pathname = usePathname();

  const disableMainScroll = useMemo(
    () => pathname?.startsWith("/chat"),
    [pathname],
  );
  const sidebarDocked = !isMobile && sidebarOpen;

  const shellStyle = useMemo(
    () =>
      ({
        "--sidebar-width": sidebarDocked ? "20rem" : "0px",
      }) as CSSProperties,
    [sidebarDocked],
  );

  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  function handleToggleSidebar() {
    setSidebarOpen((prev) => !prev);
  }

  function handleCloseSidebar() {
    setSidebarOpen(false);
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground transition-colors" style={shellStyle}>
      <Sidebar
        open={sidebarOpen}
        isMobile={isMobile}
        onClose={handleCloseSidebar}
        
      />
      <div
        className={cn(
          "flex flex-1 flex-col transition-[margin-left] duration-200",
          sidebarDocked && "md:ml-80",
          disableMainScroll ? "overflow-hidden" : "overflow-y-auto",
        )}
      >
        <Header
          onToggleSidebar={handleToggleSidebar}
          sidebarOpen={sidebarOpen}
          isMobile={isMobile}
        />
        <main
          className={cn(
            "flex-1 bg-background pt-14 transition-colors",
            disableMainScroll ? "overflow-hidden" : "overflow-y-auto",
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
