// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { TeamActionButtons } from "./TeamActionButtons";

describe("TeamActionButtons", () => {
  it("should render Return to Forge and Save buttons when not readOnly and no existingId", () => {
    const onBack = vi.fn();
    const onSave = vi.fn();

    render(
      <TeamActionButtons
        isReadOnly={false}
        existingId={null}
        onBack={onBack}
        onSave={onSave}
        onEditDeck={vi.fn()}
      />
    );

    expect(
      screen.getByRole("button", { name: /Return to Forge/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Save/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Edit Decks/i })
    ).toBeInTheDocument();
  });

  it("should render Open Team button when viewed data has changes (existingId present)", () => {
    render(
      <TeamActionButtons
        isReadOnly={false}
        existingId="some-id"
        onBack={vi.fn()}
        onSave={vi.fn()}
        onEditDeck={vi.fn()}
      />
    );

    expect(
      screen.getByRole("button", { name: /Return to Forge/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Open Team/i })
    ).toBeInTheDocument();
  });

  it("should hide Save buttons when isReadOnly is true and no onSave", () => {
    render(
      <TeamActionButtons
        isReadOnly={true}
        existingId={null}
        onBack={vi.fn()}
        onEditDeck={vi.fn()}
        // onSave omitted intentionally simulating read-only state
      />
    );

    expect(screen.getByRole("button", { name: /Close/i })).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Save/i })
    ).not.toBeInTheDocument();
  });

  it("should call onBack and onSave appropriately", () => {
    const onBack = vi.fn();
    const onSave = vi.fn();

    render(
      <TeamActionButtons
        isReadOnly={false}
        existingId={null}
        onBack={onBack}
        onSave={onSave}
        onEditDeck={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /Return to Forge/i }));
    expect(onBack).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: /Save/i }));
    expect(onSave).toHaveBeenCalledTimes(1);
  });
});
