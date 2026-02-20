import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import {
  CacheFirst,
  NetworkFirst,
  Serwist,
  StaleWhileRevalidate,
} from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}
declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: false,
  runtimeCaching: [
    ...defaultCache,
    // GitHub Pages JSON API — StaleWhileRevalidate
    {
      matcher: /^https:\/\/terribleturtle\.github\.io\/.*\.json$/,
      handler: new StaleWhileRevalidate({ cacheName: "sc-api-data" }),
    },
    // Card images from GitHub Pages — CacheFirst w/ LRU
    {
      matcher:
        /^https:\/\/terribleturtle\.github\.io\/.*\.(png|jpg|webp|avif)$/,
      handler: new CacheFirst({
        cacheName: "sc-card-images",
      }),
    },
    // Next.js App Router RSC/Flight payloads — NetworkFirst
    // These are required for client-side navigation (Link) to work while offline.
    {
      matcher({ request, url }) {
        // Match ?_rsc= queries or requests with the RSC header
        return (
          request.destination === "" &&
          (url.searchParams.has("_rsc") || request.headers.has("RSC"))
        );
      },
      handler: new NetworkFirst({
        cacheName: "sc-rsc-payloads",
        networkTimeoutSeconds: 3,
      }),
    },
  ],
});

serwist.setCatchHandler(async ({ request }) => {
  // If a document request fails (e.g., full page navigation while offline),
  // redirect them to the offline fallback page to prevent Next.js hydration crashes.
  if (request.destination === "document") {
    return Response.redirect("/~offline", 302);
  }
  return Response.error();
});

serwist.addEventListeners();
