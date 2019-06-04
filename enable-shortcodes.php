<?php
//enable [sitemap] shortcode
function sitemap_shortcode_handler( $atts ){
	# prints a hierarchical list of strata -> fila -> eventus
	echo "<ul class='strata'>\n";
	$strata = get_categories( array( 'taxonomy'=>'strata', 'parent'=>0 ) );
	foreach($strata as $stratum){
		echo "\t<li class='stratum' data-stratum='$stratum->slug'>\n";
		echo "\t\t<h2>$stratum->name</h2>\n";
		echo "\t\t<ul class='fila'>\n";
		$fila = get_categories( array( 'taxonomy'=>'strata', 'parent'=>$stratum->term_id ) );
		foreach($fila as $filum){
			$displayValue = get_term_meta($filum->term_id,'display',true);
			$displayValue = $displayValue == 'true' ? 'true' : 'false';
			echo "\t\t\t<li class='filum' data-filum='$filum->slug' ";
			echo "data-display='$displayValue'>\n";
			echo "\t\t\t\t<h3 class='filum' data-stratum='$stratum->slug'>";
			echo "$filum->name</h3>\n";
			echo "\t\t\t\t<ol class='eventus' data-filum='$filum->slug'>\n";
			# find posts or pages (events) in the specified filum
			$wpq = new WP_Query(array(
				'post_type'=>array('post','page','cv_event'),
				'tax_query'=>array(array(
					'taxonomy'=>'strata',
					'field'=>'slug',
					'terms'=>$filum->slug
				))
			));
			foreach($wpq->posts as $i=>$post){
				echo "\t\t\t\t\t<li class='eventus' data-node-id='$post->ID' ";
				echo "data-date='$post->post_date'>\n";
				echo "\t\t\t\t\t\t<a href='".get_permalink($post->ID)."'>$post->post_title</a>\n";
				echo "\t\t\t\t\t</li>\n"; // eventus
			}
			echo "\t\t\t\t</ol>\n"; // eventus
			echo "\t\t\t</li>\n"; // filum
		}
		echo "\t\t</ul>\n"; // fila
		echo "\t</li>\n"; // stratum
	}
	echo "</ul>\n"; // strata
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
