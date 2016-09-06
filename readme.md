# Gulping WordPress Theme Developing #
This is a starting point to developing a WordPress Theme using Gulp.  We switched to gulp because it's config file, gulpfile.js, was easier to understand and change.

## What it does ##
  * This gulp process watches in the background for changes to the theme files.  
    * If it's a change in a javascript file, it will concatenate, minimize, and then deploy to the remote server.
    * If it's a change in a php file, it will deploy to the remote server.
    * If it's a change in any scss styles file, it will produce minimized .css files and deploy to the remote server.
    * If it's a new image, it will run the `imagemin` process on it to compress it. 
  * Includes `postcss` so one can use SASS like commands, selectors in the style sheets.  We mainly use this so we can use variables.
  * Allows one to use the ES2015 javascript syntax and it will transpile it to regular javascript compatible to today's browsers


## Installation ##
  1. Clone project to project directory on local machine.
  2. Local machine should have npm and node.js already installed
  3. In project directory, run `npm update`
  4. Edit the package.json with your themename and rename the `mytheme` folder to this name
  4. For deploying it is better to use public and private keys so a password is not required evertime it tries to deploy.  ( Check with your host provider on how to set this up )[This site might help](https://www.digitalocean.com/community/tutorials/how-to-set-up-ssh-keys--2)
  4. Create a `rsync.json` file with the following format but containing your correct info to ssh:
```javascript
{
  "hostname"  : "ftp.mydomain.com",
  "username"  : "myusername",
  "port"      : 22
}
```
  5. Edit the gulpfile.js and configure any changes to the variables - like js filenames.  
  7. Run `gulp` on the command line to start the gulp watch process.  Any time you change the `gulpfile.js`, restart the gulp process.
  
* NOTE: do not make changes to the `style.css` file.  Make your changes in the `style.scss` file.

> Make sure your `.gitignore` files contains `rsync.json` so when you sync up to gitHub, the repo will not contain some of your credentials for all to see.

## NOTE on your style.scss file ##
In order for WordPress to read in the theme name, you must include a comment with the name.  Use the `/*!  ... */` comment delimiter so the minifier won't strip it out.
The gulp process will automatically use the package.json file to fill out the comment section as long as you change the style.scss file to have this comment

```
/*!
	Theme Name: <%= pkg.templateName %><% if(environment==='build'){print('build');} %>
	Theme URI: http://jhtechservices.com
	Description: <%= pkg.description %>
	Author: <%= pkg.author %>
	Author URI: http://jhtechservices.com
    Version: <%= pkg.version %>

	Template: genesis
	Template Version: 2.2.0

	License: <%= pkg.license %>
	
*/
```
### Changes ###
  *2016-09-06*
    * Allowing gulp to process to any .scss file in the theme directory
    * Fixing sourcemap issue so map is a separate file
    * Updating `style.scss`
    * Adding postcss-sorting
    * Adding `rsync.json`
    * moved all browserify, app module development to separate files as reference `_app_dev` in filename
    
    