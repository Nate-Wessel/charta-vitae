// configure graph
const width =  700;
const height = 700;
//
var simulation;
// SVG elements
var node_group, line_group, link_group;
var svg, SVGtransG;

// global data variables
var CVD;
// line generator
var lineGen = d3.line() .x(d=>d.x) .y(d=>d.y) .curve(d3.curveNatural);

// bounding event times
var startTime, endTime;

// this is the thing that kicks it all off
window.onload = function(){
	setupCharta();
	// parse and extend the JSON data from Wordpress
	CVD = new chartaData(cv_data);
	startTime = Math.min( ...CVD.events.map(e=>e.start) );
	endTime = Math.max( ...CVD.events.map(e=>e.end) );
	//setColors();
	//enableChanges();
	// define non-data-based simulation forces
	simulation = d3.forceSimulation()
		.nodes(CVD.events)
		.velocityDecay(0.3) // lower is faster
		.force('charge_force',staticForce)
		//.force('bounding_force',boundingForce)
		.force('date_position',yForce)
		.on("tick",ticked);
	// update the graph
	restart();
}

function setupCharta(){
	// create SVG element before the first subtitle
	let cv = d3.select('#charta-vitae');
	svg = cv.insert('svg').attr('width',width).attr('height',height);
	// define an arrow marker
	svg.append('svg:defs').insert('svg:marker').attr('id','markerArrow')
		.attr('markerWidth','4').attr('markerHeight','4')
		.attr('refX','2').attr('refY','2').attr('orient','auto')
		.append('svg:path').attr('d','M0,0 L0,4 L4,2 L0,0');
	// append a transform group containing everyhting
	SVGtransG = svg.append('g')
		.attr('transform','translate('+String(width/2)+','+String(height/2)+')');
	link_group = SVGtransG.append("g").attr('id','links');
	line_group = SVGtransG.append("g").attr('id','lines');
	node_group = SVGtransG.append("g").attr('id','nodes');
	// add section for links to tag selectors 
	let metaDiv = cv.append('div').attr('id','metabox');
	metaDiv.append('h3').text('Event Tags');
	let tagContainer = metaDiv.append('div').attr('class','container');
	let tags = tagContainer.selectAll('div.tag').data(cv_data.tags);
	tags.enter().append('div').attr('class','tag')
		.attr('title',t=>t.description)
		.text(t=>t.name);
}

function restart(alpha=1) {
	nodeUpdatePattern();
	//lineUpdatePattern();
	linkUpdatePattern();
	// Update the simulation with data-based forces and restart
	simulation.nodes(CVD.events).force(
		'link_force',d3.forceLink(CVD.links).id(n=>n.id)
		.distance( l=>l.length ).strength(0.05)
	);
	simulation.alpha(alpha).restart();
	enable_drags();
}

function nodeUpdatePattern(){
	nodes = node_group.selectAll('.node').data(CVD.events,n=>n.id)
		.call(parent=>parent.select('circle').transition().attr('r',n=>n.radius));
	nodes_a = nodes.enter()
		.append('svg:a').attr('xlink:href',n=>n.url).attr('class','node');
	nodes_a.append('title').text(n=>n.title);
	nodes_a.append('circle').attr('fill','gray').attr('r',n=>n.radius);
	nodes.exit().remove();
}

function linkUpdatePattern(){ 
	links = link_group.selectAll('polyline.link').data(CVD.links);
	links.enter().append('svg:polyline').attr('class',l=>'link '+l.type);
	links.exit().remove();
}

// called on each simulation tick - updates geometry positions
function ticked(){
	node_group.selectAll('circle')
		.attr("cx", n => n.x )
		.attr("cy", n => n.y ); 
//	line_group.selectAll('.line') 
//		.attr('d',filum=>lineGen(filum.pathNodes));
	link_group.selectAll('polyline')
		.attr('points',function(d){
			let x1 = d.source.x, y1 = d.source.y;
			let x2 = d.target.x, y2 = d.target.y;
			return x1+','+y1+' '+(x1+x2)/2+','+(y1+y2)/2+' '+x2+','+y2;
		});
}

var staticForce = d3.forceManyBody().distanceMax(100).strength(-30);
var yForce = d3.forceY()
	.y(e=> -(e.midTime-startTime)/(endTime-startTime)*height+height/2)
	.strength(e=>e.timeCertainty);

function enable_drags(){
	//create drag handler     
	var drag_handler = d3.drag()
		.on('start', function(d){
			// set the fixed position of the node to be where it was when clicked
			if (!d3.event.active) simulation.alphaTarget(0.3).restart();
			[d.fx,d.fy] = [d.x,d.y];
		})
		.on('drag',function(d){ [ d.fx, d.fy ] = [ d3.event.x, d3.event.y ]; })
		.on('end',function(d){
			if (!d3.event.active) simulation.alphaTarget(0);
			[d.fx,d.fy] = [null,null];
		})
	//apply the drag_handler to the circles 
	let all_nodes = node_group.selectAll('circle');
	drag_handler(all_nodes);
}

// container class for all necessary data
class chartaData {
	constructor(json_data){
		// lets keep all structure from JSON to this function
		this._events = [];
		this._logicalLinks = [];
		this._structuralLinks = [];
		// convert events to event objects
		for( let e of json_data['events'] ){
			this._events.push( new CVevent( 
				e.id, e.url, e.title,
				e.start, e.end, e.strata, e.tags // start & end may be undefined
			) );
		}
		// convert logical links to link objects
		for( let l of json_data['links'] ){
			this._logicalLinks.push( new Link(
				this.eventByID(l.source),
				this.eventByID(l.target),
				l.type
			) );
		}
	}
	// accessors 
	get events(){ return this._events; }
	get links(){ return this._logicalLinks; }
	eventByID(event_id){
		for(let event of this._events){
			if( event_id == event.id ){ return event; }
		}
		return event_id;
	}
}

class CVevent {
	// currently just replicates the node data object
	constructor(id,url,title,start,end,strata,tags){
		this._id = id; // WP post ID
		this._url = url; // WP post href
		this._title = title; 
		this._start = cvDateParse(start);
		this._end = cvDateParse(end);
		this.strata = strata; 
		this.tags = tags;
		// reserved for simulation
		this.x; this.y; this.vx; this.vy;
	}
	get id(){ return this._id; } // WP post_id
	get url(){ return this._url; }
	get title(){ return this._title; }
	get start(){ return this._start; }
	get end(){ return this._end; }
	get midTime(){ return this._start + this.duration / 2; }
	get duration(){ 
		// estimated duration of event in seconds, defaulting to 0
		if ( this._start && this._end  && this._start <= this._end ) {
			return this._end - this._start
		}else{ 
			return 0;
		}
	}
	get radius(){ return Math.sqrt(this.duration/3600/24 + 5); }
	get timeCertainty(){ 
		// bigger date ranges mean fuzzier positions
		return 1/this.radius;
	}
}

class Link {
	constructor(sourceEventRef,targetEventRef,type){
		this._source = sourceEventRef;
		this._target = targetEventRef;
		this._type  = type;
	}
	get source(){return this._source;}
	get target(){return this._target;}
	get type(){return this._type;}
	get length(){ // optimal length in pixels
		return 5 + this.source.radius + this.target.radius;
	}
}

function cvDateParse(dateString){
	// parse a date (YYYY-MM-DD HH:MM:SS) with optional precision
	// returning an epoch int
	date = // assigns first non-null value
		d3.utcParse("%Y-%m-%d %H:%M:%S")(dateString) || 
		d3.utcParse("%Y-%m-%d %H:%M")(dateString) ||
		d3.utcParse("%Y-%m-%d %H")(dateString) ||
		d3.utcParse("%Y-%m-%d")(dateString) ||
		d3.utcParse("%Y-%m")(dateString) ||
		d3.utcParse("%Y")(dateString);
	if(date){ // seconds since the epoch
		return Number(d3.timeFormat('%s')(date)); 
	}else{ // default to now
		return Number(d3.timeFormat('%s')(new Date));
	}
}

/*
// Custom force to keep all nodes in the box
function boundingForce(alpha) {
	CVD.events.forEach( function(e){
		let halfWidth  = width/2 - e.radius;
		let halfHeight = height/2 - e.radius;
		if( Math.abs(e.x) > halfWidth ){ 
			e.x = Math.max(-(halfWidth),Math.min(halfWidth,e.x)); }
		if( Math.abs(e.y) > halfHeight ){ 
			e.y = Math.max(-(halfHeight),Math.min(halfHeight,e.y)); }
	} );
}

class Stratum {
	constructor(slug,name,displayDefault){
		this._name = name;			// Full name
		this._slug = slug;			// short name and unique id
		this._rendered = displayDefault == 'true';	// boolean
		this._ownNodes = [];			// direct child nodes/events, in chron order
		this._parent;					// link to parent stratum if any
		this._subStrata = [];		// children strata
		this._color;					// rendered line color
		// links to adjacent nodes in the parent category: pre2,pre1,post1,post2
		this._adjacentNodes = [undefined,undefined,undefined,undefined];
	}
	// rendering settings
	get rendered(){ return this._rendered; }
	render(){ 
		this._rendered = true; 
		this._subStrata.map(ss=>ss.linkAdjacentNodes());
	}
	unrender(){ 
		this._rendered = false; 
		this._subStrata.map(ss=>ss.linkAdjacentNodes());
	}
	linkAdjacentNodes(){
		// add adjacent nodes from rendered parent strata
		// fresh start
		this._adjacentNodes = [undefined,undefined,undefined,undefined];
		if ( ! ( 
			this.hasRenderedParent && 
			this._parent.nodes.length > 1 && this._ownNodes.length > 1 
		) ){ return; }
		// parent 1-2-3-4---6---8-9
		// self           5---7 
		// links to [3,4,8,9]
		let pNodes = this._parent.nodes;
		let start = this._ownNodes[0].etime;
		let end = this._ownNodes[this._ownNodes.length-1].etime;
		// see if start or end are between parent nodes
		for( let i=1; i<pNodes.length; i++ ){
			if( start > pNodes[i-1].etime && start < pNodes[i].etime ){
				this._adjacentNodes[1] = pNodes[i-1];
				if(i>1){this._adjacentNodes[0] = pNodes[i-2]; }
			}
			if( end > pNodes[i-1].etime && end < pNodes[i].etime ){
				this._adjacentNodes[2] = pNodes[i];
				if( i < pNodes.length - 2 ){ this._adjacentNodes[3] = pNodes[i+1]; }
			}
		}
		// now see if they are before/after the first/last
		if( start > pNodes[pNodes.length-1].etime ){
			this._adjacentNodes[0] = pNodes[pNodes.length-2];
			this._adjacentNodes[1] = pNodes[pNodes.length-1];
		}else if( end < pNodes[0].etime ){
			this._adjacentNodes[2] = pNodes[0];
			this._adjacentNodes[3] = pNodes[1];
		}
	}
	get nodes(){ return this._ownNodes; }
	get pathNodes(){
		// nodes used to render the smooth line (ownNodes +1 either way)
		let n1 = this._adjacentNodes[1], n2 = this._adjacentNodes[2];
		n1 = n1 instanceof CVevent ? [n1] : [];
		n2 = n2 instanceof CVevent ? [n2] : [];
		return n1.concat(this._ownNodes,n2);
	}
	get spanningLinkNodes(){
		// ownNodes plus all adjacent for sanning straightening links
		let n0 = this._adjacentNodes[0], n3 = this._adjacentNodes[3];
		n0 = n0 instanceof CVevent ? [n0] : [];
		n3 = n3 instanceof CVevent ? [n3] : [];
		return n0.concat(this.pathNodes,n3);
	}
	get name(){ return this._name; }
	get parent(){ return this._parent; }
	get slug(){ return this._slug; }
	get slugs(){ // return a list of slugs belonging to this and children
		return this._subStrata.map(s=>s.slug).push(this.slug);
	}
	get allStrata(){ 
		if(this._subStrata.length==0){ return this; }
		let nested = [this].concat( this._subStrata.map(st=>st.allStrata) );
		return flatten(nested);
	}
	// adding links
	setParent(parentStratum){ this._parent = parentStratum; }
	get hasParent(){ return typeof(this._parent) === typeof(this); }
	get hasRenderedParent(){ return this.hasParent && this._parent.rendered; }
	addChild(childStratum){ this._subStrata.push(childStratum); }
	addNode(event){ event.addStratum(this); this._ownNodes.push(event); }
	get links(){
		let links = [];
		// direct node->node links
		for( let i=1; i<this.pathNodes.length; i++ ){
			links.push( new Link( this.pathNodes[i-1], this.pathNodes[i] ) );
		}
		// longer straightening links, skipping nodes
		for( let i=2; i<this.spanningLinkNodes.length; i++ ){
			links.push( new Link( 
				this.spanningLinkNodes[i-2], 
				this.spanningLinkNodes[i], 
				this.spanningLinkNodes[i-1] 
			) );
		}
		return links;
	}
	setColor(color){ this._color = color; }
	get color(){ return this._color; }
}

function flatten(ary) { // flattens nested arrays
	let ret = [];
	for(let item of ary){
		if( Array.isArray(item) ){ ret = ret.concat(flatten(item)); }
		else { ret.push(item); }
	}
	return ret;
}

function setColors(){
	let colors = d3.scaleOrdinal()
		.domain(theData.slugs).range(d3.schemeCategory20);
	for( let stratum of theData.allStrata ){
		stratum.setColor( colors(stratum.slug) );
	}
}

function enableChanges(){
	// add checkboxes for all fila, allowing them to be turned on and off
	// first create a list for holding the toggles
	let toggles = d3.select('#page').insert('ul','#chartaData').selectAll('li')
		.data(theData.allStrata).enter().append('li');
	// add checkboxes to each li
	toggles.append('input')
		.attr('type','checkbox').property('checked',d=>d.rendered)
		.attr('value',d=>d.slug)
		.on('change',toggleClicked);
	// add a colored box (legend symbol)
	toggles.append('span').attr('class','symbol')
		.style('background-color',s=>s.color);
	// label the checkboxes
	toggles.append('label').text(d=>d.name);
}

// a checkbox was either ticked or unticked. 
function toggleClicked(event){
	if(this.checked){ drawStratum(this.value); }
	else{ undrawStratum(this.value); }
}
function drawStratum(slug){
	theData.stratumBySlug(slug).render();
	restart(0.5);
}
function undrawStratum(slug){
	theData.stratumBySlug(slug).unrender();
	restart(0.5);
}


function lineUpdatePattern(){
	lines = line_group.selectAll('.line').data(theData.renderedStrata,s=>s.slug);
	lines.enter()
		.append('svg:path')
		.attr('class',s=>s.slug+' line')
		.style('stroke',s=>s.color) .style('fill','none')
		.attr('d',filum=>lineGen(filum.pathNodes));
	lines.exit().remove();
}

*/
