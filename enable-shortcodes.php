<?php
//enable [sitemap] shortcode
function sitemap_shortcode_handler( $atts ){
	$occs = get_categories(array('taxonomy'=>'occupation'));
	foreach($occs as $occ){
		echo '<h3>'.$occ->name.'</h3>';
		$posts = get_posts(array(
			#'post_type'=>array('post','page'),
			'tax_query'=>array(array(
				'taxonomy'=>'occupation',
				'field'=>'slug',
				'terms'=>$occ->slug
			))
		));
		foreach($posts as $post){ ?>
			<p> <a href="<?php echo get_permalink($post->ID); ?>">
				<?php echo $post->post_title; ?>
			</a></p>
<?php
		}
	}
	return '';
}
add_shortcode( 'sitemap', 'sitemap_shortcode_handler' );
?>
