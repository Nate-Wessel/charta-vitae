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

include_once('entities/projects.php');
include_once('entities/collaborators.php');
include_once('entities/strata.php');
include_once('entities/tags.php');
include_once('enable-shortcodes.php');

add_filter( 'template_include', 'cv_templates' );
function cv_templates( $template ) {
	$plugin = 'wp-content/plugins/charta-vitae';
	if( is_singular() && get_post_type() == 'cv_project' ){
		wp_enqueue_style('CVstyle',"/$plugin/charta.css");
		return "$plugin/templates/single-cv_project.php";
	}elseif( is_singular() && get_post_type() == 'cv_collaborator' ){
		wp_enqueue_style('CVstyle',"/$plugin/charta.css");
		return "$plugin/templates/single-cv_collaborator.php";
	}elseif( get_post_type() == 'cv_project' ){
		wp_enqueue_style('CVstyle',"/$plugin/charta.css");
		return "$plugin/template/archive-cv_project.php";
	}elseif( get_post_type() == 'cv_collaborator' ){
		wp_enqueue_style('CVstyle',"/$plugin/charta.css");
		return "$plugin/template/archive-cv_collaborator.php";
	}
	return $template;
}

?>
