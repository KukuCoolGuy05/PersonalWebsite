import { useCallback, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from './supabase';

// Without Supabase, editing is enabled only while running `npm run dev`
// (changes then live in this browser's localStorage).
const LOCAL_CAN_EDIT = import.meta.env.DEV;

export function useAdmin() {
  const [state, setState] = useState(() => ({
    ready: !isSupabaseConfigured,
    user: null,
    isAdmin: !isSupabaseConfigured && LOCAL_CAN_EDIT,
  }));

  useEffect(() => {
    if (!isSupabaseConfigured) return undefined;
    let active = true;

    const resolve = async (session) => {
      if (!session) {
        if (active) setState({ ready: true, user: null, isAdmin: false });
        return;
      }
      // is_admin() is defined in supabase/schema.sql; RLS enforces it on every write too.
      const { data, error } = await supabase.rpc('is_admin');
      if (active) setState({ ready: true, user: session.user, isAdmin: !error && data === true });
    };

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      // Defer: awaiting Supabase calls inside this callback can deadlock the auth client.
      setTimeout(() => resolve(session), 0);
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  return { ...state, mode: isSupabaseConfigured ? 'supabase' : 'local', signIn, signOut };
}
