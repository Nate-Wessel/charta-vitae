<?php get_header(); ?>

<h1>Project Archive</h1>

<?php // get the search tag if any
$parenthetical = '';
if( $qv = get_query_var('cv_tag') ){
	$term = get_term_by('slug',$qv,'cv_tag');
	$parenthetical = ", related to <i>$term->name</i>,";
}
?>

<p>These projects<?php echo $parenthetical;?> are part of the <a href="<?php echo get_site_url();?>/?page_id=1285">Charta Vitae</a>.</p>

<?php if ( have_posts() ) { ?>
<ul>
	<?php while ( have_posts() ){ the_post(); ?>
		<li><a href="<?php the_permalink();?>"><?php the_title();?></a></li>
	<?php } ?>
</ul>

<?php } ?>

<?php get_footer(); ?>
