import type { Metadata } from "next";
import Link from "next/link";
import BotonTema from "@/app/tema/boton-tema";
import LoginForm from "./login-form";

export const metadata: Metadata = { title: "Iniciar sesión" };

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-4 p-6">
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="rounded text-sm text-suave underline hover:text-texto focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acento"
        >
          Volver al inicio
        </Link>
        <BotonTema />
      </div>
      <div className="tarjeta">
        <LoginForm />
      </div>
    </main>
  );
}
