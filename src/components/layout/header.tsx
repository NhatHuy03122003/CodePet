'use client';

import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useSession } from '@/hooks/use-session';
import { LogOut, User } from 'lucide-react';

export default function Header() {
  const { session } = useSession();

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  const userInitials = session?.user?.name
    ? session.user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold">CodePet</h1>
        </div>

        {session?.user && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium">{session.user.name || 'User'}</p>
                <p className="text-xs text-muted-foreground">{session.user.email || ''}</p>
              </div>
              <Avatar>
                <AvatarImage src={session.user.image || undefined} alt={session.user.name || 'User'} />
                <AvatarFallback>{userInitials}</AvatarFallback>
              </Avatar>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
