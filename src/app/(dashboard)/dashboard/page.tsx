"use client";

import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ByteFox } from "@/components/mascot/bytefox";
import {
  CircleDot,
  Flame,
  GitCommit,
  Github,
  GitPullRequest,
  RefreshCw,
  Zap,
} from "lucide-react";
import { useSession } from "@/hooks/use-session";
import { useGithubSync } from "@/features/github/hooks/use-github-sync";
import { useMascot } from "@/features/mascot/hooks/use-mascot";
import { useMascotComments } from "@/features/mascot/hooks/use-mascot-comments";
import { useAchievements } from "@/features/achievements/hooks/use-achievements";
import { AchievementGrid } from "@/components/dashboard/achievement-grid";

const numberFormatter = new Intl.NumberFormat("en-US");

const commentTypeLabels: Record<string, string> = {
  COMMIT_COMMENT: "Code update",
  STREAK_ACHIEVEMENT: "Streak",
  LEVEL_UP: "Level up",
  MILESTONE: "Milestone",
  DAILY_GREETING: "Hello",
};

export default function DashboardPage() {
  const { session } = useSession();
  const {
    stats: githubStats,
    isLoading,
    isSyncing,
    error,
    syncRepositories,
  } = useGithubSync();
  const { mascot, refreshMascot } = useMascot();
  const {
    achievements,
    isLoading: isAchievementsLoading,
    refreshAchievements,
  } = useAchievements();
  const {
    latestComment,
    isLoading: isCommentsLoading,
    refreshComments,
  } = useMascotComments();
  const userName =
    session?.user?.name || session?.user?.email?.split("@")[0] || "Developer";

  const currentLevel = mascot?.level ?? 1;
  const currentXP = mascot?.experience ?? 0;
  const xpToNextLevel = mascot?.xpToNextLevel ?? 100;
  const xpProgress = mascot?.progress ?? 0;
  const personality = mascot?.personality;
  const personalityTitle = personality?.title ?? "Baby Byte";
  const personalityDescription = personality?.description ?? "";
  const personalityTone = personality?.tone ?? "playful";

  const handleSync = async () => {
    await syncRepositories();
    await Promise.all([
      refreshMascot(),
      refreshAchievements(),
      refreshComments(),
    ]);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  const lastSyncedLabel = githubStats?.lastSyncedAt
    ? `Last synced ${new Date(githubStats.lastSyncedAt).toLocaleString()}`
    : "Not synced yet";

  const statCards = [
    {
      icon: Github,
      title: "Repositories",
      value: numberFormatter.format(githubStats?.repositories ?? 0),
      change: lastSyncedLabel,
      positive: true,
    },
    {
      icon: GitCommit,
      title: "Commits",
      value: numberFormatter.format(githubStats?.commits ?? 0),
      change: lastSyncedLabel,
      positive: true,
    },
    {
      icon: GitPullRequest,
      title: "Pull Requests",
      value: numberFormatter.format(githubStats?.pullRequests ?? 0),
      change: lastSyncedLabel,
      positive: true,
    },
    {
      icon: CircleDot,
      title: "Issues",
      value: numberFormatter.format(githubStats?.issues ?? 0),
      change: lastSyncedLabel,
      positive: true,
    },
  ];

  const recentActivity: Array<{
    repo: string;
    message: string;
    time: string;
    type: string;
  }> = [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 p-6">
      <motion.div
        className="container mx-auto max-w-7xl"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div
          variants={itemVariants}
          className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h1 className="text-4xl font-bold mb-2">
              Welcome back, {userName}!
            </h1>
            <p className="text-muted-foreground text-lg">
              Your GitHub activity is fueling Byte&apos;s growth
            </p>
          </div>
          <Button onClick={() => handleSync()} disabled={isSyncing}>
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isSyncing ? "animate-spin" : ""}`}
            />
            {isSyncing ? "Syncing..." : "Sync GitHub"}
          </Button>
        </motion.div>

        {/* Error Banner */}
        {error && (
          <motion.div variants={itemVariants} className="mb-6">
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
              {error.message}
            </div>
          </motion.div>
        )}

        {/* Stats Grid */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {statCards.map((stat, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {isLoading ? "—" : stat.value}
                </div>
                <p
                  className={`text-xs ${stat.positive ? "text-green-500" : "text-red-500"}`}
                >
                  {stat.change}
                </p>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* ByteFox Says */}
        <motion.div variants={itemVariants} className="mb-8">
          <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🦊 ByteFox Says
              </CardTitle>
              <CardDescription>
                Live reactions to your GitHub activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isCommentsLoading ? (
                <p className="text-sm text-muted-foreground">
                  ByteFox is thinking...
                </p>
              ) : latestComment ? (
                <blockquote className="rounded-lg border border-border/60 bg-secondary/40 p-4">
                  <p className="text-base leading-relaxed">
                    {latestComment.content}
                  </p>
                  <footer className="mt-2 text-xs text-muted-foreground">
                    {commentTypeLabels[latestComment.type] ?? "Update"} ·{" "}
                    {new Date(latestComment.createdAt).toLocaleString()}
                  </footer>
                </blockquote>
              ) : (
                <p className="text-sm text-muted-foreground">
                  ByteFox has nothing to say yet. Sync your GitHub to hear from
                  it!
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Mascot Section */}
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  ByteFox Growth
                </CardTitle>
                <CardDescription>
                  Powered by your GitHub commits
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-4">
                <ByteFox size="lg" />
                <div className="w-full text-center space-y-2">
                  <div className="text-2xl font-bold">Level {currentLevel}</div>
                  <div className="text-sm text-muted-foreground">
                    {numberFormatter.format(currentXP)} XP ·{" "}
                    {numberFormatter.format(xpToNextLevel)} XP to next level
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <motion.div
                      className="bg-primary h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${xpProgress}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm font-semibold">
                      Personality: {personalityTitle}
                    </div>
                    {personalityDescription && (
                      <p className="text-xs text-muted-foreground">
                        {personalityDescription}
                      </p>
                    )}
                    <div className="text-xs capitalize text-muted-foreground">
                      Tone: {personalityTone}
                    </div>
                  </div>
                </div>
                <div className="text-sm text-center text-muted-foreground">
                  &quot;Start coding to help me grow! 🚀&quot;
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Activity */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Github className="h-5 w-5" />
                  GitHub Activity
                </CardTitle>
                <CardDescription>
                  Your latest commits from connected repositories
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recentActivity.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Github className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>
                      No activity yet. Click &quot;Sync GitHub&quot; to import
                      your data.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <motion.div
                        key={index}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start space-x-4 p-4 rounded-lg hover:bg-secondary/50 transition-colors"
                      >
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <GitCommit className="h-5 w-5 text-primary" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {activity.message}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {activity.repo}
                          </p>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {activity.time}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Streak Section */}
        <motion.div variants={itemVariants} className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-orange-500" />
                GitHub Contribution Streak
              </CardTitle>
              <CardDescription>
                Your GitHub commit consistency over the last 30 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 30 }).map((_, index) => {
                  const intensity = Math.random();
                  return (
                    <motion.div
                      key={index}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.02 }}
                      className="aspect-square rounded"
                      style={{
                        backgroundColor:
                          intensity > 0.7
                            ? "rgb(34, 197, 94)"
                            : intensity > 0.4
                              ? "rgb(163, 230, 53)"
                              : intensity > 0.2
                                ? "rgb(234, 179, 8)"
                                : "rgb(229, 231, 235)",
                        opacity: intensity === 0 ? 0.3 : 1,
                      }}
                      title={intensity > 0 ? "Commit" : "No commit"}
                    />
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Achievements Section */}
        <motion.div variants={itemVariants} className="mt-6">
          <AchievementGrid
            achievements={achievements}
            isLoading={isAchievementsLoading}
          />
        </motion.div>
      </motion.div>
    </div>
  );
}
