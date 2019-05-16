<?php
//enable [sitemap] shortcode
function sitemap_shortcode_handler( $atts ){
	$occs = get_categories(array('taxonomy'=>'occupation'));
	foreach($occs as $occ){
		echo '<h3>'.$occ->name.'</h3>';
		$wpq = new WP_Query(array(
			'post_type'=>array('post','page'),
			'tax_query'=>array(array(
				'taxonomy'=>'occupation',
				'field'=>'slug',
				'terms'=>$occ->slug
			))
		));
		foreach($wpq->posts as $post){ ?>
			<p> <a href="<?php echo get_permalink($post->ID); ?>">
				<?php echo $post->post_title; ?></a>
				<?php echo $post->post_date; ?>
			</p>
<?php
		}
	}
	return '';
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
		wp_enqueue_script('d3v5','https://d3js.org/d3.v4.js');
		wp_enqueue_script('charta-vitae','/wp-content/plugins/charta-vitae/charta-vitae.js',array('d3v5'));
		wp_enqueue_style('charta-vitae-svg','/wp-content/plugins/charta-vitae/charta.css');
	}
	return $posts;
}
?>
