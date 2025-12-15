import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home } from "lucide-react";
import { Link } from "react-router";

export function NotFoundPage() {
  return (
    <div className="flex h-screen w-full items-center justify-center  px-4">
      <Card className="w-full max-w-md text-center shadow-xl rounded-2xl">
        <CardHeader>
          <CardTitle className="text-7xl font-bold ">404</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg  mb-6">
            Oops! The page you're looking for doesn't exist.
          </p>
          <Link to="/">
            <Button className="flex items-center gap-2 px-6 py-2 rounded-xl shadow">
              <Home className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
