Styleguide
===
```
Note: this is not relevant as the package is still not published on NPM.
```
Usage:
---

###Setting up
Firstly install this package locally to your project:
```
npm install styleguide --save-dev
```

Also assure that you have it installed globally:
```
npm install styleguide -g
```

After this is done you can generate your configuration file running `styleguide generate-config` in your project root directory.

Firstly, you'll need to supply your snippet categories delimited by comma, for example:
```
General, Buttons, Navigation
```

In the next step, you can supply URLs to scrape snippets from, but this is optional.

You can supply relative path from your project root to SASS file, where fonts and colors variables are stored.

At next step you'll be asked to supply maximum of iterations to go through SASS variables, this means if references in your SASS file are messed up - the script will just exit after that number of iterations.

Furthermore, you'll be asked to supply relative path from your project root to template for snippets (which will be inserted into iframe). This is optional, but if you want to customize what's inside the iframe feel free to do so.

Finally, all the generated configuration will be printed to terminal and if you confirm - press <kbd>Enter</kbd>.

After these steps there will be created folder structure like this:
```
.
├── styleguide
|   ├── css
|   |   └── main.css
|   ├── db
|   |   ├── Buttons.txt
|   |   ├── General.txt
|   |   ├── Navigation.txt
|   |   ├── sassdata.txt
|   |   ├── undefined.txt
|   |   └── uniques.txt
|   ├── js
|   |   ├── categories.js
|   |   ├── editor.js
|   |   ├── iframes.js
|   |   ├── interact-1.2.4.min.js
|   |   ├── main.js
|   |   ├── sass.js
|   |   ├── snippetActions.js
|   |   ├── snippets.js
|   |   └── views.js
|   └── index.html
└── styleguide_config.txt
```

###Running a server

You can require this package in gulpfile, like this:

```
var styleguide = require('styleguide');
```

And then write a task to start a server:

```
gulp.task('start-styleguide', function () {
  styleguide.startServer(3040);
});
```

The only parameter shows on which port to start Styleguide server.