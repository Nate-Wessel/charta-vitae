<?php
//enable [sitemap] shortcode
function sitemap_shortcode_handler( $atts ){
	$occs = get_categories(array('taxonomy'=>'occupation'));
	foreach($occs as $occ){
		echo '<h3>'.$occ->name.'</h3>';
		# find posts or pages with the specified occupation
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
			# find/define attributes of this post
			# IDs of this and the preceding node if any
			$nodeID = $occ->slug.'-'.$post->ID;
			$anteNodeID = $i>0 ? $occ->slug.'-'.$wpq->posts[$i-1]->ID : false;
			# array of *other* occupations to which this post belongs
			$terms = get_the_terms($post->ID,'occupation');
			$transfers = array_map( function($term){ return $term->slug;}, $terms );
   		unset($transfers[ array_search($occ->slug, $transfers) ]);
		?>
			<li 
				data-node-id="<?php echo $nodeID;?>"
				<?php if($anteNodeID){ ?>data-ante-node="<?php echo $anteNodeID;?>"<?php } ?>
				<?php if(count($transfers)>0){ ?>data-transfers="<?php echo implode(' ',$transfers);?>"<?php };?>
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
