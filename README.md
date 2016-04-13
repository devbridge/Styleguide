Styleguide
===
Living Styleguide Made Easy

Installation:
---

##### #1 Install package to your local directory: #####
`npm install devbridge-styleguide --save-dev`

##### #2 Make sure you have installed it globally: #####
`npm install devbridge-styleguide -g`

##### #3 Initialize styleguide: #####
`styleguide initialize `

Copy of the styleguide will be generated and placed in your project's root directory under `'/styleguide/'` folder. If you want to change folder name run `styleguide initialize [folder-name]`

##### #4 Setup Gulp task: #####
```
var styleguide = require('devbridge-styleguide');

gulp.task('start-styleguide', function () {
  styleguide.startServer();
});
````

If your styleguide is placed in different directory than /styleguide/ you need to specified it in the task:

```
styleguide.startServer({
    styleguidePath: 'styleguide-folder-name'
});
```

##### #5 Run styleguide: #####
`gulp start-styleguide`

You should access your styleguide going to `http://your-project-hostname/styleguide/index.html`


Usage:
---

##### To modify styleguide settings: #####
You can add project name, project logo or change settings modifying `config.txt` file, located in your styleguide directory:
```
{
  "projectName": "", //Project name
  "projectUrl": "",  //Domain name of your project
  "projectLogo": "", //path to your project logo
  "jsResources": [], //Javascript resources that's going to be included into the snippets
  "viewportWidths": [ //Predefinded viewport breakpoints
    480,
    768,
    1200
  ],
  "serverPort": 8080, //Default server port for styleguide component
  "snippetTemplate": "styleguide/template.html", //HTML template which will be used to wrap and show html snippets. Project CSS resources of the project should be placed in this template as well.
  "sassVariables": [], //Paths to your scss variables files
  "maxSassIterations": 2000,
  "database": "styleguide/db",
  "categories": "styleguide/db/categories.txt",
  "uniques": "styleguide/db/uniques.txt",
  "sassData": "styleguide/db/sassdata.txt",
  "extension": ".txt"
}

```

##### To add CSS resources of the project to the styleguide: #####
Styleguide snippets are loaded through iframe using `template.html` file. All css references should be defined there.

##### To start styleguide server: #####
Styleguide component have two modes - read-only and editor. In order to work with snippets, categories or scrape scss variables, you need to be in editor mode by starting styleguide server:

* Make sure you have gulp task created:
    ```
    var styleguide = require('devbridge-styleguide');

    gulp.task('start-styleguide', function () {
      styleguide.startServer();
    });
    ```
    If your styleguide is placed in different directory than '/styleguide/' you need to specified it in the task:
    `styleguide.startServer({styleguidePath: 'styleguide-folder-name'});`
* Run `'gulp start-styleguide'`
* Navigate to your styleguide web page, you should see additional controls like, 'new snippet', 'edit snippet' and etc.

##### To scrape scss variables: #####
Scraping scss files you can automatically generate color palette or create a list of fonts used in the project.
* First you need to add smart comment tags to your scss file to identify your variables:

    For color variables:
    ```
    //-- colors:start --//
    $color-black: #000000;
    $color-dark: #141823;
    $red-lighter: #d26262;
    //-- colors:end --//
    ```

    For font variables:
    ```
    //-- typo:start --//
    $font-proxima: 'Neue Helvetica W01', helvetica, sans-serif; // 300, 700
    $font-proxima-alternative: 'Neue Helvetica W01', helvetica, sans-serif; // 400, 400 italic
    $font-newsgothic: 'Neue Helvetica W01', helvetica, sans-serif; // 700
    //-- typo:end --//
    ```

* Declare scss file path references in styleguide config file:

    `"sassVariables": ['/path/to/your/project/scss/file.scss']`

* Open styleguide web page and select from the menu 'Scrape Variables'. Note, make sure you have styleguide server running.

[![Analytics](https://ga-beacon.appspot.com/UA-73039601-2/Styleguide/readme)](https://github.com/igrigorik/ga-beacon)
