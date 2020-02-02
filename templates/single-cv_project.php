<?php get_header(); ?>
<div id="charta-vitae">
	<h1><?php echo get_the_title(); ?></h1>
	<!--TODO add proper dynamic link-->
	<p><a href="<?php echo get_site_url();?>/?page_id=1285">Back to Map</a></p>
	<?php if(have_posts()){ the_post();
		$start = get_post_meta($post->ID,'start',true);
		$end = get_post_meta($post->ID,'end',true);
		echo "<p>Starts: $start, Ends: $end</p>"; ?>
		<?php the_content(); ?>
		<div id="metabox">
		<?php foreach(get_the_terms($post->ID,'cv_tag') as $tag){ ?>
			<span class='tag'><?php echo $tag->name; ?></span>
		<?php } ?>
		</div><!--#metabox-->
		<?php
	} // end the loop 
	?>
</div><!--#charta-vitae-->
<?php get_footer();?>
