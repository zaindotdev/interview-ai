import { Suspense } from "react";
import VerifyClient from "./verify-client";

export default function VerifyPageWrapper() {
  return (
    <Suspense fallback={<div className="text-center mt-10">Loading...</div>}>
      <VerifyClient />
    </Suspense>
  );
}
