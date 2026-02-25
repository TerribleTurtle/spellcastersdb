// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useTeamBuilder } from "@/features/team-builder/hooks/useTeamBuilder";
import { useTeamEditModal } from "@/features/team-builder/hooks/useTeamEditModal";

import { TeamBuilderView } from "./TeamBuilderView";

// Mock Layout so we don't render the 3D grid and DND context
vi.mock("@/features/deck-builder/ui/layouts/TeamEditorLayout", () => ({
  TeamEditorLayout: () => <div data-testid="mock-team-layout" />,
}));

// Mock Modals and Overlays
vi.mock("@/components/modals/ImportConflictModal", () => ({
  ImportConflictModal: ({ onConfirm, onCancel }: any) => (
    <div data-testid="mock-conflict-modal">
      <button onClick={onConfirm}>Confirm Import</button>
      <button onClick={onCancel}>Cancel Import</button>
    </div>
  ),
}));

vi.mock("@/components/modals/SaveTeamModal", () => ({
  SaveTeamModal: ({ isOpen }: any) =>
    isOpen ? <div data-testid="mock-save-modal" /> : null,
}));

vi.mock("@/features/team-builder/components/TeamOverview", () => ({
  TeamOverview: () => <div data-testid="mock-team-overview" />,
}));

// Mock Hooks
vi.mock("@/features/team-builder/hooks/useTeamBuilder");
vi.mock("@/features/team-builder/hooks/useTeamEditModal");

const mockUseTeamBuilder = useTeamBuilder as any;
const mockUseTeamEditModal = useTeamEditModal as any;

describe("TeamBuilderView", () => {
  const baseTeamBuilderState = {
    teamDecks: [{}, {}, {}],
    viewingTeamData: null,
    existingId: null,
    isReadOnly: false,
    showSummary: false,
    hasChanges: false,
    showConflictModal: false,
    showSaveModal: false,
    viewingTeamName: "Mighty Ducks",
    teamName: "Mighty Ducks",
    handleBack: vi.fn(),
    handleSave: vi.fn(),
    performSave: vi.fn(),
    setShowSaveModal: vi.fn(),
    handleEditDeck: vi.fn(),
    handleImportCancel: vi.fn(),
    handleImportConfirm: vi.fn(),
    handleImportSaveAndOverwrite: vi.fn(),
  };

  const baseEditModalState = {
    showEditConfirm: false,
    requestEdit: vi.fn(),
    handleConfirm: vi.fn(),
    handleCancel: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseTeamBuilder.mockReturnValue(baseTeamBuilderState);
    mockUseTeamEditModal.mockReturnValue(baseEditModalState);
  });

  const props = {
    units: [],
    spellcasters: [],
  };

  it("should render the base layout and nothing else by default", () => {
    render(<TeamBuilderView {...props} />);

    expect(screen.getByTestId("mock-team-layout")).toBeInTheDocument();
    expect(screen.queryByTestId("mock-conflict-modal")).not.toBeInTheDocument();
    expect(screen.queryByTestId("mock-save-modal")).not.toBeInTheDocument();
    expect(screen.queryByTestId("mock-team-overview")).not.toBeInTheDocument();
  });

  it("should render ImportConflictModal when showConflictModal is true in team builder state", () => {
    mockUseTeamBuilder.mockReturnValue({
      ...baseTeamBuilderState,
      showConflictModal: true,
    });

    render(<TeamBuilderView {...props} />);
    expect(screen.getByTestId("mock-conflict-modal")).toBeInTheDocument();
  });

  it("should render SaveTeamModal when showSaveModal is true", () => {
    mockUseTeamBuilder.mockReturnValue({
      ...baseTeamBuilderState,
      showSaveModal: true,
    });

    render(<TeamBuilderView {...props} />);
    expect(screen.getByTestId("mock-save-modal")).toBeInTheDocument();
  });

  it("should render TeamOverview overlay when showSummary is true", () => {
    mockUseTeamBuilder.mockReturnValue({
      ...baseTeamBuilderState,
      showSummary: true,
    });

    render(<TeamBuilderView {...props} />);
    expect(screen.getByTestId("mock-team-overview")).toBeInTheDocument();
  });

  it("should render TeamOverview overlay when viewingTeamData is present", () => {
    mockUseTeamBuilder.mockReturnValue({
      ...baseTeamBuilderState,
      showSummary: false, // Ensure this isn't the trigger
      viewingTeamData: [{}, {}, {}],
    });

    render(<TeamBuilderView {...props} />);
    expect(screen.getByTestId("mock-team-overview")).toBeInTheDocument();
  });

  it("should render ImportConflictModal (Edit Confirm variant) when showEditConfirm is true from edit modal hook", () => {
    mockUseTeamEditModal.mockReturnValue({
      ...baseEditModalState,
      showEditConfirm: true,
    });

    render(<TeamBuilderView {...props} />);
    expect(screen.getByTestId("mock-conflict-modal")).toBeInTheDocument();
  });
});
