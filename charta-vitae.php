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

$cv_dir = 'wp-content/plugins/charta-vitae';

include_once('entities/projects.php');
include_once('entities/collaborators.php');
include_once('entities/tags.php');
include_once('enable-shortcodes.php');
include_once('JSON-API.php');

add_filter( 'template_include', 'cv_project_templates' );
add_filter( 'template_include', 'cv_collaborator_templates' );
add_action( 'pre_get_posts', 'cv_change_sort_order'); 

function cv_project_templates( $template ) {
	global $cv_dir;
	if( get_post_type() == 'cv_project' ){
		wp_enqueue_style('CVstyle',"/$cv_dir/charta.css");
		if( is_singular() ){ 
			return "$cv_dir/templates/single-cv_project.php";
		}
		return "$cv_dir/templates/archive-cv_project.php";
	}
	return $template;
}

function cv_collaborator_templates( $template ) {
	global $cv_dir;
	if( get_post_type() == 'cv_collaborator' ){
		wp_enqueue_style('CVstyle',"/$cv_dir/charta.css");
		if( is_singular() ){ 
			return "$cv_dir/templates/single-cv_collaborator.php";
		}
		return "$cv_dir/templates/archive-cv_collaborator.php";
	}
	return $template;
}

function cv_change_sort_order($query){ 
	// change sort order of archive pages listing projects
	if( 
		$query->is_main_query() && 
		( is_post_type_archive('cv_project') || is_tax('cv_tag') )
	){
		$query->set('orderby',['meta_value'=>'DESC']);
		$query->set('meta_key','start');
	}
}

?>
