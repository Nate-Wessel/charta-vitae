<?php
//enable [sitemap] shortcode
// this prints some nested lists with a tree structure
// strata are unordered, but posts/events themselves are ordered

function tab($num=0){ return str_repeat("\t",$num); }

function print_strata_recursive($parentID,$level=0){
	$baseIndent = 3*$level; 
	$strata = get_categories(array('taxonomy'=>'strata','parent'=>$parentID));
	if(sizeof($strata)==0){ return; } // if nothing to print, print nothing
	echo tab($baseIndent+1)."<ul class='strata'>\n"; 
	foreach($strata as $stratum){
		$displayValue = get_term_meta($stratum->term_id,'display',true);
		$displayValue = $displayValue == 'true' ? 'true' : 'false';
		echo tab($baseIndent+2)."<li class='stratum' data-stratum='$stratum->slug' ";
		echo "data-display='$displayValue' data-level='$level'>\n";
		echo tab($baseIndent+3)."<span class='stratum-name'>$stratum->name</span>\n";
		// print direct child events if any
		print_child_posts_list($stratum->slug,$baseIndent+3);
		// get child categories
		print_strata_recursive($stratum->term_id,$level+1);
		echo tab($baseIndent+2)."</li><!--end $stratum->slug-->\n";
	}
	echo tab($baseIndent+1)."</ul>\n";
}

function print_child_posts_list($stratumSlug,$indentLevel=0){
	# find posts or pages (events) in the specified filum
	$wpq = new WP_Query(array(
		'post_type'=>array('post','page','cv_event'),
		'tax_query'=>array(array(
			'taxonomy'=>'strata', 'field'=>'slug', 'include_children'=>false,
			'terms'=>$stratumSlug
		))
	));
	if(sizeof($wpq->posts)==0){ return; }
	echo tab($indentLevel)."<ol>\n";
	foreach($wpq->posts as $i=>$post){
		echo tab($indentLevel+1)."<li class='eventus' data-node-id='$post->ID' ";
		echo "data-date='$post->post_date'>\n";
		echo tab($indentLevel+2)."<a href='".get_permalink($post->ID)."'>$post->post_title</a>\n";
		echo tab($indentLevel+1)."</li>\n"; // eventus
	}
	echo tab($indentLevel)."</ol>\n";
}

function sitemap_shortcode_handler( $atts ){
	echo "<div id='chartaData'>\n";
	print_strata_recursive(0); // top level parent is 0
	echo "</div>\n";
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
