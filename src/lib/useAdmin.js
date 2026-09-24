import { useCallback, useEffect, useRef, useState } from 'react';
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
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  // Resolves to whether this session may edit. is_admin() is defined in
  // supabase/schema.sql; row-level security enforces it on every write too.
  const resolve = useCallback(async (session) => {
    if (!session) {
      if (mounted.current) setState({ ready: true, user: null, isAdmin: false });
      return false;
    }
    const { data, error } = await supabase.rpc('is_admin');
    const isAdmin = !error && data === true;
    if (mounted.current) setState({ ready: true, user: session.user, isAdmin });
    return isAdmin;
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) return undefined;
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      // Defer: awaiting Supabase calls inside this callback can deadlock the auth client.
      setTimeout(() => resolve(session), 0);
    });
    return () => data.subscription.unsubscribe();
  }, [resolve]);

  // Ask again, e.g. after adding this account to the admins table.
  const recheck = useCallback(async () => {
    if (!isSupabaseConfigured) return state.isAdmin;
    const { data } = await supabase.auth.getSession();
    return resolve(data.session);
  }, [resolve, state.isAdmin]);

  const signIn = useCallback(async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  return { ...state, mode: isSupabaseConfigured ? 'supabase' : 'local', recheck, signIn, signOut };
}
