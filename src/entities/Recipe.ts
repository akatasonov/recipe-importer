
export interface IIngredient {
  name: string;
  quantity: number;
  unit?: string;
}

export interface IRecipe {
  name: string;
  ingredients: IIngredient[];
  steps: string[];
}

export class Recipe implements IRecipe {

  public name: string;
  public ingredients: IIngredient[];
  public steps: string[];

  constructor(name: string) {
    this.name = name;
    this.ingredients = [];
    this.steps = [];
  }

  public addIngredient(ingredient: IIngredient) {
    this.ingredients.push(ingredient);
  }

  public addStep(step: string) {
    this.steps.push(step);
  }
}
