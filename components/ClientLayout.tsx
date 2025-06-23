"use client";

import { useAuth } from "@/app/context/AuthContext";
import Navigation from "@/components/navigation";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();

  return (
    <>
      {user && <Navigation />}
      {children}
    </>
  );
}
