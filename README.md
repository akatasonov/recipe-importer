# Recipe Importer
### Intro
Jumbo relies to a large degree on inspecting and interacting with the DOM.
This exercise is meant to have a well-defined scope and yet be similar to the type of work we do on an every-day basis.

### Exercise
While our JavaScript code runs on users' mobile devices, for the purpose of this exercise, we want you to expose this work as an API endpoint. Use any web-framework you wish.

Create an API endpoint that takes a single parameter URL and returns JSON data representing the recipe of the passed parameter.

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
- https://cooking.nytimes.com/recipes/1017518-panzanella-with-mozzarella-and-herbs (Should be possible despite pay-wall)
- https://www.eatthelove.com/cookies-and-cream-cookies/
- https://www.maangchi.com/recipe/bugeopo-gochujang-muchim
- http://www.laurainthekitchen.com/recipes/croque-madam/

### Solution
At a glance there are multiple ways to solve this problem.

#### Parsing HTML server-side
The most simple way to solve this exercise is to parse the HTML response of the web server as-is. For example we might use Cheerio.js to query the HTML in jQuery-like style or use htmlparser2. However we know that these days a significant portion of web sites on the Internet require JavaScript, some won't even render anything if JavaScript is disabled. Obviously just parsing HTML response from a HTTP request doesn't look like a good solution and it is likely that even if it works now with the websites above it might stop working anytime because of lack of JS execution.

#### Executing a website on the server-side with a headless browser
This is a more elegant and flexible solution than the one above, since it allows any website to "render" (though render is not a correct term in a headless browser environment) as it would do in a normal desktop browser. This approach supports working with the HTML of any website on the Internet, independent of how complex a website is.
The only drawback of this solution, comparing to the parsing HTML returned by the web server, is speed. A headless browser takes time (and CPU/memory resources) to download the HTML and all the page assets, run JavaScript (which in turn can lead to more assets being downloaded and parsed) and finally get a DOM representation of a web page. Usually it takes several seconds, sometimes even longer than 10s (for web pages full of adware JS and tracking scripts) for the DOM to finalize. However, since we don't have any performance goals for this exercise, we're going to bear with it.

#### Ways to find the content we're looking for on a web page
There are several ways we can solve the problem of figuring out where to look for specific content (recipe name, ingredients, cooking steps, etc) on a web page:

  - use regular expressions to find matches
    - regular expressions are hard to read and can be quite complicated
    - this approach is fragile because regular expressions treat everything as a stream of text and they don't have any understanding of the DOM
  - use CSS selectors
    - simpler to write than regular expressions
    - however, are they flexible enough? CSS also doesn't capture the DOM structure
  - use XPath expressions
    - syntax is just a bit more complicated than CSS selectors, but much better than regular expressions
    - great flexibility, any node in an HTML/DOM document can be found using an XPath expression
    - captures relationships between elements in DOM fully

#### A quick summary
So lets sum it up: we're going to use a headless browser to process an URL and we're going to use XPath expressions, specific to each website, to find the content we're looking for.