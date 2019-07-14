# Charta Vitae (Map of Life)
This project is meant to update my old [graphic resume](http://natewessel.com/cartography/resume-2/) using ideas from my "[sitemap](http://cincymap.org/sitemap/)" project. It uses content stored in WordPress to generate a dynamic visualization of my body of work over the last decade as it develops, changes focus, loses direction, etc. 

The idea behind this is to add dimensions to the standard academic [curriculum vitae](http://natewessel.com/cv/) or resume, with its long lists of categorized and standardized entries. Projects develop over time and relate to other things going on in one's life. Some things seem unrelated by the end but come from a common source, or start unrelated and merge in synthesis. Gaps in one field are explained by a burst of activity in some other area. That list of technical capabilities comes out of actual practice on tangible things to which the skills are linked.

This project is also meant to reconcile my economic need to create a resume/portfolio with a refusal to portray myself one-dimensionally, with so many of the fun bits removed.

## Open Questions
* determine the graphic nature of time (linear? cyclical? radial?)
* determine the screen/device this can be designed for
* is there a _here_?
* ...

## Ontology
Events happen at moments and most events are linked by threads. 
This is equivalent to a node/edge graph structure.

### Types of threads
* Occupations (ongoing attended work in some area)
* Time (may not be rendered - perhaps rendered as a silly billy path?)
* Theme (related to maps, related to sewing) perhaps these can be flagged on and off?
* Connections (connecting events shared by multiple threads)

### Types of events
* publications (blog, paper, map, etc)
* beginnings and endings

Events have times and places. 
Some events are free-standing, with only a temporoal location. 
Events can be shared by multiple threads, though this should be relatively rare.

### Endogenous data (in wordpress already)
All pages and posts are explicitly dated and are thus events on the moment of publication.

### Exogenous data (not native to wordpress)
Occupations will be mapped onto a custom taxonomy associated with pages or posts. Taxonomy metadata will be used to assign optional start and end times plus color and other metadata.

Custom taxonomies:
* Occupations (durable. e.g. getting a degree)
    - `start_time`
    - `end_time` (ongoing = none)
    - `color`
    - `page` Can this perhaps be used to provide an extended description of the occupation?

## Graphical Layout
Layout will be done with d3.js and will essentially be a highly customized force-directed graph. 
This website has been the most useful: https://www.puzzlr.org/force-graphs-with-d3/
