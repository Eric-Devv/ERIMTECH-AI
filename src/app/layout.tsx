import type { Metadata } from 'next';
import { Inter, Orbitron } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/providers/theme-provider';
import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/providers/auth-provider'; // Placeholder for AuthProvider

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const orbitron = Orbitron({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-orbitron',
});

export const metadata: Metadata = {
  title: 'ERIMTECH AI - Futuristic AI Solutions',
  description: 'Experience the future with ERIMTECH AI: Advanced Chat, Code Generation, Image Analysis, and more.',
  icons: {
    icon: "/logo.svg", // Assuming you will add a logo.svg in public folder
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${orbitron.variable} font-sans antialiased flex flex-col min-h-screen`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider> {/* Placeholder for AuthProvider */}
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
