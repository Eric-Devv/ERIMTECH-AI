
"use client";

import { Inter, Orbitron } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/providers/theme-provider';
import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/providers/auth-provider';
// Removed useState and useEffect as they are no longer needed for isClient check

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const orbitron = Orbitron({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-orbitron',
});

// Metadata should be defined in a server component parent or page.tsx if this layout remains "use client".
// For now, it's commented out.
// export const metadata: Metadata = {
//   title: 'ERIMTECH AI - Futuristic AI Solutions',
//   description: 'Experience the future with ERIMTECH AI: Advanced Chat, Code Generation, Image Analysis, and more.',
//   icons: {
//     icon: "/logo.svg",
//   },
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Removed isClient state and useEffect

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${orbitron.variable} font-sans antialiased flex flex-col min-h-screen`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {/* AuthProvider and its children are now always rendered */}
          <AuthProvider>
            <div className="flex flex-col min-h-screen">
              <SiteHeader />
              <main className="flex-grow container mx-auto px-4 py-8">
                {children}
              </main>
              <SiteFooter />
            </div>
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
