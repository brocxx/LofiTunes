import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Noto_Serif } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-jakarta",
});

const noto = Noto_Serif({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-noto",
});

export const metadata: Metadata = {
  title: "LofiTunes — Late Night Bollywood Vibes",
  description:
    "A cozy, late-night Lofi Bollywood music player. Stream your YouTube Music playlists with beautiful lofi aesthetics.",
  keywords: ["lofi", "bollywood", "music", "player", "cozy", "late night"],
  openGraph: {
    title: "LofiTunes — Late Night Bollywood Vibes",
    description: "Your cozy late-night Lofi Bollywood music companion",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${jakarta.variable} ${noto.variable}`}>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
      </head>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

