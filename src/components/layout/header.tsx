'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Leaf, Menu, LogIn, LogOut } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/map', label: 'Map', protected: true },
  { href: '/dashboard', label: 'Dashboard', protected: true },
  { href: '/insights', label: 'Analysis', protected: true },
  { href: '/climate', label: 'Climate' },
  { href: '/about', label: 'About' },
  { href: '/info', label: 'Info' },
];

function AuthButton() {
    const { user, isUserLoading } = useUser();
    const auth = useAuth();
    const router = useRouter();

    const handleLogout = async () => {
        if (auth) {
            await signOut(auth);
        }
        router.push('/');
    }

    if (isUserLoading) {
        return <Button variant="outline" size="sm" disabled>Loading...</Button>;
    }
    
    if (user) {
        return (
            <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
            </Button>
        );
    }

    return (
        <Button asChild variant="outline" size="sm">
            <Link href="/login">
                <LogIn className="mr-2 h-4 w-4" />
                Login / Signup
            </Link>
        </Button>
    )
}


export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isUserLoading } = useUser();

  const NavLink = ({ href, label, isProtected }: { href: string; label: string, isProtected?: boolean }) => {
    
    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        if (isProtected && !user && !isUserLoading) {
            e.preventDefault();
            router.push(`/login?redirect=${href}`);
        } else {
            setIsMobileMenuOpen(false);
        }
    }
    
    return (
        <Link
        href={href}
        className={cn(
            'text-sm font-medium transition-colors hover:text-primary',
            pathname === href ? 'text-primary' : 'text-muted-foreground'
        )}
        onClick={handleClick}
        >
        {label}
        </Link>
    );
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Leaf className="h-6 w-6 text-primary" />
          <span className="font-bold font-headline">BloomWatch</span>
        </Link>
        <nav className="hidden items-center space-x-6 md:flex">
          {navItems.map((item) => (
            <NavLink key={item.href} href={item.href} label={item.label} isProtected={item.protected} />
          ))}
        </nav>
        <div className="flex flex-1 items-center justify-end space-x-4">
            <div className="hidden md:block">
                <AuthButton />
            </div>
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Open menu</span>
                </Button>
                </SheetTrigger>
                <SheetContent side="left">
                <div className="flex flex-col p-6">
                    <Link
                    href="/"
                    className="mb-8 flex items-center space-x-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                    >
                    <Leaf className="h-6 w-6 text-primary" />
                    <span className="font-bold font-headline">BloomWatch</span>
                    </Link>
                    <nav className="flex flex-col space-y-4">
                    {navItems.map((item) => (
                        <NavLink key={item.href} href={item.href} label={item.label} isProtected={item.protected} />
                    ))}
                    </nav>
                    <div className="mt-6 border-t pt-6">
                        <AuthButton />
                    </div>
                </div>
                </SheetContent>
            </Sheet>
        </div>
      </div>
    </header>
  );
}
