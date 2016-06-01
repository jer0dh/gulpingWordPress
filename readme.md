# Gulping WordPress Theme Developing #
This is a starting point to developing a WordPress Theme using Gulp.  We switched to gulp because it's config file, gulpfile.js, was easier to understand and change.

## What it does ##
  * This gulp process watches in the background for changes to the theme files.  
    * If it's a change in a javascript file, it will concatenate, minimize, and then deploy to the remote server.
    * If it's a change in a php file, it will deploy to the remote server.
    * If its' a change in the scss styles file, it will recreate the style.css file and deploy to the remote server.
  * Includes `postcss` so one can use SASS like commands, selectors in the style sheets.  We mainly use this so we can use variables.
  * Allows one to use the ES2015 javascript syntax and it will transpile it to regular javascript compatible to today's browsers
  * Jasmine Unit Testing of javascript if wanted

## Installation ##
  1. Clone project to project directory on local machine.
  2. Local machine should have npm and node.js already installed
  3. In project directory, run `npm update`
  4. Edit the package.json with your themename and rename the `mytheme` folder to this name
  5. Edit the gulpfile.js and configure any changes to the variables - like js filenames
  6. Edit the gulpfile.js, deploy task with your login credentials to your local or remote server.  It is better to use public and private keys so a password is not required evertime it tries to deploy.
  7. Run `gulp` on the command line to start the gulp watch process.  Any time you change the `gulpfile.js`, restart the gulp process.
  
* NOTE: do not make changes to the `style.css` file.  Make your changes in the `style.scss` file.

