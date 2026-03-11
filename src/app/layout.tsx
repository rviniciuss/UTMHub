import type { Metadata } from "next";
import "./globals.css";
import { CampaignProvider } from "@/context/CampaignContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import { LanguageProvider } from "@/context/LanguageContext";

export const metadata: Metadata = {
  title: "UTM Hub — Campaign Manager",
  description: "Organize e rastreie parâmetros de campanha por países e nichos.",
  keywords: ["UTM", "campaign manager", "digital marketing", "tracking"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider>
          <LanguageProvider>
            <CampaignProvider>
              {children}
            </CampaignProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
