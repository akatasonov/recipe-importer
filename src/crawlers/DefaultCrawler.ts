import { logger } from '@shared';
import puppeteer from 'puppeteer';
import { recipeNameNotFound, ingredientsNotFound, cookingStepsNotFound } from '@shared';
import { Recipe, IRecipe } from '@entities';

export class DefaultCrawler {
  private pageUrl: string;

  constructor(pageUrl: string) {
    this.pageUrl = pageUrl;
  }

  /**
   * Crawl the page the crawler has been initialized with
   * Expressions is a JSON document containing the xPath expressions for capturing:
   * - the recipe name
   * - ingredient name
   * - ingredient quantity
   * - ingredient unit (if any)
   * - cooking steps
   * An example document looks like this:
   * {
   *   "recipeName": "",
   *   "ingredient":
   *   {
   *     "name": "",
   *     "quantity": "",
   *     "units": "",
   *   },
   *  "cookingStep": ""
   * }
   */
  public async crawl(expressions: any): Promise<IRecipe> {
    return new Promise(async (resolve, reject) => {
      // Wait for browser launching
      const browser = await puppeteer.launch();
      // Wait for creating the new page
      const page = await browser.newPage();

      // Go to the target page
      logger.info(`Navigating to ${this.pageUrl}`);
      await page.goto(this.pageUrl, {waitUntil: 'networkidle0'}).catch((err) => {
        return reject(err);
      });

      /******************************************************************************
      *                                recipe name
      ******************************************************************************/

      // Eval the recipe name
      logger.info(`Evaluating recipeName using ${expressions.recipeName}`);
      const recipeNameArr = await page.$x(expressions.recipeName).catch((err) => {
        return reject(err);
      });

      if (!recipeNameArr) {
        return reject(new Error(recipeNameNotFound));
      }

      if (!recipeNameArr.length) {
        return reject(new Error(recipeNameNotFound));
      }

      const recipeNameEl = recipeNameArr[0];
      // logger.info(`Retrieving textContent for ${expressions.recipeName}`);
      let recipeName = await page.evaluate((element) => element.textContent, recipeNameEl).catch((err) => {
        return reject(new Error(recipeNameNotFound));
      });

      recipeName = recipeName.trim();

      /******************************************************************************
      *                                ingredients
      ******************************************************************************/

      // Eval the ingredient name
      logger.info(`Evaluating ingredientName using ${expressions.ingredient.name}`);
      const ingredientNamesArr = await page.$x(expressions.ingredient.name).catch((err) => {
        return reject(err);
      });

      if (!ingredientNamesArr) {
        return reject(new Error(ingredientsNotFound));
      }

      if (!ingredientNamesArr.length) {
        return reject(new Error(ingredientsNotFound));
      }

      const ingredientNames = [];
      for (const ingredientNameEl of ingredientNamesArr) {
        let ingredientName = await page.evaluate((element) => element.textContent, ingredientNameEl).catch((err) => {
          return reject(new Error(ingredientsNotFound));
        });
        ingredientName = ingredientName.trim();
        ingredientNames.push(ingredientName);
      }

      // Eval the ingredient quantity
      logger.info(`Evaluating ingredientQuantity using ${expressions.ingredient.quantity}`);
      const ingredientQArr = await page.$x(expressions.ingredient.quantity).catch((err) => {
        return reject(err);
      });

      if (!ingredientQArr) {
        return reject(new Error(ingredientsNotFound));
      }

      if (!ingredientQArr.length) {
        return reject(new Error(ingredientsNotFound));
      }

      const ingredientQs = [];
      for (const ingredientQEl of ingredientQArr) {
        let ingredientQ = await page.evaluate((element) => element.textContent, ingredientQEl).catch((err) => {
          return reject(new Error(ingredientsNotFound));
        });
        ingredientQ = ingredientQ.trim();
        ingredientQs.push(ingredientQ);
      }

      // Eval the ingredient units
      const ingredientUnits = [];
      if (expressions.ingredient.unit) {
        logger.info(`Evaluating ingredientUnit using ${expressions.ingredient.unit}`);
        const ingredientUnitsArr = await page.$x(expressions.ingredient.unit).catch((err) => {
          return reject(err);
        });

        if (!ingredientUnitsArr) {
          return reject(new Error(ingredientsNotFound));
        }

        if (!ingredientUnitsArr.length) {
          return reject(new Error(ingredientsNotFound));
        }

        for (const ingredientUnitEl of ingredientUnitsArr) {
          let ingredientUnit = await page.evaluate((element) => element.textContent, ingredientUnitEl).catch((err) => {
            return reject(new Error(ingredientsNotFound));
          });
          ingredientUnit = ingredientUnit.trim();
          ingredientUnits.push(ingredientUnit);
        }
      }

      /******************************************************************************
      *                               cooking steps
      ******************************************************************************/

      const steps = [];
      logger.info(`Evaluating cookingSteps using ${expressions.cookingStep}`);
      const stepsArr = await page.$x(expressions.cookingStep).catch((err) => {
        return reject(err);
      });

      if (!stepsArr) {
        return reject(new Error(cookingStepsNotFound));
      }

      if (!stepsArr.length) {
        return reject(new Error(cookingStepsNotFound));
      }

      for (const stepEl of stepsArr) {
        let step = await page.evaluate((element) => element.textContent, stepEl).catch((err) => {
          return reject(new Error(cookingStepsNotFound));
        });
        step = step.trim();
        steps.push(step);
      }

      browser.close();

      // Create the recipe object
      const recipe = new Recipe(recipeName);
      for (let i = 0; i < ingredientNames.length; i++) {
        const name = ingredientNames[i];
        const quantity = ingredientQs[i];
        const unit = ingredientUnits[i] ? ingredientUnits[i] : '';
        recipe.addIngredient({ name, quantity, unit });
      }

      for (const step of steps) {
        recipe.addStep(step);
      }

      resolve(recipe);

    });
  }

}
