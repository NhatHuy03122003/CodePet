// ByteFox Comment Engine: rule-based comment generation and persistence.
//
// The engine is deliberately split into two parts:
//   1. A `CommentGenerator` produces a draft from a `ByteFoxCommentContext`.
//   2. `ByteFoxCommentService` gathers the context and persists the draft.
//
// Two generators implement the interface: `RuleBasedCommentGenerator` (default,
// fully offline) and `OpenAICommentGenerator` (Sprint 8, LLM-backed).
// `createCommentGenerator` picks one from the `COMMENT_PROVIDER` env var, so
// switching providers only needs a config change.

import { prisma } from "@/lib/db/prisma";
import { ACHIEVEMENTS } from "@/lib/constants/achievements";
import { githubService } from "@/features/github/services/github.service";
import { growthCalculator } from "./growth-calculator";
import { personalityService } from "./personality.service";
import { OpenAICommentGenerator } from "./openai-comment.generator";
import type {
  ByteFoxCommentContext,
  ByteFoxCommentDraft,
  ByteFoxCommentView,
  CommentType,
  PersonalityId,
} from "../types/mascot.types";

const DAY_MS = 24 * 60 * 60 * 1000;
const STREAK_MINIMUM = 7;

/**
 * Contract implemented by every comment generator. Keeping this minimal is
 * what makes the engine "ready for OpenAI": swap the implementation, keep the
 * surrounding service, API routes and dashboard unchanged.
 */
export interface CommentGenerator {
  readonly name: string;
  generate(
    context: ByteFoxCommentContext,
  ): ByteFoxCommentDraft | Promise<ByteFoxCommentDraft>;
}

function pluralize(count: number, singular: string, plural = `${singular}s`) {
  return count === 1 ? singular : plural;
}

/**
 * One comment voice per personality. Keeping the templates grouped by
 * personality id lets the rule-based generator speak in the right tone without
 * changing the surrounding engine: it still picks a `CommentType`, builds a
 * `ByteFoxCommentDraft` and lets `ByteFoxCommentService` persist it.
 */
interface PersonalityVoice {
  tone: string;
  greeting: string;
  commit: (commits: number, level: number, variant: number) => string;
  pullRequest: (
    commits: number,
    pullRequests: number,
    variant: number,
  ) => string;
  streak: (streak: number) => string;
  levelUp: (level: number, commits: number, pullRequests: number) => string;
  achievement: (titles: string[]) => string;
}

const VOICES: Record<PersonalityId, PersonalityVoice> = {
  BABY: {
    tone: "playful",
    greeting: "Great start! Let's keep learning together!",
    commit: (commits, level, variant) => {
      const base = `${commits} ${pluralize(commits, "commit")} synced!`;
      const variants = [
        `${base} I'm wiggling my tail with excitement!`,
        `${base} We're learning so much, one step at a time!`,
      ];
      return variants[variant % variants.length];
    },
    pullRequest: (commits, pullRequests, variant) => {
      const base = `${pullRequests} ${pluralize(pullRequests, "pull request")} shipped`;
      const extra =
        commits > 0 ? ` with ${commits} ${pluralize(commits, "commit")}` : "";
      const variants = [
        `${base}${extra}! Teamwork makes me so happy!`,
        `${base}${extra}! We're growing together!`,
      ];
      return variants[variant % variants.length];
    },
    streak: (streak) =>
      `${streak}-day streak! You're my hero! Let's keep going!`,
    levelUp: (level) =>
      `Yay! I reached Level ${level}! Let's keep learning together!`,
    achievement: (titles) =>
      titles.length === 1
        ? `Achievement unlocked: ${titles[0]}! I'm doing a happy little dance!`
        : `${titles.length} new achievements: ${titles.join(", ")}! Amazing!`,
  },
  CODER: {
    tone: "motivational",
    greeting: "You're building strong coding momentum.",
    commit: (commits, level, variant) => {
      const base = `${commits} ${pluralize(commits, "commit")} synced`;
      const variants = [
        `${base} — solid, steady progress.`,
        `${base}. You're building strong coding momentum.`,
      ];
      return variants[variant % variants.length];
    },
    pullRequest: (commits, pullRequests, variant) => {
      const base = `${pullRequests} ${pluralize(pullRequests, "pull request")} shipped`;
      const extra =
        commits > 0
          ? ` alongside ${commits} ${pluralize(commits, "commit")}`
          : "";
      const variants = [
        `${base}${extra}. Great collaboration.`,
        `${base}${extra} — clean work, keep shipping.`,
      ];
      return variants[variant % variants.length];
    },
    streak: (streak) =>
      `${streak}-day streak. Consistency is your superpower — stay on it.`,
    levelUp: (level, commits) =>
      `Level ${level} unlocked. Your ${commits} ${pluralize(commits, "commit")} are adding up. Keep building.`,
    achievement: (titles) =>
      titles.length === 1
        ? `New achievement: ${titles[0]}. Momentum looks good on you.`
        : `${titles.length} new achievements: ${titles.join(", ")}. Strong progress.`,
  },
  HACKER: {
    tone: "bold",
    greeting: "Your consistency is paying off. Keep pushing.",
    commit: (commits, level, variant) => {
      const base = `${commits} ${pluralize(commits, "commit")} synced`;
      const variants = [
        `${base}. Sharp work — keep shipping.`,
        `${base}. Your consistency is paying off. Keep pushing.`,
      ];
      return variants[variant % variants.length];
    },
    pullRequest: (commits, pullRequests, variant) => {
      const base = `${pullRequests} ${pluralize(pullRequests, "pull request")} out the door`;
      const extra =
        commits > 0 ? ` plus ${commits} ${pluralize(commits, "commit")}` : "";
      const variants = [
        `${base}${extra}. That's throughput.`,
        `${base}${extra}. Fast and clean — push further.`,
      ];
      return variants[variant % variants.length];
    },
    streak: (streak) =>
      `${streak} days straight. Unstoppable. Don't break the chain.`,
    levelUp: (level) =>
      `Level ${level}. Faster, sharper, stronger. Keep pushing.`,
    achievement: (titles) =>
      titles.length === 1
        ? `Achievement: ${titles[0]}. Push further.`
        : `${titles.length} new achievements: ${titles.join(", ")}. Now go harder.`,
  },
  MASTER: {
    tone: "wise",
    greeting: "Excellence comes from disciplined practice.",
    commit: (commits, level, variant) => {
      const base = `${commits} ${pluralize(commits, "commit")} synced`;
      const variants = [
        `${base}. Steady practice builds mastery.`,
        `${base}. Excellence comes from disciplined practice.`,
      ];
      return variants[variant % variants.length];
    },
    pullRequest: (commits, pullRequests, variant) => {
      const base = `${pullRequests} ${pluralize(pullRequests, "pull request")} shipped`;
      const extra =
        commits > 0 ? ` with ${commits} ${pluralize(commits, "commit")}` : "";
      const variants = [
        `${base}${extra}. Collaboration is a craft.`,
        `${base}${extra}. Mastery is built with others.`,
      ];
      return variants[variant % variants.length];
    },
    streak: (streak) =>
      `${streak} days of discipline. Mastery is built one day at a time.`,
    levelUp: (level) =>
      `Level ${level} reached. Wisdom comes from consistent effort.`,
    achievement: (titles) =>
      titles.length === 1
        ? `Achievement: ${titles[0]}. A milestone on a long road.`
        : `${titles.length} new achievements: ${titles.join(", ")}. A fine chapter.`,
  },
};

/**
 * Deterministic, stats-driven comment generator. No network calls: comments
 * are selected from templates using the user's GitHub counters, mascot level,
 * streak and freshly unlocked achievements.
 */
export class RuleBasedCommentGenerator implements CommentGenerator {
  readonly name = "rule-based";

  generate(context: ByteFoxCommentContext): ByteFoxCommentDraft {
    const { commits, pullRequests, level, streak, newlyUnlockedAchievements } =
      context;

    // The personality is derived from the mascot level and selects the voice
    // (copy + tone) every comment is written in (Sprint 7).
    const voice = VOICES[personalityService.getPersonalityId(level)];

    // Priority: achievements -> level -> streak -> pull requests -> commits.
    if (newlyUnlockedAchievements.length > 0) {
      return {
        type: "MILESTONE",
        content: voice.achievement(
          this.achievementTitles(newlyUnlockedAchievements),
        ),
        tone: voice.tone,
      };
    }

    if (context.previousLevel !== undefined && level > context.previousLevel) {
      return {
        type: "LEVEL_UP",
        content: voice.levelUp(level, commits, pullRequests),
        tone: voice.tone,
      };
    }

    if (streak >= STREAK_MINIMUM) {
      return {
        type: "STREAK_ACHIEVEMENT",
        content: voice.streak(streak),
        tone: voice.tone,
      };
    }

    if (pullRequests > 0) {
      return {
        type: "COMMIT_COMMENT",
        content: voice.pullRequest(
          commits,
          pullRequests,
          commits + pullRequests,
        ),
        tone: voice.tone,
      };
    }

    if (commits > 0) {
      return {
        type: "COMMIT_COMMENT",
        content: voice.commit(commits, level, commits),
        tone: voice.tone,
      };
    }

    return {
      type: "DAILY_GREETING",
      content: voice.greeting,
      tone: voice.tone,
    };
  }

  private achievementTitles(codes: string[]): string[] {
    return codes.map(
      (code) => ACHIEVEMENTS.find((entry) => entry.key === code)?.title ?? code,
    );
  }
}

export interface GenerateOptions {
  /** Overrides the tone produced by the generator (used by the REST API). */
  tone?: string;
}

export interface CommentPage {
  comments: ByteFoxCommentView[];
  total: number;
}

export class ByteFoxCommentService {
  constructor(
    private readonly generator: CommentGenerator = new RuleBasedCommentGenerator(),
    private readonly fallback: CommentGenerator = new RuleBasedCommentGenerator(),
  ) {}

  /**
   * Name of the active generator. Exposed so callers / diagnostics can tell
   * whether comments are rule-based or AI generated.
   */
  get generatorName(): string {
    return this.generator.name;
  }

  /**
   * Collect the current context from the database. GitHub counters come from
   * stored activity, level from the mascot record and the streak from daily
   * activity rows. No feature services are imported to avoid dependency
   * cycles (achievements and mascot both depend on this module's callers).
   */
  async buildContext(
    userId: string,
    overrides: Partial<ByteFoxCommentContext> = {},
  ): Promise<ByteFoxCommentContext> {
    const [stats, mascot, streak, achievementsUnlocked] = await Promise.all([
      githubService.getStats(userId),
      prisma.mascot.findUnique({
        where: { userId },
        select: { experience: true },
      }),
      this.getCurrentStreak(userId),
      prisma.userAchievement.count({ where: { userId } }),
    ]);

    const level = mascot
      ? growthCalculator.calculateLevel(mascot.experience)
      : 1;

    return {
      commits: stats.commits,
      pullRequests: stats.pullRequests,
      issues: stats.issues,
      level,
      streak,
      achievementsUnlocked,
      newlyUnlockedAchievements: [],
      ...overrides,
    };
  }

  /**
   * Generate a comment from the current context and persist it. Callers that
   * already know the context (e.g. the GitHub sync route) can pass overrides
   * to avoid re-deriving it.
   */
  async generateAndStore(
    userId: string,
    overrides: Partial<ByteFoxCommentContext> = {},
    options: GenerateOptions = {},
  ): Promise<ByteFoxCommentView> {
    const context = await this.buildContext(userId, overrides);
    const draft = await this.generateDraft(context);

    return this.persist(userId, draft, options.tone);
  }

  /**
   * Run the active generator. When a remote provider fails (missing key,
   * network error, outage) fall back to the offline rule-based generator so
   * comment generation never breaks the sync/API routes.
   */
  private async generateDraft(
    context: ByteFoxCommentContext,
  ): Promise<ByteFoxCommentDraft> {
    try {
      return await this.generator.generate(context);
    } catch (error) {
      if (this.generator === this.fallback) throw error;
      console.error(
        `ByteFox comment generation via "${this.generator.name}" failed; falling back to "${this.fallback.name}".`,
        error,
      );
      return this.fallback.generate(context);
    }
  }

  /**
   * Detect a personality transition between two mascot levels and, when the
   * character changes (e.g. Level 5 -> 6, 10 -> 11, 20 -> 21), record an
   * evolution event as a comment. Reuses the existing Comment infrastructure,
   * so no schema change or new table is required.
   *
   * Returns the stored comment, or null when the personality did not change.
   */
  async recordPersonalityEvolution(
    userId: string,
    previousLevel: number,
    newLevel: number,
  ): Promise<ByteFoxCommentView | null> {
    if (newLevel <= previousLevel) return null;

    const previous = personalityService.getPersonality(previousLevel);
    const next = personalityService.getPersonality(newLevel);
    if (previous.id === next.id) return null;

    return this.persist(userId, {
      type: "LEVEL_UP",
      content: `🦊 ByteFox evolved into ${next.title}!`,
      tone: next.tone,
    });
  }

  /**
   * Persist a comment draft against the user's mascot. Shared by regular
   * comment generation and personality evolution events.
   */
  private async persist(
    userId: string,
    draft: ByteFoxCommentDraft,
    toneOverride?: string,
  ): Promise<ByteFoxCommentView> {
    const mascotId = await this.getOrCreateMascotId(userId);

    const comment = await prisma.comment.create({
      data: {
        mascotId,
        type: draft.type,
        content: draft.content,
        tone: toneOverride ?? draft.tone,
      },
    });

    return this.toView(comment);
  }

  /**
   * Most recent comments for a user, newest first.
   */
  async getRecentComments(
    userId: string,
    limit = 10,
    options: { offset?: number; type?: CommentType } = {},
  ): Promise<CommentPage> {
    const mascot = await prisma.mascot.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!mascot) return { comments: [], total: 0 };

    const where = {
      mascotId: mascot.id,
      ...(options.type ? { type: options.type } : {}),
    };

    const [rows, total] = await Promise.all([
      prisma.comment.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: options.offset ?? 0,
      }),
      prisma.comment.count({ where }),
    ]);

    return { comments: rows.map((row) => this.toView(row)), total };
  }

  /**
   * The single latest comment, used by the dashboard card.
   */
  async getLatestComment(userId: string): Promise<ByteFoxCommentView | null> {
    const { comments } = await this.getRecentComments(userId, 1);
    return comments[0] ?? null;
  }

  private async getOrCreateMascotId(userId: string): Promise<string> {
    const mascot = await prisma.mascot.upsert({
      where: { userId },
      update: {},
      create: { userId },
      select: { id: true },
    });
    return mascot.id;
  }

  private toView(comment: {
    id: string;
    type: CommentType;
    content: string;
    tone: string;
    createdAt: Date;
  }): ByteFoxCommentView {
    return {
      id: comment.id,
      type: comment.type,
      content: comment.content,
      tone: comment.tone,
      createdAt: comment.createdAt.toISOString(),
    };
  }

  /**
   * Current consecutive-day streak derived from stored daily activity. The
   * streak is anchored to today (or yesterday, before today's activity lands).
   */
  private async getCurrentStreak(userId: string): Promise<number> {
    const activities = await prisma.activity.findMany({
      where: { userId },
      select: { date: true },
    });
    if (activities.length === 0) return 0;

    const activeDays = new Set(
      activities.map((activity) => toDateKey(activity.date)),
    );

    let cursor = toUtcDate(new Date());
    if (!activeDays.has(toDateKey(cursor))) {
      cursor = new Date(cursor.getTime() - DAY_MS);
      if (!activeDays.has(toDateKey(cursor))) return 0;
    }

    let streak = 0;
    while (activeDays.has(toDateKey(cursor))) {
      streak += 1;
      cursor = new Date(cursor.getTime() - DAY_MS);
    }

    return streak;
  }
}

function toUtcDate(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

function toDateKey(date: Date): string {
  return toUtcDate(date).toISOString().slice(0, 10);
}

/** Comment providers selectable via the `COMMENT_PROVIDER` env var. */
export type CommentProvider = "rule" | "openai";

/**
 * Resolve the active provider from `COMMENT_PROVIDER`. Anything other than
 * "openai" (unset, "rule", unknown values) resolves to the offline engine.
 */
export function resolveCommentProvider(
  value: string | undefined = process.env.COMMENT_PROVIDER,
): CommentProvider {
  return value?.trim().toLowerCase() === "openai" ? "openai" : "rule";
}

/** Build the comment generator for a provider. */
export function createCommentGenerator(
  provider: CommentProvider = resolveCommentProvider(),
): CommentGenerator {
  return provider === "openai"
    ? new OpenAICommentGenerator()
    : new RuleBasedCommentGenerator();
}

export const bytefoxCommentService = new ByteFoxCommentService(
  createCommentGenerator(),
);
