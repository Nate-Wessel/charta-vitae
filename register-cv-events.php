<?php
function register_cv_event_post_type(){
	$args = array(
		'label'=>'CV Events',
		# https://developer.wordpress.org/reference/functions/get_post_type_labels/
		'labels'=>array( 
			'name'=>'CV Events',
			'singular_name'=>'CV Event',
			'add_new_item'=>'Add New Event',
			'edit_item'=>'Edit Event',
			'view_item'=>'View Event',
			'search_items'=>'Search Events',
		),
		'description'=>'Charta Vitae event.',
		'public'=>true,
		'show_ui'=>true,
		'show_in_rest'=>true,
		'supports'=>array('title','editor','revisions'),
		'taxonomies'=>array('strata'),
		'rewrite'=>array('slug'=>'event')
	);
	register_post_type('cv_event',$args);
}
add_action( 'init', 'register_cv_event_post_type' );
?>
