<?php get_header(); ?>

<h1>Project archive</h1>

<?php if ( have_posts() ) { ?>
<ul>
	<?php while ( have_posts() ){ the_post(); ?>
		<li><a href="<?php the_permalink();?>"><?php the_title();?></a></li>
	<?php } ?>
</ul>

<?php } ?>

<?php get_footer(); ?>
