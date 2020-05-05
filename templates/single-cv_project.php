<?php get_header(); ?>
<div id="charta-vitae">
	<h1><?php echo get_the_title(); ?></h1>
	<!--TODO add proper dynamic link-->
	<p><a href="<?php echo get_site_url();?>/?page_id=1285" title="view this project in context">Charta Vitae</a></p>
	<?php if(have_posts()){ 
		the_post();
		// query all the metadata!
		$start = get_post_meta($post->ID,'start',true);
		$end = get_post_meta($post->ID,'end',true);
		$tags = get_the_terms($post->ID,'cv_tag');
		$parent = get_post($post->post_parent); // defaults to post if no parent
		$components = get_children( [
			'post_parent' => $post->ID,
			'post_type' => 'cv_project'
		] );
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
			echo "<p>Components of this project:</p>\n<ul>";
			foreach($components as $component){
				
				$permalink = get_permalink($component->ID);
				echo "<li><a href='$permalink'>$component->post_title</a></li>";
			}
			echo "\n</ul>";
		}
		echo '</div><!--#metabox-->';
	} // end the loop 
	?>
</div><!--#charta-vitae-->
<?php get_footer();?>
