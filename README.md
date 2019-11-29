# Charta Vitae (Map of Life)
This project is meant to update my old [graphic resume](http://natewessel.com/portfolio/data-viz/resume-2/) using ideas from my "[sitemap](http://cincymap.org/sitemap/)" project. It uses content stored in WordPress to generate a dynamic visualization of my body of work over the last decade as it develops, changes focus, loses direction, etc. 

The idea behind this is to add a dimension or two to the standard academic [curriculum vitae](http://natewessel.com/cv/) or resume, with its long lists of categorized and standardized entries. Projects develop over time and relate to other things going on in one's life. Some things seem unrelated by the end but come from a common source, or start unrelated and merge in synthesis. Gaps in one field are explained by a burst of activity in some other area. That list of technical capabilities comes out of actual practice on tangible things to which the skills are linked.

This project is also meant to reconcile my apparent economic need to create a resume/portfolio with a refusal to portray myself one-dimensionally, with so many of the fun bits removed.

This project is in the early stages yet and there are many open design challenges remaining. Most of the bigger questions simply boil down to "_What is the nature of being in time?_" 
So since there is a book or two on that topic already, perhaps I will just read those and find some easy answers. 

# Ontology
The ontology of this project currently seems to demand that phenomena have a vaguelly discrete nature, even if they come with ill-defined boundaries. 
The _charta_ should show the _things_ that have happened, and these things can be related, either hierarchically or categorically. 

To give some examples:
* I got a degree, starting and finishing at more or less specific times. Any papers published during or shortly after this time may be directly related, and indeed at least partly constitutive of the larger event. 
* I have a partner who came into my life at a certain time, and is causally related, directly or indirectly, to many of my creative projects. (Open Question: at a certain point, he is causally related to my being who I am which itself now causes such things. Is there a _self_ to point to? Potential Solution: There is no self - the projects point to other projects. The self is the retrospective confabulation of such things.)
* I have a job from one clearly defined time to another. It has attributes like location which may be shared by other phenomenon. 
* ...

## What there is and can be:
* *event*: a thing existing in time
* *property*: could be anything, but only meaningful here if shared with other events
* *causal relation*: one thing leading to another (applies to avents, must go forward in time)
* *constitutive relation*: one thing being a part of another (applies to both events and properties and allows infinite specificity)


## Encoding the ontology (goals)
* `cv_event` post type
		- `start_time` timestamp with varying specificity
		- `end_time` timestamp with varying specificity, null for ongoing events
		- description, ie post content
* `cv_tag` non-hierarchical taxonomy
		- just plain old wordpress tags basically
		- ...
* `link` ???
		- to: post_id
		- from: post_id
		- type: causal | constitutive

## Graphical Layout
Layout will be done with d3.js and will essentially be a highly customized force-directed graph. 
This website has been the most useful: https://www.puzzlr.org/force-graphs-with-d3/
