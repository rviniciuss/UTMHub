import type { Metadata } from "next";
import "./globals.css";
import { CampaignProvider } from "@/context/CampaignContext";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: "UTM Hub — Campaign Manager",
  description: "Organize and track your campaign parameters across countries and niches.",
  keywords: ["UTM", "campaign manager", "digital marketing", "tracking"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider>
          <CampaignProvider>
            {children}
          </CampaignProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
