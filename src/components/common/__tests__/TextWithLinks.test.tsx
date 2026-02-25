import React from "react";

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DictionaryProvider } from "@/components/providers/DictionaryProvider";

import { TextWithLinks } from "../TextWithLinks";

describe("TextWithLinks Component", () => {
  const dictionary = {
    Elemental: "/schools/Elemental",
    Astral: "/schools/Astral",
    "Astral Tower": "/units/astral_tower",
    Fire: "/guide/fire",
    "Fire Infusion": "/guide/infusions/fire_infusion",
  };

  type TestProps = React.ComponentProps<typeof TextWithLinks> & {
    dictionary?: Record<string, string>;
  };

  const renderWithProps = (props: TestProps) => {
    return render(
      <DictionaryProvider dictionary={props.dictionary || dictionary}>
        <TextWithLinks {...props} />
      </DictionaryProvider>
    );
  };

  it("should render plain text if no dictionary matches", () => {
    renderWithProps({ text: "A simple unit description." });
    expect(screen.getByText("A simple unit description.")).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("should link a matched keyword", () => {
    renderWithProps({ text: "Belongs to the Elemental school." });
    const link = screen.getByRole("link", { name: "Elemental" });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/schools/Elemental");
  });

  it("should match case-insensitively but preserve original casing", () => {
    renderWithProps({ text: "Uses elemental magic." });
    const link = screen.getByRole("link", { name: "elemental" });
    expect(link).toHaveAttribute("href", "/schools/Elemental");
  });

  it("should prioritize longer keys over overlapping shorter keys", () => {
    // "Astral Tower" should match, not "Astral"
    renderWithProps({ text: "The Astral Tower stands tall." });
    const link = screen.getByRole("link", { name: "Astral Tower" });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/units/astral_tower");

    // "Astral" by itself shouldn't be linked a second time since it's inside the larger match
    expect(
      screen.queryByRole("link", { name: "Astral" })
    ).not.toBeInTheDocument();
  });

  it("should only link the first occurrence of a keyword", () => {
    renderWithProps({
      text: "Elemental magic is strong. This Elemental spell proves it.",
    });
    const links = screen.getAllByRole("link", { name: "Elemental" });
    expect(links).toHaveLength(1);

    // The second occurrence should just be text
    expect(
      screen.getByText(/magic is strong\. This Elemental spell proves it\./)
    ).toBeInTheDocument();
  });

  it("respects word boundaries to avoid false substring matches", () => {
    // Adding a dummy dict entry just for this test
    const localDict = { heal: "/spells/heal" };

    renderWithProps({ text: "A healthy unit.", dictionary: localDict });
    // "heal" is in "healthy", but shouldn't match due to word boundaries
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("caps the maximum number of links generated", () => {
    const manyLinksDict = {
      One: "/1",
      Two: "/2",
      Three: "/3",
      Four: "/4",
      Five: "/5",
    };
    const text = "One Two Three Four Five.";

    renderWithProps({ text, dictionary: manyLinksDict, maxLinks: 3 });
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(3); // capped at 3 instead of 5
  });

  it("respects the excludeKeys prop", () => {
    renderWithProps({ text: "An Astral unit.", excludeKeys: ["Astral"] });
    expect(
      screen.queryByRole("link", { name: "Astral" })
    ).not.toBeInTheDocument();
  });

  it("renders empty text without crashing", () => {
    renderWithProps({ text: "" });
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("prioritizes 'Fire Infusion' over 'Fire' when both appear", () => {
    renderWithProps({ text: "Applies Fire Infusion to targets." });
    const link = screen.getByRole("link", { name: "Fire Infusion" });
    expect(link).toHaveAttribute("href", "/guide/infusions/fire_infusion");

    // "Fire" by itself should not be an additional link
    const allLinks = screen.getAllByRole("link");
    expect(allLinks).toHaveLength(1);
  });

  it("passes linkClassName to the rendered links", () => {
    renderWithProps({
      text: "An Elemental spell.",
      linkClassName: "custom-link-class",
    });
    const link = screen.getByRole("link", { name: "Elemental" });
    expect(link.className).toContain("custom-link-class");
  });

  it("applies wrapper className to the paragraph", () => {
    renderWithProps({
      text: "Text content",
      className: "my-custom-paragraph",
    });
    const paragraph = screen.getByText("Text content");
    expect(paragraph.className).toContain("my-custom-paragraph");
  });

  it("handles multiple excludeKeys simultaneously", () => {
    renderWithProps({
      text: "Elemental and Astral schools.",
      excludeKeys: ["Elemental", "Astral"],
    });
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
