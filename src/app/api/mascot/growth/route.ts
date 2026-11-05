import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { githubService } from "@/features/github/services/github.service";
import { mascotService } from "@/features/mascot/services/mascot.service";
import { achievementService } from "@/features/achievements/services/achievement.service";
import type { MascotProgress } from "@/features/mascot/types/mascot.types";

/**
 * Recalculate the mascot XP/level from the user's stored GitHub activity
 * counts and return the resulting growth snapshot.
 */
async function recalculateGrowth(userId: string): Promise<MascotProgress> {
  const stats = await githubService.getStats(userId);
  const mascot = await mascotService.recalculateProgress(userId, {
    commits: stats.commits,
    pullRequests: stats.pullRequests,
    issues: stats.issues,
  });
  return mascotService.toProgress(mascot);
}

/**
 * GET /api/mascot/growth
 * Return the current XP, level and progression for the authenticated user.
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      {
        success: false,
        error: { code: "UNAUTHORIZED", message: "Authentication required" },
      },
      { status: 401 },
    );
  }

  try {
    const growth = await recalculateGrowth(session.user.id);

    return NextResponse.json({
      success: true,
      data: growth,
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    console.error("Failed to load mascot growth:", error);
    const message =
      error instanceof Error ? error.message : "Failed to load mascot growth";
    return NextResponse.json(
      { success: false, error: { code: "DATABASE_ERROR", message } },
      { status: 500 },
    );
  }
}

/**
 * POST /api/mascot/growth
 * Force a recalculation of the mascot XP/level from stored GitHub activity.
 */
export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      {
        success: false,
        error: { code: "UNAUTHORIZED", message: "Authentication required" },
      },
      { status: 401 },
    );
  }

  try {
    const growth = await recalculateGrowth(session.user.id);

    // XP recalculation is an authorised unlock point: evaluate achievements
    // against the freshly recalculated level.
    const newlyUnlockedAchievements = await achievementService.recalculate(
      session.user.id,
    );

    return NextResponse.json({
      success: true,
      data: growth,
      meta: { timestamp: new Date().toISOString(), newlyUnlockedAchievements },
    });
  } catch (error) {
    console.error("Failed to recalculate mascot growth:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Failed to recalculate mascot growth";
    return NextResponse.json(
      { success: false, error: { code: "DATABASE_ERROR", message } },
      { status: 500 },
    );
  }
}
