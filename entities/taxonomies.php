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


function stratum_init() {
	register_taxonomy(
		'strata',
		array('cv_event','post','page'),
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
