
import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import LogoutButton from "@/components/auth/LogoutButton";
import { Button } from "@/components/ui/button";
import { UserIcon } from "lucide-react";

const Header = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <header className="bg-white border-b py-4 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-legal-primary">
            DocuLegalize
          </Link>
          
          <nav>
            <ul className="flex items-center gap-6">
              <li>
                <Link to="/" className="hover:text-primary">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/documents" className="hover:text-primary">
                  Documents
                </Link>
              </li>
              <li>
                <Link to="/certificates" className="hover:text-primary">
                  Certificates
                </Link>
              </li>
            </ul>
          </nav>
          
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center gap-2 text-sm">
                  <UserIcon className="h-4 w-4 text-muted-foreground" />
                  <span>{user?.name || user?.email}</span>
                </div>
                <LogoutButton />
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="outline" size="sm">Login</Button>
                </Link>
                <Link to="/signup">
                  <Button size="sm">Sign up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
