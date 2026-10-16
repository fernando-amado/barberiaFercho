import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Barbería Fercho", template: "%s | Barbería Fercho" },
  description: "Barbería Fercho: cortes, barba, precios y contacto.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className="h-full scroll-smooth">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
