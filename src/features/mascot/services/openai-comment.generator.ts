// ByteFox OpenAI comment generator (Sprint 8).
//
// Implements the same `CommentGenerator` contract as `RuleBasedCommentGenerator`
// so swapping providers is a config change (`COMMENT_PROVIDER=openai`) rather
// than a code change: context building, persistence, API routes and the
// dashboard stay exactly the same.
//
// The Chat Completions endpoint is called with `fetch` on purpose — no new
// runtime dependency is introduced for a single HTTP call.

import { ACHIEVEMENTS } from "@/lib/constants/achievements";
import { personalityService } from "./personality.service";
import type { CommentGenerator } from "./comment.service";
import type {
  ByteFoxCommentContext,
  ByteFoxCommentDraft,
  CommentType,
  Personality,
} from "../types/mascot.types";

const OPENAI_ENDPOINT = "https://api.openai.com/v1/chat/completions";
const DEFAULT_MODEL = "gpt-4o-mini";
/** Hard ceiling on comment length; the prompt also asks the model to stay short. */
const MAX_WORDS = 80;
const MAX_TOKENS = 160;
const REQUEST_TIMEOUT_MS = 15_000;
/** Streak length that turns a routine update into a streak celebration. */
const STREAK_MINIMUM = 7;

/** Only the part of the Chat Completions response this generator relies on. */
interface ChatCompletionResponse {
  choices?: Array<{
    message?: { content?: string | null } | null;
  } | null> | null;
}

export class OpenAICommentGenerator implements CommentGenerator {
  readonly name = "openai";

  private readonly model = process.env.OPENAI_MODEL?.trim() || DEFAULT_MODEL;

  async generate(context: ByteFoxCommentContext): Promise<ByteFoxCommentDraft> {
    const apiKey = process.env.OPENAI_API_KEY?.trim();
    if (!apiKey) {
      // Thrown rather than swallowed so `ByteFoxCommentService` decides how to
      // degrade (it falls back to the rule-based generator).
      throw new Error(
        "COMMENT_PROVIDER=openai requires the OPENAI_API_KEY env var to be set",
      );
    }

    // Personality comes from the mascot level, same as the rule-based voice, so
    // both providers speak as the same character.
    const personality = personalityService.getPersonality(context.level);
    const type = this.selectType(context);

    const raw = await this.requestComment(apiKey, context, personality, type);

    return {
      type,
      content: this.capWords(raw),
      tone: personality.tone,
    };
  }

  /**
   * Map the context onto the existing `CommentType` set using the same
   * priority as the rule-based engine, so dashboard labels stay meaningful.
   */
  private selectType(context: ByteFoxCommentContext): CommentType {
    if (context.newlyUnlockedAchievements.length > 0) return "MILESTONE";
    if (
      context.previousLevel !== undefined &&
      context.level > context.previousLevel
    ) {
      return "LEVEL_UP";
    }
    if (context.streak >= STREAK_MINIMUM) return "STREAK_ACHIEVEMENT";
    if (context.commits > 0 || context.pullRequests > 0)
      return "COMMIT_COMMENT";
    return "DAILY_GREETING";
  }

  private async requestComment(
    apiKey: string,
    context: ByteFoxCommentContext,
    personality: Personality,
    type: CommentType,
  ): Promise<string> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(OPENAI_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          temperature: 0.8,
          max_tokens: MAX_TOKENS,
          messages: [
            { role: "system", content: this.systemPrompt(personality) },
            { role: "user", content: this.userPrompt(context, type) },
          ],
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const detail = await response.text().catch(() => "");
        throw new Error(
          `OpenAI request failed (${response.status})${detail ? `: ${detail.slice(0, 200)}` : ""}`,
        );
      }

      const payload = (await response.json()) as ChatCompletionResponse;
      const content = payload.choices?.[0]?.message?.content?.trim();
      if (!content) throw new Error("OpenAI returned an empty comment");

      return content;
    } finally {
      clearTimeout(timeout);
    }
  }

  private systemPrompt(personality: Personality): string {
    return [
      `You are ByteFox, a coding mascot currently in its "${personality.title}" form.`,
      personality.description,
      `Speak in a ${personality.tone} voice.`,
      `Write one short, encouraging comment (well under ${MAX_WORDS} words) reacting to the developer's GitHub progress.`,
      'Address the developer as "you". No markdown, no surrounding quotes, at most one emoji.',
    ].join(" ");
  }

  private userPrompt(
    context: ByteFoxCommentContext,
    type: CommentType,
  ): string {
    const lines = [
      `Event: ${type}`,
      `Commits: ${context.commits}`,
      `Pull requests: ${context.pullRequests}`,
      `Level: ${context.level}`,
      `Current streak: ${context.streak} day(s)`,
      `Achievements unlocked: ${context.achievementsUnlocked}`,
    ];

    const titles = this.achievementTitles(context.newlyUnlockedAchievements);
    if (titles.length > 0) lines.push(`Just unlocked: ${titles.join(", ")}`);

    return lines.join("\n");
  }

  private achievementTitles(codes: string[]): string[] {
    return codes.map(
      (code) => ACHIEVEMENTS.find((entry) => entry.key === code)?.title ?? code,
    );
  }

  private capWords(text: string): string {
    const trimmed = text.trim();
    const words = trimmed.split(/\s+/);
    // Ellipsis is glued to the last kept word so the result never exceeds
    // MAX_WORDS whitespace-separated tokens.
    return words.length <= MAX_WORDS
      ? trimmed
      : `${words.slice(0, MAX_WORDS).join(" ")}…`;
  }
}
