"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function RouteFeedback() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const routeKey = `${pathname}?${searchParams.toString()}`;
  const previousPath = useRef(routeKey);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (previousPath.current !== routeKey) {
      previousPath.current = routeKey;
      setIsTransitioning(true);
      window.scrollTo({ top: 0, behavior: "smooth" });

      const timer = window.setTimeout(() => {
        setIsTransitioning(false);
      }, 260);

      return () => window.clearTimeout(timer);
    }
  }, [routeKey]);

  return <div aria-hidden="true" className={`route-feedback ${isTransitioning ? "is-active" : ""}`} />;
}
