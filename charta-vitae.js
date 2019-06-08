// DOCUMENT STRUCTURE
// 1. data class definitions
// 2. global variables
// 3. function declarations

class CVevent {
	// currently just replicates the node data object
	constructor(id,url){
		this._id = id; // WP post ID
		this._url = url; // WP post href
		this._date = null; // not yet implemented
		this._strata = []; // links to parent stratum objects
		// reserved for simulation
		this.x; this.y; this.vx; this.vy;
	}
	get id(){ return this._id; } // WP post_id
	get url(){ return this._url; }
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
	constructor(source,target,slug){
		console.assert(source instanceof CVevent,'non-event source');
		console.assert(target instanceof CVevent,'non-event target');
		this._source = source;
		this._target = target;
		this._slug = slug;
	}
	get source(){return this._source;}
	get target(){return this._target;}
	get filum(){return this._slug;}
	get id(){ return this._source.id+'-'+this._target.id+'-'+this._slug; }
}

class Stratum {
	constructor(slug,name,displayDefault){
		this._name = name;					// Full name
		this._slug = slug;					// short name and unique id
		this._rendered = displayDefault == 'true';	// boolean
		this._nodes = [];						// direct child nodes/events, in order
		this._parent = null;					// link to parent stratum if any
		this._subStrata = [];				// children strata
		this._color = undefined;			// rendered line color
	}
	// rendering settings
	get rendered(){ return this._rendered; }
	render(){ this._rendered = true; }
	unrender(){ this._rendered = false; }
	// accessors
	get nodes(){ return this._nodes; }
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
	setParent(parentStratum){ 
		this._parent = parentStratum; 
	}
	addChild(childStratum){ 
		this._subStrata.push(childStratum); 
	}
	addNode(event){
		event.addStratum(this);
		this._nodes.push(event);
	}
	get links(){
		let l = [];
		for( let i=1; i<this._nodes.length; i++ ){
			l.push( new Link( this._nodes[i-1], this._nodes[i], this.slug ) );
		}
		return l;
	}
	setColor(color){ this._color = color; }
	get color(){ return this._color; }
}

// container class for all necessary data
class chartaData {
	constructor(){
		this._strata = [];
		this._nodes = []; // list of unique events/nodes
	}
	get nodes(){ return this._nodes; }
	// push an event onto the node list, returning the unique node reference
	pushNode(event){
		console.assert(event instanceof CVevent,'non-event pushed');
		// is the node already in the list?
		if( this._nodes.map( n=>n.id ).includes( event.id ) ){ 
			// if we already have the node then just return 
			// the reference to the one we have
			return this._nodes.filter(n=>n.id==event.id)[0];
		}else{
			this._nodes.push(event);
			return event; 
		}
	}
	addTopStratum(stratum){ this._strata.push(stratum); }
	get links(){ 
		return flatten(this.renderedStrata.map(s=>s.links)); 
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


// configure graph
const width =  600;
const height = 400;
//
var simulation;
// SVG elements
var node_group;
var line_group;

// global data variables
var theData = new chartaData();
// line generator
var lineGen = d3.line() .x(d=>d.x) .y(d=>d.y) .curve(d3.curveNatural);


// pull all of the data out of the page into memory: theData
function new_gather_all_the_data(){
	let topStrata = d3.selectAll('#chartaData li.stratum[data-level="0"]').nodes();
	for(let stratum of topStrata){ 
		theData.addTopStratum( searchStrata(stratum) ); 
	}
}

// given a stratum li, search descendents and add their data
function searchStrata( stratumElement, parentStratum ){
	// first get data on this layer itself	
	let thisStratum = new Stratum(
		stratumElement.dataset.stratum, //slug
		d3.select(stratumElement).select('.stratum-name').text(), //name
		stratumElement.dataset.display //display
	);
	if(parentStratum){ thisStratum.setParent(parentStratum); }
	// find any nodes/events of this stratum
	let events = d3.select(stratumElement).selectAll('li.eventus').nodes();
	for(let eventElement of events){
		let eventus = new CVevent(
			eventElement.dataset.nodeId, // id
			d3.select(eventElement).select('a').attr('href') // url
		);
		thisStratum.addNode( theData.pushNode(eventus) );
	}
	// recursively get data on stratum's children
	let nextLevel = 1 + parseInt(stratumElement.dataset.level);
	let selector = 'li.stratum[data-level="'+nextLevel+'"]';
	let subStrata = d3.select(stratumElement).selectAll(selector).nodes();
	for(let subStratumElement of subStrata){
		thisStratum.addChild( searchStrata( subStratumElement, thisStratum ) );
	}
	return thisStratum;
}

window.onload = function(){
	// create SVG element before the first subtitle
	let SVGtransG = d3.select('#page').insert('svg','#chartaData')
		.attr('width', width).attr('height',height).append('g')
		.attr('transform','translate('+String(width/2)+','+String(height/2)+')');
	line_group = SVGtransG.append("g").attr('id','lines');
	node_group = SVGtransG.append("g").attr('id','nodes');
	// get data from page
	new_gather_all_the_data();
	setColors();
	enableChanges();
	// define non-data-based simulation forces
	simulation = d3.forceSimulation(theData.nodes)
		.velocityDecay(0.15) // lower is faster
		.force('charge_force',staticForce)
		.force('bounding_force',boundingForce)
		.on("tick",ticked);
	// update the graph
	restart();
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

function restart(alpha=1) {
	// update nodes
	nodes = node_group.selectAll('.node').data(theData.nodes,n=>n.id)
		.call(parent=>parent.select('circle').transition().attr('r',d=>d.radius));
	// enter nodes
	nodes.enter()
		.append('svg:a').attr('xlink:href',n=>n.url).attr('class','node')
		.append('circle').attr('fill','gray').attr('r',d=>d.radius);
	// exit nodes
	nodes.exit().remove();
	// update lines
	lines = line_group.selectAll('.line').data(theData.renderedStrata,s=>s.slug);
	// enter lines
	lines.enter()
		.append('svg:path')
		.attr('class',s=>s.slug+' line')
		.style('stroke',s=>s.color) .style('fill','none')
		.attr('d',filum=>lineGen(filum.nodes));
	// exit lines
	lines.exit().remove();
	// Update the simulation with data-based forces and restart
	simulation.nodes(theData.nodes).force(
		'link_force',d3.forceLink(theData.links)
		.distance( 50 )
	);
	simulation.alpha(alpha).restart();
	enable_drags();
}

// called on each simulation tick - updates geometry positions
function ticked(){
	node_group.selectAll('circle')
		.attr("cx", n => n.x )
		.attr("cy", n => n.y ); 
	line_group.selectAll('.line') 
		.attr('d',filum=>lineGen(filum.nodes));
}

// Custom force to keep all nodes in the box
function boundingForce(alpha) {
	let w2 = width/2;
	let h2 = height/2;
	theData.nodes.forEach( function(d){
		d.x = Math.max(-w2,Math.min(w2,d.x));
		d.y = Math.max(-h2,Math.min(h2,d.y));
	} );
}

var staticForce = d3.forceManyBody().distanceMax(100).strength(-20)
