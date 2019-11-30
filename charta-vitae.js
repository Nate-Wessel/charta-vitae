// configure graph
const width =  700;
const height = 500;
//
var simulation;
// SVG elements
var node_group, line_group, link_group;

// global data variables
var theData = null;
// line generator
var lineGen = d3.line() .x(d=>d.x) .y(d=>d.y) .curve(d3.curveNatural);

// e.g. '2014-11-14 09:40:32'
var dateParser = d3.utcParse("%Y-%m-%d %H:%M:%S");

// this is the thing that kicks it all off
window.onload = function(){
	// create SVG element before the first subtitle
	let SVGtransG = d3.select('#charta-vitae').insert('svg','#chartaData')
		.attr('width', width).attr('height',height).append('g')
		.attr('transform','translate('+String(width/2)+','+String(height/2)+')');
	link_group = SVGtransG.append("g").attr('id','links');
	line_group = SVGtransG.append("g").attr('id','lines');
	node_group = SVGtransG.append("g").attr('id','nodes');
	//setColors();
	//enableChanges();
	// define non-data-based simulation forces
	simulation = d3.forceSimulation()
		.nodes(cv_data.events)
		.velocityDecay(0.3) // lower is faster
		.force('charge_force',staticForce)
	//	.force('bounding_force',boundingForce)
		.on("tick",ticked);
	// update the graph
	restart();
}

function restart(alpha=1) {
	nodeUpdatePattern();
	linkUpdatePattern();
// Update the simulation with data-based forces and restart
	simulation.nodes(cv_data.events).force(
		'link_force',d3.forceLink(cv_data.links).id(n=>n.id)
		//.distance( l=>l.len )
	);
	simulation.alpha(alpha).restart();
}

function nodeUpdatePattern(){
	nodes = node_group.selectAll('.node').data(cv_data.events,n=>n.id)
		.call(parent=>parent.select('circle').transition().attr('r',10));
	nodes.enter()
		.append('svg:a').attr('xlink:href',n=>n.url).attr('class','node')
		.append('circle').attr('fill','gray').attr('r',10);
	nodes.exit().remove();
}

function linkUpdatePattern(){ // this exists only for development purposes
	links = link_group.selectAll('line.link').data(cv_data.links);
	links.enter()
		.append('svg:line').attr('class',l=>'link '+l.type)
		.style('opacity',0.25);
	links.exit().remove();
}

// called on each simulation tick - updates geometry positions
function ticked(){
	node_group.selectAll('circle')
		.attr("cx", n => n.x )
		.attr("cy", n => n.y ); 
	line_group.selectAll('.line') 
		.attr('d',filum=>lineGen(filum.pathNodes));
	link_group.selectAll('line')
		.attr("x1", d => d.source.x)
		.attr("y1", d => d.source.y)
		.attr("x2", d => d.target.x)
		.attr("y2", d => d.target.y);
}

var staticForce = d3.forceManyBody().distanceMax(100).strength(-20);

/*
class CVevent {
	// currently just replicates the node data object
	constructor(id,url,dateString){
		this._id = id; // WP post ID
		this._url = url; // WP post href
		let date = dateParser(dateString);
		this._etime = parseInt(d3.timeFormat('%s')(date)); // seconds since epoch
		this._strata = []; // links to parent stratum objects
		// reserved for simulation
		this.x; this.y; this.vx; this.vy;
	}
	get id(){ return this._id; } // WP post_id
	get url(){ return this._url; }
	get etime(){ return this._etime; }
	addStratum(stratum){ // link to parent
		this._strata.push(stratum); 
	} 
	get radius(){
		// radius in pixels of rendered circle based on number of rendered parents
		let activeParents = this._strata.map(s=>s.rendered ? 1 : 0 );
		return 5 + 3*Math.sqrt( activeParents.reduce((a,b)=>a+b) );
	}
}

class Link {
	constructor(source,target,skipped){
		this._source = source;
		this._target = target;
		this._skipped_node = skipped;
	}
	get source(){return this._source;}
	get target(){return this._target;}
	get type(){ return this._skipped_node === undefined ? 'direct' : 'spanning';}
	get id(){ return this._source.id+'->'+this._target.id+'-'+this.type; }
	get len(){ // length in pixels
		let days = Math.abs(this._target.etime - this._source.etime) / 86400;
		let minBuffer = this._target.radius + this.source.radius;
		if(this.type=='direct'){
			return minBuffer + 20 + Math.sqrt(days);
		}else{ // spanning links are longer than the combined direct links
			minBuffer += 2 * this._skipped_node.radius;
			return minBuffer + 50 + Math.sqrt(days/2)*2;
		}
	}
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

// container class for all necessary data
class chartaData {
	constructor(){
		this._strata = [];
		this._uniqueNodes = []; // list of unique events/nodes
	}
	get nodes(){ return this._uniqueNodes; }
	// push an event onto the node list, returning the unique node reference
	pushNode(event){
		console.assert(event instanceof CVevent,'non-event pushed');
		// is the node already in the list?
		if( this._uniqueNodes.map( n=>n.id ).includes( event.id ) ){ 
			// if we already have the node then just return 
			// the reference to the one we have
			return this._uniqueNodes.filter(n=>n.id==event.id)[0];
		}else{
			this._uniqueNodes.push(event);
			return event; 
		}
	}
	addTopStratum(stratum){ this._strata.push(stratum); }
	get links(){ 
		let all_links = flatten(this.renderedStrata.map(s=>s.links));
		let uids = [], unique_links = [];
		for(let link of all_links){
			if( ! uids.includes(link.id) ){ 
				uids.push(link.id);
				unique_links.push(link);
			}
		}
		return unique_links; 
	}
	get allStrata(){ // list of all rendered or unrendered stratum objects
		return flatten( this._strata.map( s=> s.allStrata ) );
	}
	get slugs(){ return this.allStrata.map( s=>s.slug ); } // list of strings

	get renderedStrata(){ 
		let strataList = [];
		for(let stratum of this.allStrata){
			if(stratum.rendered){ strataList.push(stratum); }
		}
		return strataList;
	}
	stratumBySlug(slug){
		for(let stratum of this.allStrata){
			if(stratum.slug == slug){ return stratum; }
		}
	}
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

function lineUpdatePattern(){
	lines = line_group.selectAll('.line').data(theData.renderedStrata,s=>s.slug);
	lines.enter()
		.append('svg:path')
		.attr('class',s=>s.slug+' line')
		.style('stroke',s=>s.color) .style('fill','none')
		.attr('d',filum=>lineGen(filum.pathNodes));
	lines.exit().remove();
}


// Custom force to keep all nodes in the box
function boundingForce(alpha) {
	theData.nodes.forEach( function(d){
		let halfWidth  = width/2 - d.radius;
		let halfHeight = height/2 - d.radius;
		if( Math.abs(d.x) > halfWidth ){ 
			d.x = Math.max(-(halfWidth),Math.min(halfWidth,d.x)); }
		if( Math.abs(d.y) > halfHeight ){ 
			d.y = Math.max(-(halfHeight),Math.min(halfHeight,d.y)); }
	} );
}
*/
