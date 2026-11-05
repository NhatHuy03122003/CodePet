const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
(async () => {
  const tables = ["UserAchievement", "Activity", "Commit", "Mascot"];
  for (const t of tables) {
    const cols = await p.$queryRawUnsafe(
      `SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = '${t}' ORDER BY ordinal_position`,
    );
    console.log("TABLE", t, JSON.stringify(cols));
  }
  const enumVals = await p.$queryRawUnsafe(
    `SELECT enumlabel FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'AchievementCode'`,
  );
  console.log("ENUM_AchievementCode", JSON.stringify(enumVals));
  await p.$disconnect();
})().catch((e) => {
  console.error("ERR", e.message);
  process.exit(1);
});
