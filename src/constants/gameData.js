export const RACES = ["Human", "Elf", "Dwarf", "Half-Orc", "Fae"];
export const CLASSES = ["Warrior", "Mage", "Rogue", "Ranger", "Cleric"];

export const CLASS_STATS = {
  Warrior: { hp: 120, maxHp: 120, attack: 8, defense: 7, magic: 1 },
  Mage:    { hp: 70,  maxHp: 70,  attack: 3, defense: 3, magic: 10 },
  Rogue:   { hp: 85,  maxHp: 85,  attack: 7, defense: 5, magic: 2 },
  Ranger:  { hp: 95,  maxHp: 95,  attack: 6, defense: 5, magic: 3 },
  Cleric:  { hp: 90,  maxHp: 90,  attack: 4, defense: 6, magic: 7 },
};

export const CLASS_INVENTORY = {
  Warrior: ["Iron Sword", "Wooden Shield", "Chain Mail", "Health Potion"],
  Mage:    ["Arcane Staff", "Spellbook", "Mana Crystal", "Scroll of Fire"],
  Rogue:   ["Twin Daggers", "Lockpicks", "Shadow Cloak", "Smoke Bomb"],
  Ranger:  ["Longbow", "Quiver (12 arrows)", "Hunting Knife", "Rope"],
  Cleric:  ["Holy Mace", "Sacred Tome", "Healing Herbs", "Silver Pendant"],
};

export const RACE_BONUS = {
  Human:      "Adaptable: +1 to all stats",
  Elf:        "Keen Eye: +2 Magic, +1 Attack",
  Dwarf:      "Stout: +2 Defense, +15 HP",
  "Half-Orc": "Brutal: +3 Attack, -1 Defense",
  Fae:        "Ethereal: +3 Magic, +1 Defense",
};
