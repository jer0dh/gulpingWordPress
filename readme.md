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
  4. For deploying it is better to use public and private keys so a password is not required evertime it tries to deploy.  ( Check with your host provider on how to set this up )
  4. Create a `rsync.json` file with the following format but containing your correct info to ssh:
```javascript
{
  "hostname"  : "ftp.mydomain.com",
  "username"  : "myusername",
  "port"      : 22
}
```
  5. Edit the gulpfile.js and configure any changes to the variables - like js filenames
  7. Run `gulp` on the command line to start the gulp watch process.  Any time you change the `gulpfile.js`, restart the gulp process.
  
* NOTE: do not make changes to the `style.css` file.  Make your changes in the `style.scss` file.

> Make sure your `.gitignore` files contains `rsync.json` so when you sync up to gitHub, the repo will not contain some of your credentials for all to see.

