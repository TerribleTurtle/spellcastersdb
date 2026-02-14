export enum EntityCategory {
  Spellcaster = "Spellcaster",
  Titan = "Titan",
  Unit = "Unit", // Represents both 'Creature' and generic Units in some contexts, but 'Creature' is the data value
  Creature = "Creature",
  Spell = "Spell",
  Building = "Building",
  Artifact = "Artifact",
  Consumable = "Consumable",
  Upgrade = "Upgrade"
}

export enum SlotType {
  Unit = "UNIT",
  Titan = "TITAN"
}
