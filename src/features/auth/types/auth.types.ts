/**
 * Authentication-related type definitions
 */

export interface GitHubProfile {
  id: string;
  login: string;
  name?: string | null;
  email?: string | null;
  avatar_url?: string | null;
}

export interface AuthSession {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    githubUsername: string | null;
  };
  expires: string;
}

export interface AuthError {
  code: string;
  message: string;
}
