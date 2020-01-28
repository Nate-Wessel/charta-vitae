<?php
/**
 * Plugin Name: Charta Vitae
 * Plugin URI:  https://github.com/Nate-Wessel/charta-vitae
 * Description: Map your post metadata
 * Version:     0.1
 * Author:      Nate Wessel
 * Author URI:  https://natewessel.com/
 * License:     GPL3
 * License URI: https://www.gnu.org/licenses/gpl-3.0.html
 */
# prevent abuse:
defined( 'ABSPATH' ) or die( 'No script kiddies please!' );

include_once('register-cv-events.php');
include_once('register-collaborators.php');
include_once('register-taxonomies.php');
include_once('enable-shortcodes.php');

add_filter( 'template_include', 'cv_templates' );
function cv_templates( $template ) {
	if( is_singular( 'cv_event' ) ){
		$template = 'wp-content/plugins/charta-vitae/single-cv_event.php';
	}
	return $template;
}

?>
