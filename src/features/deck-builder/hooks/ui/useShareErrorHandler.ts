"use client";

import { useEffect } from "react";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { useToast } from "@/hooks/useToast";

export function useShareErrorHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { showToast } = useToast();

  useEffect(() => {
    const errorParam = searchParams.get("error");

    if (errorParam) {
      let message = "An error occurred with the share link.";

      switch (errorParam) {
        case "link-expired":
          message = "This short link has expired or doesn't exist.";
          break;
        case "redis-offline":
          message = "The short link service is temporarily unavailable.";
          break;
        case "invalid-link":
          message = "This link appears to be invalid.";
          break;
        case "invalid-data":
          message = "The data for this link could not be loaded.";
          break;
        case "server-error":
          message = "A server error occurred while resolving the link.";
          break;
      }

      showToast(message, "error");

      // Strip the error parameter from the URL gracefully
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.delete("error");

      const newUrl =
        pathname + (newParams.toString() ? `?${newParams.toString()}` : "");
      router.replace(newUrl, { scroll: false });
    }
  }, [searchParams, pathname, router, showToast]);
}
