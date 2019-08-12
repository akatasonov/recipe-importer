# Recipe Importer
### Intro
Jumbo relies to a large degree on inspecting and interacting with the DOM.
This exercise is meant to have a well-defined scope and yet be similar to the type of work we do on an every-day basis.

### Exercise
While our JavaScript code runs on users' mobile devices, for the purpose of this exercise, we want you to expose this work as an API endpoint. Use any web-framework you wish.

Create an API endpoint that takes a single parameter url and returns JSON data representing the recipe of the passed parameter.

#### Request
This is the request that your server should handle.

- Method: GET
- Path: /recipe
- Parameters:
  - url: string
Thus a fully formed URL would look similar to localhost:8080/recipe?url=http%3A%2F%2Fwww.google.com

#### Response
A JSON object with ingredients and steps lists based on the contents of the url page requested. Other parameters may be interesting to include.

Example:

```json
{
  "name": "Barbecue Corn on the Cob",
  "ingredients": [
  {
    "name": "Corn",
    "quantity": 2
  },
  {
    "name": "Butter",
    "quantity": 2,
    "unit": "tbsp"
  }
  ],
  "steps": [
    "Preheat grill to 400°F",
    "Once heated, scrub to clean off any encrusted pieces",
    "Grill corn on high heat for 2 minutes",
    "..."
  ]
}
```

#### Notes
The endpoint should work with the following examples:

https://cooking.nytimes.com/recipes/1017518-panzanella-with-mozzarella-and-herbs (Should be possible despite pay-wall)
https://www.eatthelove.com/cookies-and-cream-cookies/
https://www.maangchi.com/recipe/bugeopo-gochujang-muchim
http://www.laurainthekitchen.com/recipes/croque-madam/
You are welcome to use external libraries.
