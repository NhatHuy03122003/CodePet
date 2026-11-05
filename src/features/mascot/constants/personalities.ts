// ByteFox personality definitions (Sprint 7).
//
// A personality is the character ByteFox grows into as its level rises:
//   Level 1-5   => Baby Byte
//   Level 6-10  => Coder Byte
//   Level 11-20 => Hacker Byte
//   Level 21+   => Master Byte

import type { Personality } from "../types/mascot.types";

export const PERSONALITIES: readonly Personality[] = [
  {
    id: "BABY",
    title: "Baby Byte",
    description:
      "A tiny, curious fox taking its first steps into the world of code.",
    tone: "playful",
    minLevel: 1,
    maxLevel: 5,
  },
  {
    id: "CODER",
    title: "Coder Byte",
    description:
      "A confident fox that has found its rhythm and ships code every day.",
    tone: "motivational",
    minLevel: 6,
    maxLevel: 10,
  },
  {
    id: "HACKER",
    title: "Hacker Byte",
    description:
      "A sharp, fast-moving fox that bends tricky problems to its will.",
    tone: "bold",
    minLevel: 11,
    maxLevel: 20,
  },
  {
    id: "MASTER",
    title: "Master Byte",
    description:
      "A legendary fox whose mastery of the craft inspires everyone around it.",
    tone: "wise",
    minLevel: 21,
    maxLevel: null,
  },
];

/** Personality used when no level range matches (i.e. the starting personality). */
export const DEFAULT_PERSONALITY: Personality = PERSONALITIES[0];
