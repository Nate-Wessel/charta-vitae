<?php
//enable [sitemap] shortcode

function sitemap_shortcode_handler( $atts ){
	return "\n<div id='charta-vitae'></div>\n"; # put the map here
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
		$dir = '/wp-content/plugins/charta-vitae';
		wp_enqueue_script('d3v4',"$dir/d3/d3.v4.js");
		wp_enqueue_script('CVproject',"$dir/modules/project.js");
		wp_enqueue_script('CVlink',"$dir/modules/link.js");
		wp_enqueue_script('CVdata',"$dir/modules/data.js");
		wp_enqueue_script('CVtime',"$dir/modules/timepoint.js");
		wp_enqueue_script('CVmain',"$dir/main.js");
		wp_enqueue_style('CVstyle',"$dir/charta.css");
	}
	return $posts;
}
?>
