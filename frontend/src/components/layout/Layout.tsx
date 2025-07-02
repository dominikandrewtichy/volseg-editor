import { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";

export function MainLayout({
  children,
}: {
  children: ReactNode | ReactNode[];
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <DevIndicator />

      <Header />

      <main className="container mx-auto flex-grow px-2 sm:px-4 py-8">
        {children}
      </main>

      <Footer />
    </div>
  );
}

function DevIndicator() {
  if (process.env.NODE_ENV !== "development") return null;

  return (
    <div className="pb-5">
      <div className="fixed top-0 left-0 z-50 bg-yellow-200 text-black text-xs font-semibold w-full text-center py-1">
        🚧 DEVELOPMENT BUILD 🚧
      </div>
    </div>
  );
}
