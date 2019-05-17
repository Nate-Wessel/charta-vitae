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
		?>
		<ol>
		<?php
		foreach($wpq->posts as $i=>$post){
			# link to previous if any
			$prev_stop = $i>0 ? $wpq->posts[$i-1]->ID : false;
			# is this entry linked to any other occupations?
			foreach( get_the_terms($post->ID,'occupation') as $term ){
				$transfers_to = '';
				if($term->slug != $occ->slug) $transfers_to = $term->slug;
				# TODO this last bit will fail with more than one transfer
			}
		?>
			<li 
				data-post-id="<?php echo $post->ID;?>"
				data-transfers="<?php echo $transfers_to; ?>"
				<?php if($prev_stop){ ?>data-previous-stop="<?php echo $prev_stop ?>"<?php } ?>
				data-occupation="<?php echo $occ->slug;?>"
				data-date="<?php echo $post->post_date;?>"
			> 
				<a href="<?php echo get_permalink($post->ID); ?>"><?php echo $post->post_title; ?></a>
			</li>
<?php
		}?>
		</ol>
<?php
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
