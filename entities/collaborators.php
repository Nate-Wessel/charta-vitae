<?php
function register_cv_collaborator_post_type(){
	$args = array(
		'label'=>'Collaborators',
		# https://developer.wordpress.org/reference/functions/get_post_type_labels/
		'labels'=>array( 
			'name'=>'Collaborators',
			'singular_name'=>'Collaborator',
			'add_new_item'=>'Add New Collaborator',
			'edit_item'=>'Edit Collaborator',
			'view_item'=>'View Collaborator',
			'search_items'=>'Search Collaborators',
		),
		'description'=>'friends, enemies, coworkers',
		'hierarchical'=>false,
		'public'=>true,
		'show_ui'=>true,
		'show_in_rest'=>true,
		'supports'=>array('title','editor','revisions','page-attributes'),
		'has_archive'=>true,
		'rewrite'=>array('slug'=>'peeps'),
		'register_meta_box_cb' => 'add_collab_meta_box',
	);
	register_post_type('cv_collaborator',$args);
}
add_action( 'init', 'register_cv_collaborator_post_type' );

function add_collab_meta_box(){
	add_meta_box(
		"cv_collab_meta",     # ID
		"Dates",              # metabox title
		"cv_collab_meta",     # callback function to display box contents
		"cv_collaborator",    # post type effected
		"side", "low",        # location, priority
		null                  # callback args
	);
}

function cv_collab_meta($object){
	# function handles content of metabox ?>
	<div>
		<label for="start">We met on:</label><br>
		<input name="start" type="text" value="<?php echo get_post_meta($object->ID, "start", true); ?>">
		<p>(YYYY-MM-DD HH:MM:SS with optional precision)</p>
	</div>
<?php 
}

add_action("save_post", "cv_save_collaborator_meta");
function cv_save_collaborator_meta($post_id){
	if( get_post_type($post_id) != 'cv_collaborator' ){ return; }
	# store or delete values. Since this is definitely a collaborator at this 
	# point, null or empty values mean there is definitely no value to store
	if($_POST['start']==''){
		delete_post_meta($post_id,'start');
	}else{
		update_post_meta($post_id,'start',$_POST['start']);
	}
}

?>
