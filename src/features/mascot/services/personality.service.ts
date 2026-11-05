// ByteFox personality service (Sprint 7): maps a mascot level to a personality.

import {
  DEFAULT_PERSONALITY,
  PERSONALITIES,
} from "../constants/personalities";
import type { Personality, PersonalityId } from "../types/mascot.types";

export class PersonalityService {
  /**
   * Resolve the personality for a mascot level.
   *
   *   3  => Baby Byte
   *   8  => Coder Byte
   *   15 => Hacker Byte
   *   25 => Master Byte
   */
  getPersonality(level: number): Personality {
    const safeLevel = Number.isFinite(level) ? Math.max(1, Math.floor(level)) : 1;

    return (
      PERSONALITIES.find(
        (personality) =>
          safeLevel >= personality.minLevel &&
          (personality.maxLevel === null || safeLevel <= personality.maxLevel),
      ) ?? DEFAULT_PERSONALITY
    );
  }

  /**
   * Resolve just the personality id for a mascot level.
   */
  getPersonalityId(level: number): PersonalityId {
    return this.getPersonality(level).id;
  }
}

export const personalityService = new PersonalityService();

/**
 * Standalone helper matching the `getPersonality(level)` API.
 */
export function getPersonality(level: number): Personality {
  return personalityService.getPersonality(level);
}
