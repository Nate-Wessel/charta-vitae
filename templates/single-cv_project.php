<?php get_header(); ?>
<div id="charta-vitae" class="page">
	<h1><?php echo get_the_title(); ?></h1>
	<!--TODO add proper dynamic link-->
	<p><a href="<?php echo get_site_url();?>/?page_id=1285" title="view this project in context">Charta Vitae</a></p>
	<?php if(have_posts()){ 
		the_post();
		// query all the metadata!
		$start = get_post_meta($post->ID,'start',true);
		$end = get_post_meta($post->ID,'end',true);
		$caused = get_post_meta($post->ID,'caused',true);
		$tags = get_the_terms($post->ID,'cv_tag');
		$parent = get_post($post->post_parent); // defaults to post if no parent
		$components = get_children( [
			'post_parent' => $post->ID,
			'post_type' => 'cv_project'
		] );

		$args = array(
			'post_type' => 'cv_project',
			'meta_key' => 'caused',
			'meta_value' => "$post->ID"
		);
		$caused_by_query = new WP_Query( $args );

		// print start/end dates neatly
		if($start and $end and $start != $end){
			echo "<p>Started $start and ended $end</p>";
		}elseif($start and !$end){
			echo "<p>Started: $start and still going</p>";
		}elseif($end and !$start or $start == $end ){
			echo "<p>Happened on $end</p>";
		}else{
			echo "<p>failed to parse '$start', '$end'</p>";
		}
		// print page content
		the_content();
		// print project tags
		echo '<div id="metabox">';
		if($tags){ foreach( $tags as $tag){
			$tl = get_term_link($tag);
			echo "<span class='tag'><a href='$tl'>$tag->name</a></span>";
		} }
		// print parent post link if any
		if($post->ID != $parent->ID){ 
			$permalink = get_permalink($parent->ID);
			echo "<p>Component of: <a href='$permalink'>$parent->post_title</a></p>";
		}
		// print links to components if any
		if( count($components) > 0 ){
			echo "<p>Components of this project include:</p>\n<ul>";
			foreach($components as $component){
				$permalink = get_permalink($component->ID);
				echo "<li><a href='$permalink'>$component->post_title</a></li>";
			}
			echo "\n</ul>";
		}
		// list any projects caused by this one
		if( $caused != '' ){
			$caused_project_IDs = explode(',',$caused);
			echo "<p>Causal links to the following projects:</p>";
			echo '<ul>';
			foreach($caused_project_IDs as $project_ID){
				$pid = intval($project_ID);
				$title = get_the_title($pid);
				$permalink = get_permalink($pid);
				echo "<li><a href='$permalink'>$title</a></li>";
			}
			echo '</ul>';
		}
		// list any projects that helped cause this one
		if ( $caused_by_query->have_posts() ) {
			echo '<p>Causal links from the following projects:</p>';
			echo '<ul>';
			while ( $caused_by_query->have_posts() ) {
				$caused_by_query->the_post();
				$permalink = get_permalink($post->ID);
				echo "<li><a href='$permalink'>$post->post_title</a></li>";
			}
			echo '</ul>';
		}
		echo '</div><!--#metabox-->';
	} // end the loop 
	?>
</div><!--#charta-vitae-->
<?php get_footer();?>
