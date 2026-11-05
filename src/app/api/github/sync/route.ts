import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { githubService } from "@/features/github/services/github.service";
import { mascotService } from "@/features/mascot/services/mascot.service";
import { bytefoxCommentService } from "@/features/mascot/services/comment.service";
import { achievementService } from "@/features/achievements/services/achievement.service";
import { syncReposSchema } from "@/lib/validations/github.schema";

/**
 * POST /api/github/sync
 * Manually trigger a full GitHub activity sync for the authenticated user.
 */
export async function POST(req: NextRequest) {
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
    const body = await req.json().catch(() => ({}));
    syncReposSchema.parse(body);

    // Capture the pre-sync level so a level up can be detected afterwards.
    const previousProgress = await mascotService.getProgress(session.user.id);

    const result = await githubService.syncUserActivity(session.user.id);

    // Recalculate the mascot's XP/level from the freshly synced activity.
    const stats = await githubService.getStats(session.user.id);
    const mascot = await mascotService.recalculateProgress(session.user.id, {
      commits: stats.commits,
      pullRequests: stats.pullRequests,
      issues: stats.issues,
    });
    const progress = mascotService.toProgress(mascot);

    // Unlock any achievements newly qualified after the sync.
    const newlyUnlockedAchievements = await achievementService.recalculate(
      session.user.id,
    );

    // Generate and store a fresh ByteFox comment reflecting the post-sync state.
    const bytefoxComment = await bytefoxCommentService.generateAndStore(
      session.user.id,
      {
        commits: stats.commits,
        pullRequests: stats.pullRequests,
        issues: stats.issues,
        level: progress.level,
        previousLevel: previousProgress.level,
        newlyUnlockedAchievements,
      },
    );

    return NextResponse.json({
      success: true,
      data: result,
      meta: {
        timestamp: new Date().toISOString(),
        mascot: progress,
        newlyUnlockedAchievements,
        bytefoxComment,
      },
    });
  } catch (error) {
    console.error("GitHub sync failed:", error);
    const message =
      error instanceof Error ? error.message : "GitHub sync failed";
    return NextResponse.json(
      { success: false, error: { code: "GITHUB_API_ERROR", message } },
      { status: 500 },
    );
  }
}

/**
 * GET /api/github/sync
 * Return the stored GitHub activity counts for the authenticated user.
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
    const stats = await githubService.getStats(session.user.id);

    return NextResponse.json({
      success: true,
      data: stats,
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    console.error("Failed to load GitHub stats:", error);
    const message =
      error instanceof Error ? error.message : "Failed to load GitHub stats";
    return NextResponse.json(
      { success: false, error: { code: "DATABASE_ERROR", message } },
      { status: 500 },
    );
  }
}
