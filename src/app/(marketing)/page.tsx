'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ByteFox } from '@/components/mascot/bytefox';
import { Code2, Flame, TrendingUp, Zap } from 'lucide-react';

export default function HomePage() {
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

  const features = [
    {
      icon: Code2,
      title: 'GitHub-Powered',
      description: 'Seamlessly connect your GitHub account to track commits and repositories automatically.',
    },
    {
      icon: Flame,
      title: 'Build Streaks',
      description: 'Turn your GitHub activity into engaging streaks with visual feedback and rewards.',
    },
    {
      icon: TrendingUp,
      title: 'Mascot Growth',
      description: 'Watch Byte grow and evolve as you push code and maintain consistent habits.',
    },
    {
      icon: Zap,
      title: 'Smart Insights',
      description: 'Get AI-powered comments on your coding patterns and progress milestones.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* Hero Section */}
      <motion.section
        className="container mx-auto px-4 py-20 md:py-32"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="flex flex-col items-center text-center space-y-8">
          <motion.div variants={itemVariants}>
            <ByteFox size="lg" className="mb-8" />
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent"
          >
            Meet Byte, Your AI Coding Companion
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-xl md:text-2xl text-muted-foreground max-w-2xl"
          >
            Connect your GitHub account and let Byte track your coding journey. 
            Grow your mascot with every commit, build streaks, and stay motivated.
          </motion.p>

          <motion.div variants={itemVariants} className="flex gap-4 flex-wrap justify-center">
            <Link href="/login">
              <Button size="lg" className="text-lg px-8">
                Connect with GitHub
              </Button>
            </Link>
            <Link href="/about">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Learn More
              </Button>
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section
        className="container mx-auto px-4 py-20"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <motion.h2
          variants={itemVariants}
          className="text-4xl font-bold text-center mb-12"
        >
          Powered by GitHub, Built for Motivation
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardHeader>
                  <feature.icon className="w-12 h-12 text-primary mb-4" />
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        className="container mx-auto px-4 py-20"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-primary/20">
          <CardContent className="p-12 text-center">
            <motion.div variants={itemVariants}>
              <h2 className="text-4xl font-bold mb-4">Ready to Start Your Journey?</h2>
              <p className="text-xl text-muted-foreground mb-8">
                Connect your GitHub account and start growing Byte with every commit.
              </p>
              <Link href="/login">
                <Button size="lg" className="text-lg px-8">
                  Connect with GitHub
                </Button>
              </Link>
            </motion.div>
          </CardContent>
        </Card>
      </motion.section>
    </div>
  );
}
