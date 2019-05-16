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
?>
