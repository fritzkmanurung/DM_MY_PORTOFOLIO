import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Playfair_Display, Bricolage_Grotesque } from "next/font/google";
import { SmoothScroll } from "@/components/shared/smooth-scroll";
import { FramerProvider } from "@/components/shared/framer-provider";
import "./globals.css";


const fontSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontSerif = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
});

const fontDisplay = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "Portfolio",
  description: "My personal portfolio",
  icons: {
    icon: "/profile/favicon.webp",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fontSans.variable} ${fontSerif.variable} ${fontDisplay.variable} h-full antialiased dark`}
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://cdn.simpleicons.org" />
        <link rel="dns-prefetch" href="https://cdn.simpleicons.org" />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <FramerProvider>
          <SmoothScroll>
            {children}
          </SmoothScroll>
        </FramerProvider>
      </body>
    </html>
  );
}
