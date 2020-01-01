<?php
//enable [sitemap] shortcode

function cv_get_event_data_JSON(){
	# get all cv_events and their properties
	$posts = get_posts(array( 'post_type'=>'cv_event', 'numberposts'=>-1 ));
	$data = array( 'events'=>[], 'links'=>[] );
	foreach( $posts as $post){
		$event = [ 
			'id'=> $post->ID, 
			'title'=>$post->post_title,
			'url'=>get_permalink($post->ID),
			'strata'=>[],'tags'=>[]
		];
		# set dates if they exist
		if(($start = get_post_meta($post->ID, "start", true)) != '' ){
			$event['start'] = $start; 
		}
		if(($end = get_post_meta($post->ID, "end", true)) != '' ){ 
			$event['end'] = $end; 
		}
		# set strata if they exist
		foreach( wp_get_post_terms($post->ID,'strata') as $stratum){
			$event['strata'][] = $stratum->slug;
		}
		# set tags if they exist
		foreach( wp_get_post_terms($post->ID,'CV_event_tag') as $tag){
			$event['tags'][] = $tag->slug;
		}
		$data['events'][] = $event;
		# add a link for causal relationships if any
		$caused = get_post_meta($post->ID,'caused',true);
		if( $caused != '' ){
			# split on commas and add a link for each caused event
			$caused = explode(',',$caused);
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
		$data['tags'] = get_terms(['taxonomy'=>'CV_event_tag']);
		shuffle($data['tags']);
		$data['strata'] = get_terms(['taxonomy'=>'strata']);
	}
	return json_encode($data,JSON_PRETTY_PRINT);
}

function sitemap_shortcode_handler( $atts ){
	$val  = "<div id='charta-vitae'></div>\n"; # put the map here
	$val .= "<script>var cv_data =".cv_get_event_data_JSON().";</script>";
	return $val;
}
add_shortcode( 'sitemap', 'sitemap_shortcode_handler' );

# conditionally add javascript to header when shortcode found on page
# thanks to: http://beerpla.net/2010/01/13/wordpress-plugin-development-how-to-include-css-and-javascript-conditionally-and-only-when-needed-by-the-posts/
add_filter('the_posts', 'conditionally_add_scripts_and_styles'); // the_posts gets triggered before wp_head
function conditionally_add_scripts_and_styles($posts){
	if (empty($posts)) return $posts;
	$shortcode_found = false; // use this flag to see if styles and scripts need to be enqueued
	foreach ($posts as $post) {
		if (stripos($post->post_content, '[sitemap]') !== false) {
			$shortcode_found = true; // bingo!
			break;
		}
	} 
	if ($shortcode_found) {
		// enqueue here
		wp_enqueue_script('d3v4','/wp-content/plugins/charta-vitae/d3/d3.v4.js');
		wp_enqueue_script('charta-vitae','/wp-content/plugins/charta-vitae/charta-vitae.js',array('d3v4'));
		wp_enqueue_style('charta-vitae-svg','/wp-content/plugins/charta-vitae/charta.css');
	}
	return $posts;
}
?>
