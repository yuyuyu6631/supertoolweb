import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";
import AppProviders from "@/src/app/components/AppProviders";
import RouteFeedback from "@/src/app/components/RouteFeedback";
import FloatingChatBot from "@/src/app/components/chat/FloatingChatBot";
import "./globals.css";

export const metadata: Metadata = {
  title: "星点评",
  description: "帮助用户发现、比较和选择 AI 工具的点评与发现平台。",
  icons: {
    icon: "/brand/logo.png",
    shortcut: "/brand/logo.png",
    apple: "/brand/logo.png",
  },
};

import { ViewTransitions } from "next-view-transitions";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <ViewTransitions>
      <html lang="zh-CN">
        <body>
          <svg aria-hidden="true" width="0" height="0" className="absolute pointer-events-none opacity-0">
            <defs>
              <filter id="glass-distortion" x="-20%" y="-20%" width="140%" height="140%">
                <feTurbulence type="fractalNoise" baseFrequency="0.012 0.018" numOctaves="2" seed="7" result="noise" />
                <feDisplacementMap in="SourceGraphic" in2="noise" scale="16" xChannelSelector="R" yChannelSelector="G" />
              </filter>
            </defs>
          </svg>
          <AppProviders>
            <Suspense fallback={null}>
              <RouteFeedback />
            </Suspense>
            {children}
          </AppProviders>
          <FloatingChatBot />
        </body>
      </html>
    </ViewTransitions>
  );
}
