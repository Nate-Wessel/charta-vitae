<?php
# define custom taxonomies

function cv_tags_init() {
	register_taxonomy(
		'cv_tag',
		array('cv_project'),
		array(
			'hierarchical' => false,
			'show_ui' => true,
			'show_in_rest' => true, # seems necessary to show in interface
			'description' => 'Key=Value tags associated with life projects',
			'label' => __( 'tags' ),
			'public' => false,
			'rewrite' => false,
			'capabilities' => array('manage_terms','edit_terms'),
			'label' => 'Tag',
			'labels' => array(
				'name' => 'Tags',
				'singular_name' => 'Tag',
				'add_new_item' => 'Add new tag'
			),
		)
	);
}
add_action( 'init', 'cv_tags_init' );


?>
