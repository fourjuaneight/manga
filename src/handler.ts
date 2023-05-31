import { Context } from 'hono';

import { getDetails } from './mangadex';
import { version } from '../package.json';

interface DetailsPayload {
  key: string;
  url: string;
}

export const handleDetails = async (ctx: Context) => {
  const authKey = ctx.env.AUTH_KEY;

  try {
    const { key, url } = await ctx.req.json<DetailsPayload>();

    if (!key) {
      ctx.status(400);
      return ctx.json({
        error: "Missing 'Key' header.",
        version,
      });
    }
    if (key !== authKey) {
      ctx.status(400);
      return ctx.json({
        error: "You're not authorized to access this API.",
        version,
      });
    }

    const id = url.replace(/(https?:\/\/[^/]+\/title\/)([a-f0-9-]+)/g, '$1');
    const data = await getDetails(ctx, id);

    ctx.status(200);

    return ctx.json({
      data,
      version,
    });
  } catch (error) {
    ctx.status(500);
    console.log({ error, version });
    return ctx.json({ error, version });
  }
};
