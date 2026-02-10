
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { MoreHorizontal, Layers, Link as LinkIcon, Trash2 } from "lucide-react";

export function ItemMenu({
  onDuplicate,
  onDelete,
  onCopyLink,
  type,
}: {
  onDuplicate?: () => void;
  onDelete: () => void;
  onCopyLink?: () => void;
  type: "DECK" | "TEAM";
}) {
  const [showMenu, setShowMenu] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });

  // Derived labels
  const duplicateLabel = type === "TEAM" ? "Duplicate Team" : "Duplicate Deck";
  const shareLabel = type === "TEAM" ? "Share Team" : "Share Deck";

  // Close on scroll/resize/click outside
  useEffect(() => {
    if (!showMenu) return;
    const handleScroll = () => setShowMenu(false);
    const handleResize = () => setShowMenu(false);
    const handleClick = (e: MouseEvent) => {
      // If click is outside button and outside menu (handled by portal stopPropagation)
      if (buttonRef.current && !buttonRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { capture: true });
    window.addEventListener("resize", handleResize);
    document.addEventListener("mousedown", handleClick);

    return () => {
      window.removeEventListener("scroll", handleScroll, { capture: true });
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("mousedown", handleClick);
    };
  }, [showMenu]);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const toggleMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!showMenu && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPos({
        top: rect.bottom + 4,
        left: rect.right - 128 + 20,
      });
    }
    setShowMenu(!showMenu);
  };

  return (
    <>
      <button
        ref={buttonRef}
        onClick={toggleMenu}
        className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors"
      >
        <MoreHorizontal size={16} />
      </button>

      {showMenu &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed w-48 bg-surface-card border border-brand-primary/30 rounded-lg shadow-xl overflow-hidden flex flex-col py-1 animate-in fade-in zoom-in-95 duration-100"
            style={{
              top: menuPos.top,
              left: Math.max(
                10,
                Math.min(window.innerWidth - 200, menuPos.left)
              ),
              zIndex: 9999,
            }}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            {onDuplicate && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDuplicate();
                  setShowMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-white/10 hover:text-white flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Layers size={14} />
                <span>{duplicateLabel}</span>
              </button>
            )}

            {onCopyLink && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onCopyLink();
                  setShowMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-white/10 hover:text-white flex items-center gap-2 transition-colors cursor-pointer"
              >
                <LinkIcon size={14} />
                <span>{shareLabel}</span>
              </button>
            )}

            <div className="h-px bg-white/5 my-1" />

            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // Close menu, open modal
                setShowMenu(false);
                setShowDeleteConfirm(true);
              }}
              className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Trash2 size={14} />
              <span>Delete</span>
            </button>
          </div>,
          document.body
        )}

      {showDeleteConfirm &&
        createPortal(
          <DeleteConfirmationModal
            type={type}
            onConfirm={() => {
              onDelete();
              setShowDeleteConfirm(false);
            }}
            onCancel={() => setShowDeleteConfirm(false)}
          />,
          document.body
        )}
    </>
  );
}

function DeleteConfirmationModal({
  type,
  onConfirm,
  onCancel,
}: {
  type: "DECK" | "TEAM";
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        e.stopPropagation();
        onCancel();
      }}
    >
      <div
        className="bg-surface-card border border-white/10 rounded-lg shadow-2xl max-w-sm w-full p-6 space-y-4 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-2 text-center">
          <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-500 mx-auto flex items-center justify-center mb-2">
            <Trash2 size={24} />
          </div>
          <h3 className="text-lg font-bold text-white">
            Delete {type === "TEAM" ? "Team" : "Deck"}?
          </h3>
          <p className="text-sm text-gray-400">
            Are you sure you want to delete this{" "}
            {type === "TEAM" ? "team" : "deck"}? This action cannot be undone.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={onCancel}
            className="w-full py-2.5 rounded bg-surface-main border border-white/10 text-gray-300 hover:text-white hover:bg-white/5 font-bold transition-all text-xs uppercase tracking-wider"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="w-full py-2.5 rounded bg-red-500 text-white hover:bg-red-600 font-bold shadow-lg shadow-red-500/20 transition-all flex items-center justify-center gap-2"
          >
            <Trash2 size={16} />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
