import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Page } from "@arbetsmarknad/components/Page";
import { HeaderMenu } from "@arbetsmarknad/components/HeaderMenu";
import { Footer } from "@arbetsmarknad/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: `Arbetsmiljö ${process.env.NEXT_PUBLIC_YEAR}`,
  description: "Statistik om arbetsmiljön",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Page>
          <HeaderMenu
            canonicalUrl="https://arbetsmiljo.codeberg.page"
            deploymentUrl="https://arbetsmiljo.codeberg.page"
          />
          {children}
          <Footer
            sourceCode={[
              `arbetsmiljo/${process.env.NEXT_PUBLIC_YEAR}`,
              "arbetsmiljo/autoindex",
              "arbetsmarknad/components",
            ]}
          />
        </Page>
      </body>
    </html>
  );
}
