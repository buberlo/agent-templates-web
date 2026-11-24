import { Geist, Geist_Mono } from "next/font/google";
import "@/app/globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { LocaleProvider } from "@/components/locale-provider";
import { getDictionary, type Locale } from "@/lib/i18n";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export function SiteLayout({ children, locale }: { children: React.ReactNode; locale: Locale }) {
  const dict = getDictionary(locale);

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen font-sans antialiased`}
      >
        <ThemeProvider>
          <LocaleProvider locale={locale} dict={dict}>
            <div className="flex min-h-screen flex-col">
              <a href="#main-content" className="button sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60]">{dict.common.skipContent}</a>
              <SiteHeader />
              <main id="main-content" tabIndex={-1} className="site-shell min-w-0 flex-1 py-8 sm:py-12">
                {children}
              </main>
              <SiteFooter />
            </div>
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}