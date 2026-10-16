import type { Metadata } from "next";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import TemaScript from "./tema/tema-script";
import ProveedorTema from "./tema/proveedor-tema";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Barbería Fercho", template: "%s | Barbería Fercho" },
  description: "Barbería Fercho: cortes, barba, precios y contacto.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className="h-full scroll-smooth" suppressHydrationWarning>
      <head>
        <TemaScript />
      </head>
      <body className="min-h-full bg-fondo font-sans text-texto antialiased">
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
          <ProveedorTema>{children}</ProveedorTema>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
