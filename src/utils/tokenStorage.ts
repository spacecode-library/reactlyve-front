export const TOKEN_KEY = 'token';

export function getToken(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${TOKEN_KEY}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function setToken(token: string, days = 7) {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  let cookie = `${TOKEN_KEY}=${encodeURIComponent(token)}; expires=${expires}; path=/; SameSite=Lax`;
  if (location.protocol === 'https:') {
    cookie += '; Secure';
  }
  document.cookie = cookie;
}

export function removeToken() {
  if (typeof document === 'undefined') return;
  document.cookie =
    `${TOKEN_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax` +
    (location.protocol === 'https:' ? '; Secure' : '');
}
