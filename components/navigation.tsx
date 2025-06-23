"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { DollarSign } from "lucide-react";
import { usePathname } from "next/navigation";
import clsx from "clsx";

export default function Navigation() {
  const { logOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await logOut();
      router.push('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const links = [
    { href: "/", label: "Dashboard" },
    { href: "/transactions", label: "Transactions" },
    { href: "/categories", label: "Categories" },
    { href: "/accounts", label: "Accounts" },
    { href: "/reports", label: "Reports" },
  ];

  return (
    <nav className="flex items-center justify-between w-full px-8 py-4 border-b">
      <Link href="/" className="flex items-center space-x-2">
        <div className="bg-primary rounded-lg p-2">
          <DollarSign className="h-5 w-5 text-primary-foreground" />
        </div>
        <span className="font-bold text-xl">FinanceTracker</span>
      </Link>
      <ul className="flex gap-12">
        {links.map(({ href, label }) => (
          <li key={href}>
            <Link
              href={href}
              className={clsx(
                "transition-colors",
                pathname === href ? "text-primary font-semibold" : "text-muted-foreground hover:text-primary"
              )}
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
      <Button variant="destructive" onClick={handleLogout}>
        Logout
      </Button>
    </nav>
  );
}