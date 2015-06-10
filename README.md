Styleguide
===
Usage:
---

###Setting up

Firstly install this package locally to your project:
```
npm install devbridge-styleguide --save-dev
```

Also assure that you have it installed globally:
```
npm install devbridge-styleguide -g
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

At last step you'll be asked to supply port on which Styleguide server will work.

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
var styleguide = require('devbridge-styleguide');
```

And then write a task to start a server:

```
gulp.task('start-styleguide', function () {
  styleguide.startServer();
});
```

Function does not take any arguments and returns server instance.


###Accessing your styleguide

Your project server should be running, also if you want to edit/create/scrape snippets Styleguide server should be running.

This is how you open your styleguide:

```
http://your-project-hostname/styleguide/index.html
```

###Snippet structure for scraping

You have to wrap your snippet with DOM comments, you must define snippet ID and CAN define category ID, wheter include javascripts or not, for example:

```
<!-- snippet:start 18 include-js -->
<div class="test-class3-real">
    This is test snippetas
</div>
<!-- snippet:end -->

<!-- snippet:start 14:1 include-js -->
<div class="test-class-2">
    This is test snippet 2
    (yeah)
</div>
<!-- snippet:end -->

<!-- snippet:start 16 -->
<div class="test-class-2">
    This is test snippet 2
    (yeah)
</div>
<!-- snippet:end -->
```

Where the first number is snippet ID, the second one category ID and if include-js flag is defined, then javascript files will be included in that snippet.


###Sass variables file structure for scraping

Like with snippets, here you must wrap fonts and colors with specific comments, this is how it should look like:
```
//-- typo:start --//
//module TYPO
$font-proxima: 'Neue Helvetica W01', helvetica, sans-serif; //(300, 700)
$font-proxima-alternative: 'Neue Helvetica W01', helvetica, sans-serif; //(400)
$font-newsgothic: 'Neue Helvetica W01', helvetica, sans-serif; //(700)
//-- typo:end --//

//-- colors:start --//
//module MAIN COLORS
$color-black: #000000;
$color-dark: #141823;
$red-lighter-2: #d26262;
$red-lighter-1: #bd2727;
$red: #8b0000;
$red-dark: #880000;
$red-darker-1: #8b0000;
$red-darker-2: #4c0d0d;

//module BACKGROUND COLORS
$background-clickable: $red;
$background-positive: #fff;
$background-positive-opacity: #fff;
$background-header: $red-darker-1;
$background-header-inner: $red;
$background-store-nav-first: $red;
$background-footer: $red;
$background-header-red-section: $red;
$background-notification-negative: $red-lighter-2;
$background-header-account-button: $red-lighter-1;

//module TEXT COLORS
$text-link: $red;
$text-link-hover: $red-darker-2;

//module BORDERS
$border-red-nav: $red-darker-2;
$border-active: $red;

//module BUTTONS
$button-default-color: $red;
$button-default-color-hover: $red-darker-2;
$button-call-to-action-color: $red;
//-- colors:end --//
```