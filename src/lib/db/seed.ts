// TODO: Implement database seed script

import { prisma } from './prisma';

async function main() {
  // TODO: Implement seed logic for mascot stages
  console.log('Seeding database...');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
