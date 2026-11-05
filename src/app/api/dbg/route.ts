import { NextResponse } from "next/server";
import { achievementService } from "@/features/achievements/services/achievement.service";
import { githubService } from "@/features/github/services/github.service";

const DEBUG_USER_ID = "cmw29ep970000xcaps4vdwho0";

export async function GET() {
  const definitions = achievementService.getDefinitions();
  const achievements = await achievementService.getAchievements(DEBUG_USER_ID);
  const stats = await githubService.getStats(DEBUG_USER_ID);
  return NextResponse.json({
    definitionsCount: definitions.length,
    achievementsCount: achievements.length,
    unlockedCount: achievements.filter((a) => a.unlocked).length,
    firstKeys: achievements.slice(0, 3).map((a) => a.key),
    stats,
  });
}
