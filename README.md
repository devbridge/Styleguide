Styleguide
===

Devbridge Styleguide helps you create, share, and automate a living visual style library of your brand. Share your digital brand standards, improve team collaboration, and implement an independent easily-extendable modular structure.

Installation:
---

Before going deeper into the Styleguide, make sure you have following components installed on your machine:
- [node.js](https://nodejs.org/en/)
- [npm](https://www.npmjs.com/)
- [gulp](http://gulpjs.com/)

##### #1 Install package to your local project's directory: #####
`npm install devbridge-styleguide --save-dev`

_**Note**, do not download files directly from git repository, unless you know what you are doing._

##### #2 Make sure you have installed it globally: #####
`npm install devbridge-styleguide -g`

##### #3 Initialize styleguide: #####
`styleguide initialize `

_**Note**, make sure you run command inside your project directory._

Copy of the styleguide will be generated and placed in your project's root directory under `'/styleguide/'` folder. If you want to change folder name run `styleguide initialize folder-name`

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
    styleguidePath: 'folder-name'
});
```

##### #5 Run styleguide: #####
`gulp start-styleguide`

***

_**Note**, the purpose of the styleguide server is to expose API for styleguide data manipulation **ONLY**. In order to view the styleguide in the browser, you need to setup and run your own project’s server. We recommend using simple [http server - live-server](https://www.npmjs.com/package/live-server)_

***

Open your project in the browser and navigate to `/styleguide/` directory. Happy styleguideing!!


Usage:
---

The Styleguide component has two modes - **“view only”** and **“edit”**.

**"View only”** mode does not have editing controls and is meant for presentation. It is a purely client-side application without any backend dependencies (e.g. html, css, and javascript only). It is delightly easy to share, publish, move, or export!

In order to switch to **“Edit”** mode and see all additional controls for editing, you need to run the Styleguide server.

##### To manage categories: #####
Categories can be managed inside your browser. Just navigate to your styleguide page and click menu in the right top corner. You will be able to create, delete or modify them.

##### To work with Snippets #####
All snippet management is done inside the browser, on your styleguide page. While styleguide server is running, you should be able to see additional controls for editing.

##### To scrape scss variables: #####
By scraping scss files you can automatically generate color palette or create a list of fonts used in the project.
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


[![Analytics](https://ga-beacon.appspot.com/UA-73039601-2/Styleguide/readme)](https://github.com/igrigorik/ga-beacon)
