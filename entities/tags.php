<?php
# define custom taxonomies

function CV_event_tags_init() {
	register_taxonomy(
		'CV_event_tag',
		array('cv_event'),
		array(
			'hierarchical' => false,
			'show_ui' => true,
			'show_in_rest' => true, # seems necessary to show in interface
			'description' => 'Key=Value tags associated with life events',
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
add_action( 'init', 'CV_event_tags_init' );


?>
