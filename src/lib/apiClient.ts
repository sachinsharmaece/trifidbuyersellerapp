import { env } from './env';
import { ApiError, type ErrorCode } from './apiErrors';

interface Envelope<T> {
  data: T;
  meta: { correlationId: string; nextCursor?: string };
}

interface ErrorEnvelope {
  error: {
    code: ErrorCode;
    message_en: string;
    message_hi?: string;
    field?: string;
    retryable?: boolean;
    correlationId?: string;
  };
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  accessToken?: string;
}

/**
 * One low-level fetch wrapper. It only knows how to talk the API_CONTRACT.md
 * §1 envelope — it does not know about sessions, refresh, or redirects. See
 * providers/SessionProvider.tsx for the layer that reacts to a
 * REAUTH_REQUIRED by attempting a silent refresh (TD-006).
 */
export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${env.apiBaseUrl}${path}`, {
      method: options.method ?? 'GET',
      credentials: 'include', // sends the httpOnly refresh-token cookie
      headers: {
        'Content-Type': 'application/json',
        ...(options.accessToken ? { Authorization: `Bearer ${options.accessToken}` } : {}),
      },
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    throw new ApiError({
      code: 'NETWORK_ERROR',
      message: 'Could not reach the server. Check your connection and try again.',
      messageHi: 'सर्वर तक नहीं पहुँच सके। अपना कनेक्शन जाँचें और फिर कोशिश करें।',
      retryable: true,
    });
  }

  const json = (await response.json().catch(() => null)) as Envelope<T> | ErrorEnvelope | null;

  if (!response.ok || !json || 'error' in json) {
    const error = json && 'error' in json ? json.error : null;
    throw new ApiError({
      code: error?.code ?? 'INTERNAL_ERROR',
      message: error?.message_en ?? 'Something went wrong. Please try again.',
      messageHi: error?.message_hi ?? 'कुछ गड़बड़ हो गई। कृपया फिर कोशिश करें।',
      field: error?.field,
      retryable: error?.retryable ?? response.status >= 500,
      correlationId: error?.correlationId,
    });
  }

  return json.data;
}
