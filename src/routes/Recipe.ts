import { logger } from '@shared';
import { Request, Response, Router } from 'express';
import { BAD_REQUEST, OK } from 'http-status-codes';
import { paramMissingError, stringIsAValidUrl, scrapingRuleNotFound } from '@shared';
import { DefaultCrawler } from '@crawlers';

// Init shared
const router = Router();

/******************************************************************************
 *                      Get a recipe - "GET /recipe"
 ******************************************************************************/

router.get('/', async (req: Request, res: Response) => {
    // We're using recipe middleware which makes sure:
    // - there is a 'url' GET parameter
    // - it is a valid URL
    // - there is a matching scrape rule for that URL
    try {
        const url = req.query.url;
        const crawler = new DefaultCrawler(url);
        const recipe = await crawler.crawl(req.scrapeRule).catch((err) => {
            throw err;
        });

        return res.status(OK).json(recipe);
    } catch (err) {
        logger.error(err.message, err);
        return res.status(BAD_REQUEST).json({
            error: err.message,
        });
    }
});

/******************************************************************************
 *                                     Export
 ******************************************************************************/

export default router;
