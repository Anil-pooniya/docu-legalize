
import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { LogOutIcon } from 'lucide-react';

const LogoutButton = () => {
  const { logout } = useAuth();
  
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={logout}
      className="flex items-center gap-2"
    >
      <LogOutIcon className="h-4 w-4" />
      <span>Logout</span>
    </Button>
  );
};

export default LogoutButton;
