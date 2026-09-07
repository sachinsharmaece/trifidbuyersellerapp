import type { MeResponse } from './dto';

/**
 * ST-10 — an unapproved or rejected counterparty is sent to the gate screen
 * and nothing else, whatever their kind.
 *
 * RECOMMENDATION — NOT A CLIENT DECISION: the SSOT does not yet say which
 * home a `kind: 'both'` firm lands on (buyer-only and seller-only content
 * both being placeholders until M4/M5 makes this moot in practice). This
 * defaults a `both` firm to the buyer home rather than inventing a chooser
 * screen; worth confirming with the client before M4.
 */
export function routeForMe(me: MeResponse): string {
  if (me.status !== 'active') return '/pending';
  if (me.kind === 'seller') return '/seller';
  return '/buyer';
}
