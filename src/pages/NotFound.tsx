
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import PageLayout from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { HomeIcon } from "lucide-react";
import { Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <PageLayout>
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-legal-primary mb-4">404</h1>
          <p className="text-xl text-gray-600 mb-6">Oops! Document not found</p>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            The document you are looking for might have been moved or doesn't exist.
          </p>
          <Link to="/">
            <Button className="bg-legal-primary hover:bg-legal-dark">
              <HomeIcon className="h-4 w-4 mr-2" />
              Return to Home
            </Button>
          </Link>
        </div>
      </div>
    </PageLayout>
  );
};

export default NotFound;
