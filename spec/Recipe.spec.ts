import app from '@server';
import supertest from 'supertest';

import { BAD_REQUEST, UNPROCESSABLE_ENTITY, OK } from 'http-status-codes';
import { Response, SuperTest, Test } from 'supertest';
import { Recipe } from '@entities';
import { pErr, paramMissingError } from '@shared';
import { DefaultCrawler} from '@crawlers';

describe('Recipe Routes', () => {

    const recipePath = '/recipe?url=https://cooking.nytimes.com/recipes/1017518-panzanella-with-mozzarella-and-herbs';
    const recipePathNoParam = '/recipe';

    let agent: SuperTest<Test>;

    beforeAll((done) => {
        agent = supertest.agent(app);
        done();
    });

    describe(`"GET:${recipePath}"`, () => {

        it(`should return a JSON object with recipe name, all the ingredients, steps and a status code of "${OK}" if the
            request was successful.`, (done) => {

            const recipe = new Recipe('Panzanella With Mozzarella and Herbs');
            recipe.addIngredient({
                name: 'ounces ciabatta or baguette, preferably stale, cut into 1-inch cubes (about 3 cups)',
                quantity: '4',
            });
            recipe.addIngredient({
                name: 'tablespoons extra-virgin olive oil, more to taste',
                quantity: '6',
            });
            recipe.addIngredient({
                name: 'teaspoon kosher sea salt, more to taste',
                quantity: '¾',
            });
            recipe.addIngredient({
                name: 'pounds very ripe tomatoes, preferably a mix of varieties and colors',
                quantity: '2',
            });
            recipe.addIngredient({
                name: 'ounces fresh mozzarella, torn or cut into bite-size pieces',
                quantity: '6',
            });
            recipe.addIngredient({
                name: 'cup thinly sliced red onion, about half a small onion',
                quantity: '½',
            });
            recipe.addIngredient({
                name: 'garlic cloves, grated to a paste',
                quantity: '2',
            });
            recipe.addIngredient({
                name: 'tablespoons red wine vinegar, more to taste',
                quantity: '2',
            });
            recipe.addIngredient({
                name: 'tablespoon chopped fresh oregano or thyme (or a combination)',
                quantity: '1',
            });
            recipe.addIngredient({
                name: 'Large pinch red pepper flakes (optional)',
            });
            recipe.addIngredient({
                name: 'teaspoon Dijon mustard',
                quantity: '½',
            });
            recipe.addIngredient({
                name: 'Black pepper, to taste',
            });
            recipe.addIngredient({
                name: 'cup thinly sliced Persian or Kirby cucumber, about 1 small cucumber',
                quantity: '½',
            });
            recipe.addIngredient({
                name: 'cup torn basil leaves',
                quantity: '½',
            });
            recipe.addIngredient({
                name: 'cup flat-leaf parsley leaves, roughly chopped',
                quantity: '¼',
            });
            recipe.addIngredient({
                name: 'tablespoon capers, drained',
                quantity: '1',
            });

            recipe.addStep('Heat oven to 425 degrees. Spread the bread cubes on a rimmed baking sheet and toss with 2 tablespoons oil and a pinch of salt. Bake until they are dried out and pale golden brown at the edges, about 7 to 15 minutes. Let cool on a wire rack.');
            recipe.addStep('Cut tomatoes into bite-size pieces and transfer to a large bowl. Add mozzarella, onions, garlic paste, 1 tablespoon vinegar, oregano or thyme, 1/4 teaspoon salt and the red pepper flakes if using. Toss to coat and set aside.');
            recipe.addStep('In a medium bowl, combine remaining 1 tablespoon vinegar, the mustard, 1/4 teaspoon salt and some black pepper to taste. While whisking constantly, slowly drizzle in the remaining 4 tablespoons olive oil until the mixture is thickened. Stir in cucumbers, basil and parsley.');
            recipe.addStep('Add bread cubes, cucumber mixture and capers to the tomatoes and toss well. Let sit for at least 30 minutes and up to 4 hours before serving. Toss with a little more olive oil, vinegar and salt if needed just before serving.');

            // spyOn(UserDao.prototype, 'getAll').and.returnValue(Promise.resolve(recipe));

            agent.get(recipePath)
                .end((err: Error, res: Response) => {
                    pErr(err);
                    expect(res.status).toBe(OK);
                    // Caste instance-objects to 'Recipe' object
                    const retRecipe = new Recipe('');
                    retRecipe.assignRecipe(res.body);

                    expect(retRecipe).toEqual(recipe);
                    expect(res.body.error).toBeUndefined();
                    done();
                });
        });

        it(`should return a JSON object containing an error message and a status code of
            "${BAD_REQUEST}" if the request was unsuccessful.`, (done) => {

            const errMsg = 'Could not fetch recipe.';
            spyOn(DefaultCrawler.prototype, 'crawl').and.throwError(errMsg);

            agent.get(recipePath)
                .end((err: Error, res: Response) => {
                    pErr(err);
                    expect(res.status).toBe(BAD_REQUEST);
                    expect(res.body.error).toBe(errMsg);
                    done();
                });
        });

        it(`should return a JSON object containing an error message and a status code of
            "${UNPROCESSABLE_ENTITY}" if the required URL parameter is not present.`, (done) => {

            agent.get(recipePathNoParam)
                .end((err: Error, res: Response) => {
                    pErr(err);
                    expect(res.status).toBe(UNPROCESSABLE_ENTITY);
                    expect(res.body.error).toBe(paramMissingError);
                    done();
                });
        });
    });
});
