import type { APIRoute } from 'astro';
import { exchangeCodeForToken, getGitHubUser } from '../../../lib/auth';

export const GET: APIRoute = async ({ url, cookies, redirect }) => {
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const storedState = cookies.get('oauth_state')?.value;

  if (!code || !state || state !== storedState) {
    return new Response('Invalid OAuth state', { status: 400 });
  }

  cookies.delete('oauth_state', { path: '/' });

  try {
    const accessToken = await exchangeCodeForToken(code);
    const user = await getGitHubUser(accessToken);

    cookies.set('session', JSON.stringify({
      login: user.login,
      avatar_url: user.avatar_url,
      id: user.id,
      access_token: accessToken,
    }), {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 jours
    });

    const redirectTo = cookies.get('oauth_redirect')?.value || '/';
    cookies.delete('oauth_redirect', { path: '/' });

    return redirect(redirectTo);
  } catch (error) {
    console.error('OAuth callback error:', error);
    return new Response('Authentication failed', { status: 500 });
  }
};
