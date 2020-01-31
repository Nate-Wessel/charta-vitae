<?php
function cv_register_project_post_type(){
	$args = array(
		'label'=>'Projects',
		# https://developer.wordpress.org/reference/functions/get_post_type_labels/
		'labels'=>array( 
			'name'=>'Projects',
			'singular_name'=>'Project',
			'add_new_item'=>'Add New Project',
			'edit_item'=>'Edit Project',
			'view_item'=>'View Project',
			'search_items'=>'Search Projects',
		),
		'description'=>'A project or life event',
		'hierarchical'=>true,
		'public'=>true,
		'show_ui'=>true,
		'show_in_rest'=>true,
		'supports'=>array('title','editor','revisions','page-attributes'),
		'taxonomies'=>array('strata'),
		'rewrite'=>array('slug'=>'projects'),
		'register_meta_box_cb' => 'cv_add_project_meta_box',
	);
	register_post_type('cv_project',$args);
}
add_action( 'init', 'cv_register_project_post_type' );

function cv_add_project_meta_box(){
	add_meta_box(
		"cv_project_date_meta", # ID
		"Dates",              # metabox title
		"cv_project_date_meta", # callback function to display box contents
		"cv_project",           # post type effected
		"side", "low",        # location, priority
		null                  # callback args
	);
	add_meta_box(
		"cv_project_link_meta", # ID
		"Links",              # metabox title
		"cv_project_link_meta", # callback function to display box contents
		"cv_project",           # post type effected
		"side", "low",        # location, priority
		null                  # callback args
	);
}

function cv_project_date_meta($object){
	# function handles content of projects dates metabox ?>
	<div>
		<p>"YYYY-MM-DD HH:MM:SS", with optional precision.</p>
		<label for="start">Start</label><br>
		<input name="start" type="text" value="<?php echo get_post_meta($object->ID, "start", true); ?>"><br>
		<label for="end">End</label><br>
		<input name="end" type="text" value="<?php echo get_post_meta($object->ID, "end", true); ?>">
	</div>
<?php 
}

function cv_project_link_meta($object){
	# function handles content of project causal link metabox 
	# filter out projects starting before this one (if start is known)
	# i.e. causal links can only point forward
	$other_projects = get_posts(array( 
		'exclude'=>$object->ID, # exlude this project itself
		'post_type'=>'cv_project', 
		'numberposts'=>-1,      # return all projects (no paging)
		'orderby'=>'title',
		'order'=>'ASC',
		'meta_query'=>array(
			'date_clause'=>array(
				'key'=>'start',
				'compare'=>'>=',
				'value'=>get_post_meta($object->ID,'start',true)
			),
			'relation'=>'OR',
			'empty_clause'=>array(
				'key'=>'start',
				'compare'=>'NOT EXISTS'
			)
		)
	));
	# see if values have already been selected
	$caused = explode(',',get_post_meta($object->ID, "caused",true));
?>
	<div>
		<p>Causal links to the following projects:</p>
		<select name="caused[]" size='15' multiple>
		<?php foreach($other_projects as $proj){
			$id = $proj->ID;
			$selected = in_array(strval($id),$caused) ? 'selected' : '';
			$title = $proj->post_title;
			echo "\t\t\t<option value='$id' $selected>$title</option>\n";
		}?>
		</select>
	</div>
<?php 
}

add_action("save_post", "cv_save_project_meta");
function cv_save_project_meta($post_id){
	if( get_post_type($post_id) != 'cv_project' ){ return; }
	# store or delete values. Since this is definitely a project at this point,
	# null or empty values mean there is definitely no value to store
	if($_POST['start']==''){
		delete_post_meta($post_id,'start');
	}else{
		update_post_meta($post_id,'start',$_POST['start']);
	}
	if($_POST['end']==''){
		delete_post_meta($post_id,'end');
	}else{
		update_post_meta($post_id,'end',$_POST['end']);
	}
	if(is_null($_POST['caused'])){
		delete_post_meta($post_id,'caused');
	}else{
		update_post_meta($post_id,'caused',implode(',',$_POST['caused']));
	}
}


?>
