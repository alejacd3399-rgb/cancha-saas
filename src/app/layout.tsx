import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cancha SaaS",
  description: "Sistema de gestión de reservas de canchas sintéticas",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}