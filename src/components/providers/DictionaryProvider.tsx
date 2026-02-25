"use client";

import React, { createContext, useContext, useMemo } from "react";

type DictionaryContextType = Record<string, string>;

const DictionaryContext = createContext<DictionaryContextType>({});

interface DictionaryProviderProps {
  dictionary: Record<string, string>;
  children: React.ReactNode;
}

/**
 * Provides the interactive link dictionary to all child components.
 * This avoids massive prop-drilling down through EntityShowcase -> Stats -> Mechanics -> etc.
 */
export function DictionaryProvider({
  dictionary,
  children,
}: DictionaryProviderProps) {
  // Memoize just in case, though the dictionary prop should be stable coming from the server page
  const value = useMemo(() => dictionary, [dictionary]);

  return (
    <DictionaryContext.Provider value={value}>
      {children}
    </DictionaryContext.Provider>
  );
}

/**
 * Hook to consume the link dictionary in deep client components like TextWithLinks.
 */
export function useDictionary() {
  return useContext(DictionaryContext);
}
