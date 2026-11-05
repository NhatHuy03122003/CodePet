// TODO: Implement mascot constants

export const MASCOT_STAGES = [
  { id: 1, name: 'Baby Byte', minLevel: 1 },
  { id: 2, name: 'Coder Byte', minLevel: 6 },
  { id: 3, name: 'Dev Byte', minLevel: 11 },
  { id: 4, name: 'Senior Byte', minLevel: 21 },
  { id: 5, name: 'Lead Byte', minLevel: 51 },
  { id: 6, name: 'Architect Byte', minLevel: 101 },
  { id: 7, name: 'Master Byte', minLevel: 201 },
  { id: 8, name: 'Legend Byte', minLevel: 501 },
  { id: 9, name: 'Mythic Byte', minLevel: 1001 },
  { id: 10, name: 'Cosmic Byte', minLevel: 2001 },
] as const;

export const XP_PER_COMMIT = 10;
export const XP_PER_PR_OPENED = 50;
export const XP_PER_PR_MERGED = 100;
export const XP_PER_REVIEW = 30;
