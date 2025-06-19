export const OAUTH_STATE_KEY = 'oauth_state';

export function createState(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return (
    Math.random().toString(36).slice(2) +
    Math.random().toString(36).slice(2)
  );
}

export function storeState(state: string) {
  if (typeof sessionStorage === 'undefined') return;
  sessionStorage.setItem(OAUTH_STATE_KEY, state);
}

export function getStoredState(): string | null {
  if (typeof sessionStorage === 'undefined') return null;
  return sessionStorage.getItem(OAUTH_STATE_KEY);
}

export function clearState() {
  if (typeof sessionStorage === 'undefined') return;
  sessionStorage.removeItem(OAUTH_STATE_KEY);
}
