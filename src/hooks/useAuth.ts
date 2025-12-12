'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

interface AuthSession {
  access_token: string;
  user: {
    id: string;
    email?: string;
  };
}

interface UseAuthReturn {
  session: AuthSession | null;
  loading: boolean;
  error: string | null;
  logout: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getSession = async () => {
      try {
        setLoading(true);
        setError(null);

        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const { data, error: authError } = await supabase.auth.getSession();

        if (authError) {
          setError(authError.message);
          setSession(null);
          return;
        }

        if (data.session) {
          setSession({
            access_token: data.session.access_token,
            user: {
              id: data.session.user.id,
              email: data.session.user.email
            }
          });
        } else {
          setSession(null);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setSession(null);
      } finally {
        setLoading(false);
      }
    };

    getSession();
  }, []);

  const logout = async () => {
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      await supabase.auth.signOut();
      setSession(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  return {
    session,
    loading,
    error,
    logout
  };
}
