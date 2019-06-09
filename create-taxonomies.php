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

function register_cv_event_post_type(){
	$args = array(
		'label'=>'CV Events',
		'labels'=>array(
			'name'=>'CV Events',
			'singular_name'=>'CV Event',
			'add_new_item'=>'Add New Event'
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
// add term metadata ( display by default checkbox ) to editing forms 

function add_stratum_display_field($term) {
	$metaValue = get_term_meta($term->term_id,'display',true);
	$checked = $metaValue == 'true' ? true : false;
	?>
	<div>
		<input type="checkbox" name="display" value="true" <?php if($checked) echo 'checked';?>>
		<label>Display by default?</label>
	</div><?php
}
add_action( 'strata_edit_form_fields', 'add_stratum_display_field' );


// save that checkbox value in the DB
function save_stratum_display_field( $term_id ){
	$val = $_POST['display'];
	if($val){
		update_term_meta( $term_id, 'display', $val );
	}else{
		delete_term_meta( $term_id, 'display' );
	}
}
add_action( 'edited_strata', 'save_stratum_display_field' );



// these two add a column to the table 
function add_display_column( $columns ){
    $columns['display'] = 'Display';
    return $columns;
}
add_filter('manage_edit-strata_columns', 'add_display_column' );

function add_display_column_content( $content, $column_name, $term_id ){
	if( $column_name !== 'display' ){ return $content; }
	$term_id = absint( $term_id );
	$displayValue = get_term_meta( $term_id, 'display', true );
	$content .= $displayValue;
	return $content;
}
add_filter('manage_strata_custom_column', 'add_display_column_content', 10, 3 );

?>
