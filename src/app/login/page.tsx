import type { Metadata } from "next";
import LoginForm from "./login-form";

export const metadata: Metadata = { title: "Iniciar sesión" };

export default function LoginPage() {
  return (
    <main className="mx-auto max-w-sm p-6">
      <LoginForm />
    </main>
  );
}
