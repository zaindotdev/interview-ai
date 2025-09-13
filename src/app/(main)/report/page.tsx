import { Suspense } from "react";
import Report from "./report";
import { Loader2 } from "lucide-react";

export default function ReportPageWrapper() {
  return <Suspense fallback={<div className="text-center mt-10"><Loader2 className="animate-spin"/></div>}>
    <Report />
  </Suspense>
}