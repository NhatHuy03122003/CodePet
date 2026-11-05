import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { bytefoxCommentService } from "@/features/mascot/services/comment.service";
import { generateCommentSchema } from "@/lib/validations/mascot.schema";
import type { CommentType } from "@/features/mascot/types/mascot.types";

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

const COMMENT_TYPES: readonly CommentType[] = [
  "COMMIT_COMMENT",
  "STREAK_ACHIEVEMENT",
  "LEVEL_UP",
  "MILESTONE",
  "DAILY_GREETING",
];

function parseCommentType(value: string | null): CommentType | undefined {
  if (!value) return undefined;
  return COMMENT_TYPES.includes(value as CommentType)
    ? (value as CommentType)
    : undefined;
}

/**
 * GET /api/mascot/comments
 * Return the authenticated user's ByteFox comments, newest first.
 */
export async function GET(req: NextRequest) {
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
    const { searchParams } = req.nextUrl;

    const rawLimit = Number.parseInt(searchParams.get("limit") ?? "", 10);
    const limit = Number.isFinite(rawLimit)
      ? Math.min(Math.max(rawLimit, 1), MAX_LIMIT)
      : DEFAULT_LIMIT;

    const rawOffset = Number.parseInt(searchParams.get("offset") ?? "", 10);
    const offset = Number.isFinite(rawOffset) ? Math.max(rawOffset, 0) : 0;

    const type = parseCommentType(searchParams.get("type"));

    const { comments, total } = await bytefoxCommentService.getRecentComments(
      session.user.id,
      limit,
      { offset, type },
    );

    return NextResponse.json({
      success: true,
      data: { comments, pagination: { limit, offset, total } },
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    console.error("Failed to load ByteFox comments:", error);
    const message =
      error instanceof Error ? error.message : "Failed to load comments";
    return NextResponse.json(
      { success: false, error: { code: "DATABASE_ERROR", message } },
      { status: 500 },
    );
  }
}

/**
 * POST /api/mascot/comments
 * Generate and store a new ByteFox comment for the authenticated user.
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
    const input = generateCommentSchema.parse(body);

    const comment = await bytefoxCommentService.generateAndStore(
      session.user.id,
      {},
      { tone: input.tone },
    );

    return NextResponse.json({
      success: true,
      data: comment,
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    console.error("Failed to generate ByteFox comment:", error);
    const message =
      error instanceof Error ? error.message : "Failed to generate comment";
    return NextResponse.json(
      { success: false, error: { code: "COMMENT_ERROR", message } },
      { status: 500 },
    );
  }
}
