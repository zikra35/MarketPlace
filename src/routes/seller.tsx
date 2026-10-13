import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";

export const Route = createFileRoute("/seller")({
  component: SellerLayout,
});

function SellerLayout() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect non-seller users
    if (!isLoading && (!user || user.role !== 'seller')) {
      navigate({ to: '/login' });
    }
  }, [user, navigate, isLoading]);

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-accent/20 mb-4">
            <div className="h-8 w-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'seller') {
    return null;
  }

  return <Outlet />;
}
