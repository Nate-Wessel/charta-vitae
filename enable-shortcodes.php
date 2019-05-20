<?php
//enable [sitemap] shortcode
function sitemap_shortcode_handler( $atts ){
	$strata = get_categories( array(
		'taxonomy'=>'strata',
		'parent'=>0
	) );
	foreach($strata as $stratum){
		echo '<h2 class="stratum"><input type="checkbox" id="'.$stratum->slug.'" checked>'.$stratum->name.'</h2>';
		$fila = get_categories( array(
			'taxonomy'=>'strata',
			'parent'=>$stratum->term_id
		) );
		foreach($fila as $filum){
			echo '<h3 class="filum" data-stratum="'.$stratum->slug.'">'.$filum->name.'</h3>';
			echo '<ol class="eventus">';
			# find posts or pages in the specified filum
			$wpq = new WP_Query(array(
				'post_type'=>array('post','page'),
				'tax_query'=>array(array(
					'taxonomy'=>'strata',
					'field'=>'slug',
					'terms'=>$filum->slug
				))
			));
			foreach($wpq->posts as $i=>$post){
				# find/define attributes of this post
				# IDs of this and the preceding node if any
				$nodeID = $post->ID.'-'.$filum->slug;
				$anteNodeID = $i>0 ? $wpq->posts[$i-1]->ID.'-'.$filum->slug : false;
				# array of all fila to which this post belongs
				$post_fila = get_the_terms($post->ID,'strata');
				# get a list of nodeID's of this post in all fila
				$gemini = array_map( 
					function($pf) use ($post){return $post->ID.'-'.$pf->slug;}, 
					$post_fila 
				);
				# remove this post's ID from the list
   			unset($gemini[array_search($nodeID,$gemini)]);
				$gemini = implode(' ',$gemini);
				?>
				<li class="eventus"
					data-node-id="<?php echo $nodeID;?>" 
					data-date="<?php echo $post->post_date;?>"
					data-stratum="<?php echo $stratum->slug;?>"
					data-filum="<?php echo $filum->slug;?>"
					<?php if($anteNodeID){ echo 'data-ante-node="'.strval($anteNodeID).'"';}?>
					<?php if($gemini){ echo 'data-gemini="'.$gemini.'"';}?>
				>
					<a href="<?php echo get_permalink($post->ID);?>">
						<?php echo $post->post_title;?>
					</a>
				</li>
				<?php
			}
			echo '</ol>';
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
		wp_enqueue_script('d3v5','/wp-content/plugins/charta-vitae/d3/d3.v4.js');
		wp_enqueue_script('charta-vitae','/wp-content/plugins/charta-vitae/charta-vitae.js',array('d3v5'));
		wp_enqueue_style('charta-vitae-svg','/wp-content/plugins/charta-vitae/charta.css');
	}
	return $posts;
}
?>
