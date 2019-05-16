# Charta Vitae (Map of Life)
This project is meant to update my old [graphic resume](http://natewessel.com/cartography/resume-2/) using ideas from my "[sitemap](http://cincymap.org/sitemap/)" project. I'll use content in/from my WordPress websites to generate a dynamic visualization of my body of work over the last decade as it develops, changes focus, loses direction, etc. 

The idea behind this is to add dimensions to the standard academic [curriculum vitae](http://natewessel.com/cv/), with its long lists of categorized and standardized entries. Projects develop over time and relate to other things going on in one's life. Some things seem unrelated by the end but come from a common source, or start unrelated and merge in synthesis. Gaps in one field are explained by a burst of activity in some other area. That list of technical capabilities comes out of actual practice on tangible things to which the skills are linked.

This project is also meant to reconcile my economic need to create a resume/portfolio with a refusal to portray myself one-dimensionally, with so many of the fun bits removed.

## Plan of Work:
* determine the graphic nature of time (linear? cyclical? radial?)
* determine the screen/device this can be designed for
* will this be stochastic or deterministic?
* is there a _here_?
* ...

## Ontology
Events happen at moments and most events are linked by occupations. Occupations are sequences of events with optional additional start and end times. 

Some events are free-standing. 

Events can be shared by 2+ occupations, though this should be rare.

### Endogenous (in wordpress already)
All pages and posts are explicitly dated and are thus events on the moment of publication.

### Exogenous (not native to wordpress)
Occupations will be mapped onto a custom taxonomy associated with 0+ pages or posts. Taxonomy metadata will be used to assign optional start and end times plus color and other metadata.

Custom taxonomies:
* Occupations (durable. e.g. getting a degree)
    - `start_time`
    - `end_time` (ongoing = none)
    - `color`
    - `page` Can this perhaps be used to provide an extended description of the occupation?
