import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { achievementService } from "@/features/achievements/services/achievement.service";

/**
 * GET /api/achievements
 * Read every achievement with its locked/unlocked state for the authenticated
 * user. This endpoint is read-only: it never evaluates or persists unlocks.
 * Unlocks are produced exclusively during GitHub sync and XP recalculation.
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
    const achievements = await achievementService.getAchievements(
      session.user.id,
    );

    return NextResponse.json({
      success: true,
      data: achievements,
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    console.error("Failed to load achievements:", error);
    const message =
      error instanceof Error ? error.message : "Failed to load achievements";
    return NextResponse.json(
      { success: false, error: { code: "DATABASE_ERROR", message } },
      { status: 500 },
    );
  }
}
