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
		'rewrite'=>array('slug'=>'event'),
		'register_meta_box_cb' => 'add_cv_event_meta_box',
	);
	register_post_type('cv_event',$args);
}
add_action( 'init', 'register_cv_event_post_type' );

function add_cv_event_meta_box(){
	add_meta_box(
		"cv_event_meta_box", # ID
		"Dates",             # metabox title
		"cv_event_meta_box", # callback function to display box contents
		"cv_event",          # post type effected
		"side", "low",       # location, priority
		null                 # callback args
	);
}

function cv_event_meta_box($object){
	# function handles content of events dates metabox ?>
	<div>
		<p>"YYYY-MM-DD HH:MM:SS", with optional precision.</p>
		<label for="start">Start</label><br>
		<input name="start" type="text" value="<?php echo get_post_meta($object->ID, "start", true); ?>"><br>
		<label for="end">End</label><br>
		<input name="end" type="text" value="<?php echo get_post_meta($object->ID, "end", true); ?>"><br>
	</div>
<?php 
}

add_action("save_post", "cv_save_event_meta");
function cv_save_event_meta($post_id){
	if( get_post_type($post_id) != 'cv_event' ){ return; }
	if(isset($_POST['start'])){ 
		update_post_meta($post_id,'start',$_POST['start']);
	}
	if(isset($_POST['end'])){ 
		update_post_meta($post_id,'end',$_POST['end']); 
	}
}


?>
