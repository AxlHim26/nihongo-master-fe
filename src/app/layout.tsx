import "./globals.css";

import type { Metadata } from "next";
import { Roboto } from "next/font/google";

import Providers from "@/app/providers";
import ThemeScript from "@/shared/components/theme/theme-script";
const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-roboto",
});

export const metadata: Metadata = {
  title: {
    default: "MiraiGo",
    template: "%s | MiraiGo",
  },
  description: "Nền tảng học ngữ pháp tiếng Nhật với trải nghiệm cao cấp.",
  metadataBase: new URL(process.env["NEXT_PUBLIC_APP_URL"] ?? "http://localhost:3000"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className={`${roboto.variable} antialiased`} suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
