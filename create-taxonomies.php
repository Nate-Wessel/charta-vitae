<?php
# define custom taxonomies
function stratum_init() {
	register_taxonomy(
		'strata',
		array('post','page'),
		array(
			'hierarchical' => true,
			'show_ui' => true,
			'show_in_rest' => true, # seems necessary to show in interface
			'description' => 'Strata Chartae',
			'label' => __( 'Strata Chartae' ),
			'public' => false,
			'rewrite' => false,
			'capabilities' => array('manage_terms','edit_terms'),
			'label' => 'strata',
			'labels' => array(
				'name' => 'Strata',
				'singular_name' => 'Stratum',
				'add_new_item' => 'Add new stratum'
			),
		)
	);
}
add_action( 'init', 'stratum_init' );
?>
