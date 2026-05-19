import { Suspense } from "react";
import SessionPage from "./session";
import { Loader2 } from "lucide-react";

export default function VerifyPageWrapper() {
  return (
    <Suspense
      fallback={
        <div className="mt-10 flex min-h-screen items-center justify-center text-center">
          <Loader2 className="animate-spin" />
        </div>
      }
    >
      <SessionPage />
    </Suspense>
  );
}
