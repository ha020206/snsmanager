import type { Metadata, Viewport } from 'next'
import './globals.css'
import { AuthProvider } from '@/components/AuthProvider'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#ffffff',
}

export const metadata: Metadata = {
  title: 'SNS 마케팅 도우미',
  description: '맞춤형 SNS 마케팅 자동화 - 브랜드 프로필, 콘텐츠 로드맵, 인사이트, CS 자동화',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'SNS 도우미',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko">
      <body className="min-h-screen font-sans">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
