import { useState, useEffect, useRef } from "react";
import { useRouter } from "@tanstack/react-router";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BankBackButton({ onBack }: { onBack?: () => void }) {
  const router = useRouter();
  const [returning, setReturning] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  function goBack() {
    setReturning(true);
    timer.current = setTimeout(() => {
      if (onBack) onBack();
      else if (router.history.canGoBack()) router.history.back();
      else void router.navigate({ to: "/" });
      setReturning(false);
    }, window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 320);
  }
  return <>
    <Button type="button" variant="ghost" size="icon" title="Go back" aria-label="Go back" disabled={returning} onClick={goBack} className="shrink-0 text-gold"><ArrowLeft className="h-4 w-4" /></Button>
    {returning && <div className="fixed inset-0 z-[100] grid place-items-center bg-background/90 pointer-events-none" aria-hidden="true">
      <div className="flex flex-col items-center gap-3 text-gold opacity-20"><ShieldCheck className="h-24 w-24" /><span className="font-display text-2xl font-bold">citiEtrust Bank</span></div>
    </div>}
  </>;
}