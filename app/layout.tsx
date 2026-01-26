import type { Metadata } from "next";
import localFont from "next/font/local";
import { ThemeProvider } from "./components/theme-provider";
import { ConditionalLayout } from "./components/conditional-layout";
import "./globals.css";

const stixTwo = localFont({
  src: [
    {
      path: "../public/fonts/stix two/STIXTwoText-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/stix two/STIXTwoText-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/stix two/STIXTwoText-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
  ],
  variable: "--font-stix-two",
});

const acuminPro = localFont({
  src: [
    {
      path: "../public/fonts/acumin/Acumin-RPro.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/acumin/Acumin-BdPro.otf",
      weight: "500",
      style: "normal",
    },
  ],
  variable: "--font-acumin-pro",
});

export const metadata: Metadata = {
  title: "Hubfi",
  description: "Plataforma de gestão e análise para afiliados",
  icons: {
    icon: "/logo/logotipo-branco.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${stixTwo.variable} ${acuminPro.variable} font-sans antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
        >
          <ConditionalLayout>{children}</ConditionalLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}
