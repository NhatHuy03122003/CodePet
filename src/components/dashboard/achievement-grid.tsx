'use client';

import { motion } from 'framer-motion';
import { Flame, GitCommit, GitPullRequest, Lock, Zap } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { AchievementProgress } from '@/features/achievements/types/achievement.types';
import type { AchievementCategory } from '@/lib/constants/achievements';

const CATEGORY_META: Record<
  AchievementCategory,
  { label: string; icon: typeof GitCommit }
> = {
  commits: { label: 'Commits', icon: GitCommit },
  pullRequests: { label: 'Pull Requests', icon: GitPullRequest },
  streak: { label: 'Streak', icon: Flame },
  level: { label: 'Level', icon: Zap },
};

const CATEGORY_ORDER: AchievementCategory[] = [
  'commits',
  'pullRequests',
  'streak',
  'level',
];

interface AchievementGridProps {
  achievements: AchievementProgress[];
  isLoading?: boolean;
}

export function AchievementGrid({
  achievements,
  isLoading = false,
}: AchievementGridProps) {
  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-500" />
          Achievements
        </CardTitle>
        <CardDescription>
          {isLoading
            ? 'Loading your badges...'
            : `${unlockedCount} of ${achievements.length} unlocked`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {CATEGORY_ORDER.map((category) => {
          const meta = CATEGORY_META[category];
          const items = achievements.filter((a) => a.category === category);
          if (items.length === 0) return null;

          return (
            <div key={category}>
              <div className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <meta.icon className="h-4 w-4" />
                {meta.label}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {items.map((achievement, index) => (
                  <motion.div
                    key={achievement.key}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-4 rounded-lg border ${
                      achievement.unlocked
                        ? 'bg-primary/10 border-primary/20'
                        : 'bg-muted/30 border-muted'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          achievement.unlocked ? 'bg-primary' : 'bg-muted'
                        }`}
                      >
                        {achievement.unlocked ? (
                          <meta.icon className="h-5 w-5 text-primary-foreground" />
                        ) : (
                          <Lock className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4
                          className={`font-semibold text-sm ${
                            achievement.unlocked ? '' : 'text-muted-foreground'
                          }`}
                        >
                          {achievement.title}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {achievement.description}
                        </p>
                        {achievement.unlocked && achievement.unlockedAt && (
                          <p className="text-xs text-primary mt-1">
                            Unlocked{' '}
                            {new Date(achievement.unlockedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
