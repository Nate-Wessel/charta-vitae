<?php
add_action( 'rest_api_init', function () {
	register_rest_route( 'charta-vitae', '/projects/all', 
		array( 'methods' => 'GET', 'callback' => 'cv_get_project_data' ) 
	);
} );

function cv_get_project_data(WP_REST_Request $request){
	# get all cv_projects and their properties
	$posts = get_posts(array( 'post_type'=>'cv_project', 'numberposts'=>-1 ));
	$data = array( 'projects'=>[], 'links'=>[] );
	foreach( $posts as $post){
		$proj = [ 
			'id'=> $post->ID, 
			'title'=>$post->post_title,
			'url'=>get_permalink($post->ID),
			'tags'=>[]
		];
		# set dates if they exist
		if(($start = get_post_meta($post->ID, "start", true)) != '' ){
			$proj['start'] = $start; 
		}
		if(($end = get_post_meta($post->ID, "end", true)) != '' ){ 
			$proj['end'] = $end; 
		}
		# set tags if they exist
		foreach( wp_get_post_terms($post->ID,'cv_tag') as $tag){
			$proj['tags'][] = $tag->slug;
		}
		$data['projects'][] = $proj;
		# add a link for causal relationships if any
		$caused = get_post_meta($post->ID,'caused');
		if( count($caused) > 0 ){
			# add a link for each caused project
			foreach($caused as $idString){
				$data['links'][] = [
					'source'=>$post->ID, 'target'=>(int)$idString, 'type'=>'causal'
				];
			}
		}
		# add a link for a parent relationship if any
		if( $post->post_parent != 0 ){
			$data['links'][] = [
				'source'=>$post->ID, 'target'=>$post->post_parent,
				'type'=>'constitutive'
			];
		}
		$data['tags'] = get_terms(['taxonomy'=>'cv_tag']);
		shuffle($data['tags']);
	}
	return $data;
}
?>
