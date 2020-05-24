<?php get_header(); ?>

<div id="charta-vitae" class="page">
	<h1><?php echo get_the_title(); ?></h1>
	<!--TODO add proper dynamic link-->
	<p><a href="<?php echo get_site_url();?>/?page_id=1285" title="view this project in context">Charta Vitae</a></p>

	<?php if(have_posts()){ the_post();
		//$start = get_post_meta($post->ID,'start',true);
		//echo "<p>Met on: $start</p>";
		
		the_content(); 
		
		// find any associated projects
		$args = array(
			'post_type' => 'cv_project',
			'meta_key' => 'collaborator',
			'meta_value' => "$post->ID"
		);
		$collab_query = new WP_Query( $args );
		
		if ( $collab_query->have_posts() ) {
			echo '<p>Associated with the following projects:</p>';
			echo '<ul>';
			while ( $collab_query->have_posts() ) {
				$collab_query->the_post();
				$permalink = get_permalink($post->ID);
				echo "<li><a href='$permalink'>$post->post_title</a></li>";
			}
			echo '</ul>';
		}

	} // end the loop 
	?>
</div><!--#charta-vitae-->
<?php get_footer(); ?>
