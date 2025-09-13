import { Suspense } from "react";
import SessionPage from "./session";
import { Loader2 } from "lucide-react";

export default function VerifyPageWrapper() {
  return (
    <Suspense fallback={<div className="text-center mt-10"><Loader2 className="animate-spin"/></div>}>
      <SessionPage />
    </Suspense>
  );
}
