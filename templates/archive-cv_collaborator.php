<?php get_header(); ?>

<h1>Collaborator archive</h1>

<?php
// the query
$wpq = new WP_Query(array('post_type'=>'cv_collaborator', 'posts_per_page'=>-1));
 
if ( $wpq->have_posts() ) { 
?>
<ul>
	<?php while ( $wpq->have_posts() ){ $wpq->the_post(); ?>
		<li><a href="<?php the_permalink();?>"><?php the_title();?></a></li>
	<?php } ?>
</ul>

<?php } ?>

<?php get_footer(); ?>
