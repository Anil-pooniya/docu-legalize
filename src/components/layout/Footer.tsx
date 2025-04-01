
import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-legal-light mt-auto border-t">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm text-gray-600 mb-4 md:mb-0">
            &copy; {currentYear} DocuLegalize. All rights reserved.
          </div>
          <div className="flex space-x-6">
            <Link to="/privacy" className="text-sm text-gray-600 hover:text-legal-primary">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-sm text-gray-600 hover:text-legal-primary">
              Terms of Service
            </Link>
            <Link to="/contact" className="text-sm text-gray-600 hover:text-legal-primary">
              Contact
            </Link>
          </div>
        </div>
        <div className="mt-4 text-xs text-center text-gray-500">
          Compliant with Section 65B of the Indian Evidence Act
        </div>
      </div>
    </footer>
  );
};

export default Footer;
