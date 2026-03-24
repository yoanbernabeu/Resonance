import type { APIRoute } from 'astro';
import { generateState, getGitHubAuthUrl } from '../../../lib/auth';

export const GET: APIRoute = async ({ cookies, redirect, url }) => {
  const state = generateState();

  cookies.set('oauth_state', state, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 600, // 10 minutes
  });

  const redirectTo = url.searchParams.get('redirect_to') || '/';
  cookies.set('oauth_redirect', redirectTo, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 600,
  });

  return redirect(getGitHubAuthUrl(state));
};
