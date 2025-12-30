declare namespace NodeJS {
  interface ProcessEnv {
    /** Supabase URL exposed to the client */
    NEXT_PUBLIC_SUPABASE_URL: string;
    /** Supabase anonymous key exposed to the client */
    NEXT_PUBLIC_SUPABASE_KEY: string;
    /** Optional server-side Supabase URL */
    SUPABASE_URL?: string;
    /** Supabase service role key (server-side only) */
    SUPABASE_SERVICE_ROLE_KEY: string;
    /** Google OAuth client ID (required - only auth provider) */
    AUTH_GOOGLE_ID: string;
    /** Google OAuth client secret (required - only auth provider) */
    AUTH_GOOGLE_SECRET: string;
    /** NextAuth canonical URL */
    NEXTAUTH_URL: string;
    /** NextAuth secret for JWT encryption */
    NEXTAUTH_SECRET: string;
  }
}