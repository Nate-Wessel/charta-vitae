<?php
# define custom taxonomies
function occupation_init() {
	register_taxonomy(
		'occupation',
		array('post','page'),
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
