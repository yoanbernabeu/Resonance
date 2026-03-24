import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
  const sessionCookie = context.cookies.get('session')?.value;

  if (sessionCookie) {
    try {
      const session = JSON.parse(sessionCookie);
      context.locals.user = {
        login: session.login,
        avatarUrl: session.avatar_url,
        id: session.id,
        accessToken: session.access_token,
      };
    } catch {
      context.locals.user = null;
    }
  } else {
    context.locals.user = null;
  }

  return next();
});
