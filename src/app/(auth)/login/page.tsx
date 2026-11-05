'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ByteFox } from '@/components/mascot/bytefox';
import { Github } from 'lucide-react';

export default function LoginPage() {
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

  const handleGitHubSignIn = async () => {
    await signIn('github', { callbackUrl: '/dashboard' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 flex items-center justify-center p-4">
      <motion.div
        className="w-full max-w-md"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="flex justify-center mb-8">
          <ByteFox size="lg" />
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold">Welcome Back</CardTitle>
              <CardDescription className="text-base">
                Connect with GitHub to continue your coding journey with Byte
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* GitHub OAuth Button */}
              <motion.div variants={itemVariants}>
                <Button
                  className="w-full"
                  variant="outline"
                  size="lg"
                  onClick={handleGitHubSignIn}
                >
                  <Github className="mr-2 h-5 w-5" />
                  Sign in with GitHub
                </Button>
              </motion.div>

              <motion.div variants={itemVariants} className="text-center text-sm">
                <p className="text-muted-foreground">
                  By signing in, you agree to our Terms of Service and Privacy Policy
                </p>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} className="mt-8 text-center">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
            ← Back to home
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
