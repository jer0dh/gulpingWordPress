<?php
//* Start the engine
include_once( get_template_directory() . '/lib/init.php' );

//* Child theme (do not remove)
define( 'CHILD_THEME_NAME', 'mytheme' );
define( 'CHILD_THEME_URL', 'http://jhtechservices.com/' );
define( 'CHILD_THEME_VERSION', '1.0.0' );


add_action( 'wp_enqueue_scripts', 'myt_enqueue_script');
function myt_enqueue_script() {
	wp_enqueue_script( 'myt_scripts', get_bloginfo( 'stylesheet_directory' ) . '/js/dist/scripts.min.js', array( 'jquery' ), '1.0.0',true );
}

//* Add HTML5 markup structure
add_theme_support( 'html5', array( 'search-form', 'comment-form', 'comment-list' ) );

//* Add Accessibility support
add_theme_support( 'genesis-accessibility', array( 'headings', 'drop-down-menu',  'search-form', 'skip-links', 'rems' ) );

//* Add viewport meta tag for mobile browsers
add_theme_support( 'genesis-responsive-viewport' );

//* Add support for custom background
add_theme_support( 'custom-background' );

//* Add support for 3-column footer widgets
add_theme_support( 'genesis-footer-widgets', 3 );

//* Move footer widgets into footer tag
remove_action( 'genesis_before_footer', 'genesis_footer_widget_areas' );
add_action('genesis_footer', 'genesis_footer_widget_areas',5);



// create shortcode to put in copyright in a widget (footer)
add_shortcode('creds', 'myt_creds');

function myt_creds() {
	return (do_shortcode(sprintf( '[footer_copyright before="%s "] &#x000B7; My Theme ', __( 'Copyright', 'genesis' ))));
}

remove_action( 'genesis_footer', 'genesis_do_footer' );
add_action( 'genesis_footer', 'myt_footer' );
function myt_footer() {
	echo do_shortcode('[creds]');
}

/* Enqueue Google Fonts
add_action( 'wp_enqueue_scripts', 'genesis_sample_google_fonts' );
function genesis_sample_google_fonts() {

	wp_enqueue_style( 'google-fonts', 'https://fonts.googleapis.com/css?family=Noticia+Text:400,700,400italic|Raleway:400,700', array(), CHILD_THEME_VERSION );

}
*/