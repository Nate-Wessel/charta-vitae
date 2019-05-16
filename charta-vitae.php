<?php
/**
 * Plugin Name: Charta Vitae
 * Plugin URI:  https://github.com/Nate-Wessel/charta-vitae
 * Description: Map your post metadata
 * Version:     0.0
 * Author:      Nate Wessel
 * Author URI:  https://natewessel.com/
 * License:     GPL3
 * License URI: https://www.gnu.org/licenses/gpl-3.0.html
 */
# prevent abuse:
defined( 'ABSPATH' ) or die( 'No script kiddies please!' );

include_once('enable-term-meta.php');

# define custom taxonomy
function occupation_init() {
	// create a new taxonomy
	register_taxonomy(
		'occupation',
		'post',
		array(
			'hierarchical' => false,
			'show_ui' => true,
			'show_in_rest' => true, # seems necessary to show in interface
			'description' => 'things that have kept me busy',
			'label' => __( 'Occupation' ),
			'public' => false,
			'rewrite' => false,
			'capabilities' => array('manage_terms','edit_terms'),
			'label' => 'occupations',
			'labels' => array(
				'name' => 'Occupations',
				'singular_name' => 'Occupation',
				'add_new_item' => 'Add new occupation'
			),
		)
	);
}
add_action( 'init', 'occupation_init' );

?>
