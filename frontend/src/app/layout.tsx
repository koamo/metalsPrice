import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: 'Metals Price — Real-Time Gold, Silver, Platinum & Palladium Tracker',
    template: '%s | Metals Price',
  },
  description:
    '실시간 금·은·백금·팔라듐 현물 시세를 KRW·USD·JPY·CNY로 확인하세요. 그램·돈·온스 단위 계산기 제공. Check live precious metals spot prices in real time.',
  keywords: ['금시세', '은시세', '백금시세', '귀금속가격', 'gold price', 'silver price', 'platinum price', '금값', '실시간시세'],
  authors: [{ name: 'koamo' }],
  metadataBase: new URL('https://metalsprice.vercel.app'),
  openGraph: {
    title: 'Metals Price — 실시간 귀금속 시세 트래커',
    description: '금·은·백금·팔라듐 실시간 현물 시세 & 단위 계산기',
    url: 'https://metalsprice.vercel.app',
    siteName: 'Metals Price',
    locale: 'ko_KR',
    alternateLocale: ['en_US', 'ja_JP', 'zh_CN'],
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Metals Price — 실시간 귀금속 시세',
    description: '금·은·백금·팔라듐 실시간 현물 시세 & 단위 계산기',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: {
    canonical: 'https://metalsprice.vercel.app',
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
