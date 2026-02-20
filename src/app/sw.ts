import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { CacheFirst, Serwist, StaleWhileRevalidate } from "serwist";

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
  ],
  fallbacks: {
    entries: [
      {
        url: "/~offline",
        matcher({ request }) {
          return request.destination === "document";
        },
      },
    ],
  },
});

serwist.addEventListeners();
