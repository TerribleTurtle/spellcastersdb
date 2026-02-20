export function capitalize(str: string): string {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function formatEntityName(id: string): string {
  if (!id) return "";
  if (id === "Unit") return "Creatures & Buildings";
  return id
    .split("_")
    .map((word) => capitalize(word))
    .join(" ");
}

const PLURAL_TARGETS: Record<string, string> = {
  Creature: "Creatures",
  Building: "Buildings",
  Spellcaster: "Spellcasters",
  Lifestone: "Lifestones",
  Flying: "Flying",
  Hover: "Hovering",
  Ground: "Ground",
  Ally: "Allies",
  Enemy: "Enemies",
  All: "Everything",
};

export function formatTargetName(target: string): string {
  const formatted = formatEntityName(target);
  return PLURAL_TARGETS[formatted] || formatted;
}
