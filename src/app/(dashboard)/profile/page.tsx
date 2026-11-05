'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ByteFox } from '@/components/mascot/bytefox';
import { Calendar, Github, Mail, MapPin, Trophy, User } from 'lucide-react';

export default function ProfilePage() {
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

  const achievements = [
    { title: 'First Commit', description: 'Made your first commit', unlocked: true },
    { title: 'Week Warrior', description: '7-day streak achieved', unlocked: true },
    { title: 'Code Master', description: '1,000 commits reached', unlocked: true },
    { title: 'Month Master', description: '30-day streak achieved', unlocked: false },
    { title: 'Repository Hero', description: 'Connected 10 repos', unlocked: false },
    { title: 'Byte Level 20', description: 'Reach level 20', unlocked: false },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 p-6">
      <motion.div
        className="container mx-auto max-w-7xl"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Profile</h1>
          <p className="text-muted-foreground text-lg">
            Manage your account and view your achievements
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <Card className="h-full">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <ByteFox size="lg" />
                </div>
                <CardTitle className="text-2xl">John Developer</CardTitle>
                <CardDescription>@johndeveloper</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">john@example.com</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <Github className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">github.com/johndeveloper</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">San Francisco, CA</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Joined January 2024</span>
                </div>
                <div className="pt-4 border-t">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Level</span>
                    <span className="font-bold">12</span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Total XP</span>
                    <span className="font-bold">2,450</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Best Streak</span>
                    <span className="font-bold">21 days</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Edit Profile Form */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Edit Profile</CardTitle>
                <CardDescription>Update your personal information</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" placeholder="John" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" placeholder="Developer" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input id="username" placeholder="johndeveloper" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="john@example.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input id="location" placeholder="San Francisco, CA" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Input
                      id="bio"
                      placeholder="Tell us about yourself..."
                      className="h-24"
                    />
                  </div>
                  <div className="flex justify-end space-x-4">
                    <Button variant="outline">Cancel</Button>
                    <Button>Save Changes</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Achievements Section */}
        <motion.div variants={itemVariants} className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Achievements
              </CardTitle>
              <CardDescription>Your coding milestones and accomplishments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {achievements.map((achievement, index) => (
                  <motion.div
                    key={index}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-4 rounded-lg border ${
                      achievement.unlocked
                        ? 'bg-primary/10 border-primary/20'
                        : 'bg-muted/30 border-muted opacity-50'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          achievement.unlocked ? 'bg-primary' : 'bg-muted'
                        }`}
                      >
                        <Trophy
                          className={`h-5 w-5 ${
                            achievement.unlocked ? 'text-primary-foreground' : 'text-muted-foreground'
                          }`}
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm">{achievement.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {achievement.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Connected Repositories */}
        <motion.div variants={itemVariants} className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Github className="h-5 w-5" />
                Connected Repositories
              </CardTitle>
              <CardDescription>Manage your GitHub connections</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {['codepet/frontend', 'codepet/backend', 'personal/project'].map((repo, index) => (
                  <motion.div
                    key={index}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <Github className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{repo}</p>
                        <p className="text-sm text-muted-foreground">Last synced 2 hours ago</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Sync
                    </Button>
                  </motion.div>
                ))}
                <Button variant="outline" className="w-full">
                  <Github className="mr-2 h-4 w-4" />
                  Connect New Repository
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
