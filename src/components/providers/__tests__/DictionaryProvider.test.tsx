import React from "react";

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DictionaryProvider, useDictionary } from "../DictionaryProvider";

// ---------------------------------------------------------------------------
// Test consumer component
// ---------------------------------------------------------------------------

function DictionaryConsumer() {
  const dict = useDictionary();
  const keys = Object.keys(dict);
  return (
    <div data-testid="consumer">
      <span data-testid="count">{keys.length}</span>
      {keys.map((k) => (
        <span key={k} data-testid={`entry-${k}`}>
          {dict[k]}
        </span>
      ))}
    </div>
  );
}

// ============================================================================
// DictionaryProvider + useDictionary
// ============================================================================

describe("DictionaryProvider", () => {
  it("provides the dictionary to child components via useDictionary", () => {
    const dict = { Elemental: "/schools/Elemental", Dryad: "/units/dryad" };
    render(
      <DictionaryProvider dictionary={dict}>
        <DictionaryConsumer />
      </DictionaryProvider>
    );
    expect(screen.getByTestId("count").textContent).toBe("2");
    expect(screen.getByTestId("entry-Elemental").textContent).toBe(
      "/schools/Elemental"
    );
    expect(screen.getByTestId("entry-Dryad").textContent).toBe("/units/dryad");
  });

  it("returns an empty dictionary when no provider wraps the consumer", () => {
    render(<DictionaryConsumer />);
    expect(screen.getByTestId("count").textContent).toBe("0");
  });

  it("handles an empty dictionary gracefully", () => {
    render(
      <DictionaryProvider dictionary={{}}>
        <DictionaryConsumer />
      </DictionaryProvider>
    );
    expect(screen.getByTestId("count").textContent).toBe("0");
  });

  it("updates when the dictionary prop changes via re-render", () => {
    const dict1 = { Alpha: "/alpha" };
    const dict2 = { Beta: "/beta", Gamma: "/gamma" };

    const { rerender } = render(
      <DictionaryProvider dictionary={dict1}>
        <DictionaryConsumer />
      </DictionaryProvider>
    );
    expect(screen.getByTestId("count").textContent).toBe("1");
    expect(screen.getByTestId("entry-Alpha").textContent).toBe("/alpha");

    rerender(
      <DictionaryProvider dictionary={dict2}>
        <DictionaryConsumer />
      </DictionaryProvider>
    );
    expect(screen.getByTestId("count").textContent).toBe("2");
    expect(screen.getByTestId("entry-Beta").textContent).toBe("/beta");
    expect(screen.getByTestId("entry-Gamma").textContent).toBe("/gamma");
  });

  it("supports deeply nested consumers", () => {
    const dict = { Deep: "/deep" };
    render(
      <DictionaryProvider dictionary={dict}>
        <div>
          <div>
            <div>
              <DictionaryConsumer />
            </div>
          </div>
        </div>
      </DictionaryProvider>
    );
    expect(screen.getByTestId("entry-Deep").textContent).toBe("/deep");
  });
});
