import { Context } from 'hono';

import { getDetails, MangaData } from './mangadex';
import { version } from '../package.json';

interface DetailsPayload {
  key: string;
  url: string;
}

interface DetailsResponse {
  error?: string;
  data?: MangaData;
  version: string;
}

export const handleDetails = async (ctx: Context) => {
  const authKey = ctx.env.AUTH_KEY;

  try {
    const { key, url } = await ctx.req.json<DetailsPayload>();

    if (!key) {
      ctx.status(400);
      return ctx.json<DetailsResponse>({
        error: "Missing 'Key' header.",
        version,
      });
    }
    if (key !== authKey) {
      ctx.status(400);
      return ctx.json<DetailsResponse>({
        error: "You're not authorized to access this API.",
        version,
      });
    }

    // https://mangadex.org/title/<ID>/<NAME>
    const id = url.replace(/https?:\/\/[^/]+\/title\/([a-f0-9-]+)\/?.*/g, '$1');
    const data = await getDetails(ctx, id, url);

    ctx.status(200);

    return ctx.json<DetailsResponse>({
      data,
      version,
    });
  } catch (error) {
    ctx.status(500);
    console.log({ error, version });
    return ctx.json<DetailsResponse>({ error, version });
  }
};
