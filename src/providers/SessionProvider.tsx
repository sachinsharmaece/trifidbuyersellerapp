'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { getMe, logout as logoutRequest, refreshSession } from '../lib/identityApi';
import { ApiError } from '../lib/apiErrors';
import type { MeResponse } from '../lib/dto';

type SessionStatus = 'loading' | 'authenticated' | 'anonymous';

interface SessionContextValue {
  status: SessionStatus;
  me: MeResponse | null;
  applySession: (accessToken: string, me: MeResponse) => void;
  logout: () => Promise<void>;
  // Wraps any authenticated API call: on a REAUTH_REQUIRED it attempts one
  // silent refresh and retries once, then gives up — never an infinite loop
  // (ARCHITECTURE.md §M2 frontend scope, mirrored from trifid-adminapp).
  callApi: <T>(fn: (accessToken: string) => Promise<T>) => Promise<T>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<SessionStatus>('loading');
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [me, setMe] = useState<MeResponse | null>(null);

  const clearSession = useCallback(() => {
    setAccessToken(null);
    setMe(null);
    setStatus('anonymous');
  }, []);

  const applySession = useCallback((token: string, profile: MeResponse) => {
    setAccessToken(token);
    setMe(profile);
    setStatus('authenticated');
  }, []);

  // On first load, try to restore a session from the httpOnly refresh
  // cookie — never from localStorage (TD-006: shared shop devices).
  useEffect(() => {
    let cancelled = false;
    refreshSession()
      .then(async (result) => {
        if (cancelled) return;
        const profile = await getMe(result.accessToken);
        if (cancelled) return;
        applySession(result.accessToken, profile);
      })
      .catch(() => {
        if (!cancelled) clearSession();
      });
    return () => {
      cancelled = true;
    };
  }, [applySession, clearSession]);

  const logout = useCallback(async () => {
    if (accessToken) {
      await logoutRequest(accessToken).catch(() => undefined);
    }
    clearSession();
  }, [accessToken, clearSession]);

  const callApi = useCallback(
    async <T,>(fn: (token: string) => Promise<T>): Promise<T> => {
      if (!accessToken) {
        clearSession();
        throw new ApiError({ code: 'REAUTH_REQUIRED', message: 'Sign in to continue.' });
      }
      try {
        return await fn(accessToken);
      } catch (error) {
        if (!(error instanceof ApiError) || error.code !== 'REAUTH_REQUIRED') {
          throw error;
        }
        try {
          const refreshed = await refreshSession();
          setAccessToken(refreshed.accessToken);
          return await fn(refreshed.accessToken);
        } catch {
          clearSession();
          throw error;
        }
      }
    },
    [accessToken, clearSession],
  );

  const value = useMemo<SessionContextValue>(
    () => ({ status, me, applySession, logout, callApi }),
    [status, me, applySession, logout, callApi],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used inside a SessionProvider');
  }
  return context;
}
