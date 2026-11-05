import { prisma } from '@/lib/db/prisma';
import type { User } from '@prisma/client';
import type { GitHubProfile } from '../types/auth.types';

export class AuthService {
  /**
   * Create or update user from GitHub profile
   */
  async upsertUser(githubProfile: GitHubProfile, accessToken?: string): Promise<User> {
    // [AUTH DEBUG] temporary logging
    console.log('[AUTH DEBUG] typeof githubProfile.id:', typeof githubProfile.id);
    console.log('[AUTH DEBUG] githubProfile.id:', githubProfile.id);

    const user = await prisma.user.upsert({
      where: { githubId: githubProfile.id },
      update: {
        email: githubProfile.email || undefined,
        name: githubProfile.name || undefined,
        image: githubProfile.avatar_url || undefined,
        githubUsername: githubProfile.login,
        githubToken: accessToken || undefined,
        updatedAt: new Date(),
      },
      create: {
        githubId: githubProfile.id,
        email: githubProfile.email || undefined,
        name: githubProfile.name || undefined,
        image: githubProfile.avatar_url || undefined,
        githubUsername: githubProfile.login,
        githubToken: accessToken || undefined,
      },
    });

    return user;
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id: userId },
    });
  }

  /**
   * Get user by GitHub ID
   */
  async getUserByGitHubId(githubId: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { githubId },
    });
  }

  /**
   * Store GitHub token (already stored in upsertUser)
   */
  async storeGitHubToken(userId: string, token: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { githubToken: token },
    });
  }

  /**
   * Retrieve GitHub token
   */
  async getGitHubToken(userId: string): Promise<string | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { githubToken: true },
    });
    return user?.githubToken || null;
  }

  /**
   * Update user profile
   */
  async updateUser(userId: string, data: Partial<Pick<User, 'name' | 'email' | 'image'>>): Promise<User> {
    return prisma.user.update({
      where: { id: userId },
      data,
    });
  }

  /**
   * Delete user account
   */
  async deleteUser(userId: string): Promise<void> {
    await prisma.user.delete({
      where: { id: userId },
    });
  }
}

export const authService = new AuthService();
