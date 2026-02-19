"use client";

import { useEffect, useRef, useState } from "react";

import { useTheme } from "next-themes";

import { Check, Download, Plus, Save, Trash2, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  CustomTheme,
  CustomThemeService,
} from "@/services/persistence/custom-themes";

const DEFAULT_THEME: CustomTheme = {
  id: "new",
  name: "My Custom Theme",
  colors: {
    "brand-primary": "#9333ea", // Purple 600
    "brand-secondary": "#db2777", // Pink 600
    "brand-accent": "#22d3ee", // Cyan 400
    "brand-dark": "#0f172a", // Slate 900
    "surface-main": "#0f172a", // Slate 900
    "text-primary": "#ffffff",
    "text-secondary": "#cbd5e1", // Slate 300
    "text-muted": "#94a3b8", // Slate 400
  },
  createdAt: 0,
};

export function ThemeBuilder() {
  const { theme, setTheme } = useTheme();
  const [themes, setThemes] = useState<CustomTheme[]>([]);
  const [editingTheme, setEditingTheme] = useState<CustomTheme | null>(null);
  const [isClient, setIsClient] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => setIsClient(true), []);

  // Load themes on mount
  useEffect(() => {
    if (isClient) {
      setThemes(CustomThemeService.getAll());
    }
  }, [isClient]);

  // Sync editing theme to live preview
  useEffect(() => {
    if (!editingTheme) return;

    // Apply draft styles directly
    const root = document.documentElement;
    const vars = CustomThemeService.toCssVariables(editingTheme);
    Object.entries(vars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    // Cleanup when unmounting or switching off editing?
    // Actually if we switch to a saved theme, ThemeProvider takes over.
    // If we are editing, we want live preview.
  }, [editingTheme]);

  // Initialize editing if current theme is custom
  useEffect(() => {
    if (isClient && theme?.startsWith("custom-") && !editingTheme) {
      const found = themes.find((t) => t.id === theme);
      if (found) setEditingTheme(found);
    }
  }, [theme, themes, isClient, editingTheme]); // Added editingTheme dependency to avoid overwrite if user is editing

  const handleCreate = () => {
    const newTheme = {
      ...DEFAULT_THEME,
      id: `custom-${Date.now()}`,
      createdAt: Date.now(),
    };
    setEditingTheme(newTheme);
    // Temporarily set theme string to this new ID so UI reflects it (though it's not saved yet)
    // Actually, don't set 'theme' yet via next-themes because it will try to load from storage and fail.
    // We just keep 'editingTheme' active in local state, and the useEffect above applies visual styles.
  };

  const handleSave = () => {
    if (!editingTheme) return;
    CustomThemeService.save(editingTheme);
    setThemes(CustomThemeService.getAll());
    setTheme(editingTheme.id); // Now activate it for real
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this theme?")) {
      CustomThemeService.delete(id);
      setThemes(CustomThemeService.getAll());
      if (theme === id) setTheme("dark");
      if (editingTheme?.id === id) setEditingTheme(null);
    }
  };

  const handleExport = () => {
    if (!editingTheme) return;
    const blob = new Blob([JSON.stringify(editingTheme, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${editingTheme.name.replace(/\s+/g, "-").toLowerCase()}.sptheme.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        // Validated by service usually, but let's just cast for now and save.
        // Ideally we validate schema here.
        if (!json.colors || !json.name) throw new Error("Invalid theme file");

        const importedTheme = {
          ...json,
          id: `custom-${Date.now()}`, // Force new ID to avoid conflict
        };
        CustomThemeService.save(importedTheme);
        setThemes(CustomThemeService.getAll());
        setTheme(importedTheme.id);
        setEditingTheme(importedTheme);
      } catch {
        alert("Failed to import theme: Invalid file format");
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  if (!isClient) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
      {/* Sidebar List */}
      <div className="md:col-span-3 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Themes</h2>
          <Button size="sm" variant="outline" onClick={handleCreate}>
            <Plus size={14} />
          </Button>
        </div>

        <div className="space-y-2">
          {themes.map((t) => (
            <div
              key={t.id}
              className={`p-3 rounded border cursor-pointer flex items-center justify-between group ${theme === t.id ? "border-brand-primary bg-brand-primary/10" : "border-border-default hover:border-brand-primary/50"}`}
              onClick={() => {
                setTheme(t.id);
                setEditingTheme(t);
              }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: t.colors["brand-primary"] }}
                />
                <span className="text-sm font-medium">{t.name}</span>
              </div>
              {theme === t.id && (
                <Check size={14} className="text-brand-primary" />
              )}
            </div>
          ))}
          {themes.length === 0 && (
            <p className="text-xs text-text-muted">No custom themes yet.</p>
          )}
        </div>
      </div>

      {/* Editor Main */}
      <div className="md:col-span-9">
        {editingTheme ? (
          <div className="space-y-8 bg-surface-card p-6 rounded-xl border border-border-default">
            <div className="flex items-center justify-between border-b border-border-default pb-4">
              <input
                type="text"
                value={editingTheme.name}
                onChange={(e) =>
                  setEditingTheme({ ...editingTheme, name: e.target.value })
                }
                className="bg-transparent text-2xl font-bold focus:outline-none focus:border-b-2 focus:border-brand-primary w-full max-w-md"
                placeholder="Theme Name"
              />
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImport}
                  className="hidden"
                  accept=".json"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload size={14} className="mr-2" /> Import
                </Button>
                <Button size="sm" variant="ghost" onClick={handleExport}>
                  <Download size={14} className="mr-2" /> Export
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-status-danger hover:bg-status-danger/10"
                  onClick={() => handleDelete(editingTheme.id)}
                >
                  <Trash2 size={14} />
                </Button>
                <Button size="sm" onClick={handleSave}>
                  <Save size={14} className="mr-2" /> Save Theme
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Object.entries(editingTheme.colors).map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <label className="text-xs uppercase tracking-wider text-text-muted font-mono">
                    {key}
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={value}
                      onChange={(e) =>
                        setEditingTheme({
                          ...editingTheme,
                          colors: {
                            ...editingTheme.colors,
                            [key]: e.target.value,
                          },
                        })
                      }
                      className="w-12 h-12 rounded cursor-pointer bg-transparent border-0 p-0"
                    />
                    <input
                      type="text"
                      value={value}
                      onChange={(e) =>
                        setEditingTheme({
                          ...editingTheme,
                          colors: {
                            ...editingTheme.colors,
                            [key]: e.target.value,
                          },
                        })
                      }
                      className="w-full bg-surface-main border border-border-default rounded px-2 py-1 text-sm font-mono"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-border-default">
              <h3 className="text-sm font-bold text-text-secondary mb-4">
                Preview Helpers
              </h3>
              <p className="text-xs text-text-muted">
                The tokens above automatically generate surface highlights,
                borders, and text variations across the site. Scroll down to the
                component catalog to see the full effect.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full min-h-[400px] border-2 border-dashed border-border-default rounded-xl">
            <p className="text-text-muted mb-4">
              Select a custom theme or create a new one.
            </p>
            <Button onClick={handleCreate}>Create Custom Theme</Button>
          </div>
        )}
      </div>
    </div>
  );
}
