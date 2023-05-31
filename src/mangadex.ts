/* eslint-disable camelcase */
import { Context } from 'hono';

import { AuthorResponse, MangaResponse } from './typings';

interface MangaData {
  title: string;
  description: string;
  author: string;
  year: number;
  status: string;
  cover: string;
}

const API = 'https://api.mangadex.org';
const ASSETS = 'https://uploads.mangadex.org';

export const getAuthor = async (ctx: Context, id: string): Promise<string> => {
  try {
    const request = await fetch(`${API}/author/${id}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const response: AuthorResponse = await request.json();

    if (request.status !== 200) {
      console.log(
        `[fetch]: ${request.status} - ${request.statusText}`,
        response
      );
      throw `[fetch]: ${request.status} - ${request.statusText}`;
    }

    const {
      data: { attributes: name },
    } = response;

    return name;
  } catch (error) {
    console.log(`[getAuthor] - ${error}`);
    throw `[getAuthor] - ${error}`;
  }
};

export const getDetails = async (
  ctx: Context,
  id: string
): Promise<MangaData> => {
  try {
    const request = await fetch(
      `${API}/manga/${id}?limit=100&includes%5B%5D=cover_art&includes%5B%5D=scanlation_group&order%5Bvolume%5D=desc&order%5Bchapter%5D=desc&offset=0&contentRating%5B%5D=safe&contentRating%5B%5D=suggestive&contentRating%5B%5D=erotica&contentRating%5B%5D=pornographic&translatedLanguage%5B%5D=en`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    const response: MangaResponse = await request.json();

    if (request.status !== 200) {
      console.log(
        `[fetch]: ${request.status} - ${request.statusText}`,
        response
      );
      throw `[fetch]: ${request.status} - ${request.statusText}`;
    }

    const {
      data: { attributes, relationships },
    } = response;
    const coverFile = relationships?.find(rel => rel.type === 'cover_art')
      ?.attributes?.fileName;
    const author = await getAuthor(ctx, relationships[0].id);

    return {
      title: attributes.title.en,
      description: attributes.description.en,
      author,
      year: attributes.year,
      status: attributes.status,
      cover: `${ASSETS}/covers/${id}/${coverFile}`,
    };
  } catch (error) {
    console.log(`[getDetails] - ${error}`);
    throw `[getDetails] - ${error}`;
  }
};
