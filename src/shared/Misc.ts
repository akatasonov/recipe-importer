import { URL } from 'url';
import express from 'express';
import { UNPROCESSABLE_ENTITY } from 'http-status-codes';
import util from 'util';
import { logger } from './Logger';

export const paramMissingError = 'One or more of the required parameters was missing.';
export const recipeNameNotFound = 'Recipe name not found.';
export const ingredientsNotFound = 'Ingredients are not found.';
export const cookingStepsNotFound = 'Cooking steps are not found.';
export const scrapingRuleNotFound = 'I don\'t know how to scrape a recipe from this URL, yet.';

export const pErr = (err: Error) => {
    if (err) {
        logger.error(err);
    }
};

export const getRandomInt = () => {
    return Math.floor(Math.random() * 1_000_000_000_000);
};

// This tiny function checks whether the string passed is a valid URL
export const stringIsAValidUrl = (s: string) => {
    try {
      const t = new URL(s);
      return true;
    } catch (err) {
      return false;
    }
};

declare module 'express-serve-static-core' {
  interface Request {
      scrapeRule?: object;
  }
}

// Express middleware to fetch a scraping rule based on the URL parameter
export const recipeMiddleware = (req: express.Request, res: express.Response, next: () => void) => {

  // Check if we have the url GET parameter
  if (!('url' in req.query)) {
    return res.status(UNPROCESSABLE_ENTITY).json({ error: paramMissingError });
  }
  const url = req.query.url;
  // Check if the string passed to the url parameter is a valid URL
  if (!stringIsAValidUrl(url)) {
    return res.status(UNPROCESSABLE_ENTITY).json({
      error: `${url} doesn\'t look like a valid URL. Make sure to include the protocol`,
    });
  }

  // Find the matching scrape rule, if any
  // Load the config. Upon multiple invokations (since it lives in a middleware)
  // a cached version will be served. Not ideal but hopefully not a big performance hit
  // TODO: only load the config once
  const config = require('../../config/default');
  if (url in config) {
    // Direct match
    logger.info('Scrape rule found by direct match');
    req.scrapeRule = config[url];
  } else {
    // Try to a domain match
    const u = new URL(url);
    const topDomainUrl = `${u.hostname}`;
    logger.info(`Scrape rule NOT found by direct match, looking for top level domain match for ${topDomainUrl}`);
    if (topDomainUrl in config) {
      logger.info('Scrape rule found by top level domain match');
      req.scrapeRule = config[topDomainUrl];
    }
  }
  if (!req.scrapeRule) {
    // no matching scrape rule is found
    return res.status(UNPROCESSABLE_ENTITY).json({
      error: scrapingRuleNotFound,
    });
  }

  next();
};
