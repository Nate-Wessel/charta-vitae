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
		this._fila = []; // links to parent filum objects
	}
	get id(){ // returns a numeric ID (wp post_id)
		return this._id;
	}
	addFilum(filum){ // a link to parent filum
		this._fila.push(filum);
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
	get id(){return this._source.id+'-'+this._target.id;}
	get filum(){return this._slug;}
}

class Filum {
	// just a temporal sequence of related events
	constructor(slug,name){
		this.name = name;
		this.slug = slug; // short name
		this._nodes = [];
		this._stratum = null; // link to parent stratum
	}
	add_event(event){
		event.addFilum(this);
		this._nodes.push(event);
	}
	get nodes(){
		return this._nodes;
	}
	// return the temporal links in this filum
	get links(){
		let l = [];
		for(let i=0;i<this._nodes.length;i++){
			if(i>0){
				let source = this._nodes[i-1];
				let target = this._nodes[i];
				l.push(new Link(source,target,this.slug));
			}
		}
		return l;
	}
	// add link to parent
	addStratum(stratum){
		this._stratum = stratum;
	}
}

// a map layer which can be turned on and off
class Stratum {
	constructor(id,name){
		this.id = id;
		this.name = name;
		this._fila = [];
	};
	add_filum(filum){
		filum.addStratum(this);
		this._fila.push(filum);
	}
	get fila(){ return this._fila; }
}

// container class for all necessary data
class chartaData {
	constructor(){
		// I want these to be private variables
		this._strata = []; // stratum -> filum -> event
		this._nodes = []; // events are nodes
	}
	// push an event onto the node list, returning the node
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
	addStratum(stratum){
		this._strata.push(stratum);
	}
	get links(){
		let l = [];
		for(let stratum of this._strata){
			for(let filum of stratum.fila){
				l = l.concat(filum.links);	
			}
		}
		return l;
	}
	get nodes(){
		return this._nodes;
	}
	get filaSlugs(){
		let nested = this._strata.map( s=> s.fila.map( f=>f.slug ) );
		return [].concat.apply([], nested);
	}
}


// configure graph
const width =  600;
const height = 400;
const radius = 8;
// d3 data arrays defining nodes and links
var nodes_data = [];
var links_data = [];
//
var simulation;
// SVG elements
var svg;
var link_group;
var node_group;

// global data variables
var theData = new chartaData();


// pull ALL of the data out of the page into JSON
function gather_all_the_data(){
	// get the strata
	let strata_elements = d3.selectAll('#page .strata .stratum').nodes();
	for ( let se of strata_elements ) {
		let stratum = new Stratum(
			se.dataset.stratum, // id
			d3.select(se).select('h2').text() // title
		);
		// now get the fila
		let fila_elements = d3.select(se).selectAll('.fila li.filum').nodes();
		for ( let fe of fila_elements ) {
			let filum = new Filum(
				fe.dataset.filum, // slug
				d3.select(fe).select('h3').text() // name
			);
			// now get the events
			let event_elements = d3.select(fe).selectAll('li.eventus').nodes();
			for ( let ee of event_elements ) {
				let eventus = new CVevent(
					ee.dataset.nodeId, // id
					d3.select(ee).selectAll('a').attr('href') // url
				);
				// this may return a reference to a different but identical object 
				eventus = theData.pushNode(eventus);
				filum.add_event(eventus);
			}
			stratum.add_filum(filum);
		}
		theData.addStratum(stratum);
	}
}

window.onload = function(){
	// create SVG element before the first subtitle
	svg = d3.select('#page').insert('svg','ul.strata')
		.attr('width', width).attr('height',height);
	link_group = svg.append("g").attr('id','links');
	node_group = svg.append("g").attr('id','nodes');
	// define non-data-based simulation forces
	simulation = d3.forceSimulation()
		.force('center_force',d3.forceCenter(width/2, height/2))
		.force('bounding_force',boundingForce)
		.force('charge_force',staticForce)
		.on("tick",ticked);
	gather_all_the_data();
	// update the graph
	restart();
}

function enable_data_changes(){
	// add checkboxes to all strata, allowing them to be turned on and off
	d3.selectAll('li.stratum h2')
		.append('input').lower() // put it before the text
		.attr('type','checkbox').attr('checked','')
		.on('change',function(){
			// hide sub lists if unchecked, show if checked
			var stratumSlug = this.parentNode.parentNode.dataset.stratum;
			if(this.checked){
				d3.selectAll('li.stratum[data-stratum='+stratumSlug+'] ul.fila')
					.style('display','');
				//add_stratum(stratumSlug);
			}else{
				d3.selectAll('li.stratum[data-stratum='+stratumSlug+'] ul.fila')
					.style('display','none');
				remove_stratum(stratumSlug);
			}
		});
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

function restart() {
	let fila_colors = d3.scaleOrdinal(d3.schemeCategory20)
		.domain(theData.filaSlugs);
	// join nodes 
	nodes = node_group.selectAll('circle').data(theData.nodes,d=>d.id);
	// enter nodes
	nodes.enter().append("circle")
		.attr("fill",'gray')
		.attr("r",radius)
		.merge(nodes);
	nodes.exit().remove();
	// join links
	links = link_group.selectAll('line').data(theData.links);
	// enter links
	links.enter().append("line")
		.attr('stroke',d => fila_colors(d.filum) )
		.attr('class',d=>'fila '+d.filum)
		.merge(links);
	// exit links
	links.exit().remove();
	// Update the simulation with data-based forces and restart
	simulation.nodes(theData.nodes).force(
		'link_force',d3.forceLink(theData.links).id( datum => datum.id )
		.distance( 50 )
	);
	simulation.alpha(1).restart();
	enable_drags();
}

// called on each simulation tick - updates geometry positions
function ticked(){
	node_group.selectAll('circle')
		.attr("cx", d => d.x )
		.attr("cy", d => d.y ); 
	link_group.selectAll('line')
		.attr("x1", d => d.source.x )
		.attr("y1", d => d.source.y )
		.attr("x2", d => d.target.x )
		.attr("y2", d => d.target.y );
}

// Custom force to keep all nodes in the box
function boundingForce() {
	for (let node of nodes_data) {
		node.x = Math.max(radius,Math.min(width-radius,node.x));
		node.y = Math.max(radius,Math.min(height-radius,node.y));
	}
}

var staticForce = d3.forceManyBody().distanceMax(100).strength(-20)
