
import React from "react";
import { Button } from "@/components/ui/button";
import { GavelIcon, FileTextIcon, SearchIcon, MenuIcon, XIcon } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <div className="bg-legal-primary rounded-md p-1.5">
            <GavelIcon className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold text-legal-primary hidden sm:inline">
            DocuLegalize
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link
            to="/"
            className="text-gray-700 hover:text-legal-primary font-medium transition-colors"
          >
            Dashboard
          </Link>
          <Link
            to="/documents"
            className="text-gray-700 hover:text-legal-primary font-medium transition-colors"
          >
            Documents
          </Link>
          <Link
            to="/certificates"
            className="text-gray-700 hover:text-legal-primary font-medium transition-colors"
          >
            Certificates
          </Link>
        </nav>

        <div className="hidden md:flex items-center space-x-4">
          <Button variant="outline" size="sm" className="text-legal-primary border-legal-primary">
            <SearchIcon className="h-4 w-4 mr-2" />
            Search
          </Button>
          <Button size="sm" className="bg-legal-primary hover:bg-legal-dark">
            <FileTextIcon className="h-4 w-4 mr-2" />
            Upload Document
          </Button>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? (
            <XIcon className="h-6 w-6 text-gray-600" />
          ) : (
            <MenuIcon className="h-6 w-6 text-gray-600" />
          )}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t py-3 px-4 shadow-md">
          <nav className="flex flex-col space-y-3">
            <Link
              to="/"
              className="text-gray-700 hover:text-legal-primary font-medium transition-colors px-2 py-1.5 rounded-md hover:bg-gray-100"
              onClick={() => setIsMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              to="/documents"
              className="text-gray-700 hover:text-legal-primary font-medium transition-colors px-2 py-1.5 rounded-md hover:bg-gray-100"
              onClick={() => setIsMenuOpen(false)}
            >
              Documents
            </Link>
            <Link
              to="/certificates"
              className="text-gray-700 hover:text-legal-primary font-medium transition-colors px-2 py-1.5 rounded-md hover:bg-gray-100"
              onClick={() => setIsMenuOpen(false)}
            >
              Certificates
            </Link>
            <div className="pt-2 border-t flex flex-col space-y-2">
              <Button variant="outline" className="justify-start text-legal-primary border-legal-primary">
                <SearchIcon className="h-4 w-4 mr-2" />
                Search
              </Button>
              <Button className="justify-start bg-legal-primary hover:bg-legal-dark">
                <FileTextIcon className="h-4 w-4 mr-2" />
                Upload Document
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
