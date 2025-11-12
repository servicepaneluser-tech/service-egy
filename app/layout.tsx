import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Service Egy API",
  description: "API Route for Service Egy Contact Form",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar">
      <body>{children}</body>
    </html>
  )
}

