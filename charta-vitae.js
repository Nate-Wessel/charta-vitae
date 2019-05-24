class nodesList {
	constructor(){
		this.nodes = []; // the big important list
	}
	pushNode(event){
		// check that the node isn't already in the list before adding it		
		if( ! this.nodes.map(n=>n.uid()).includes(event.uid()) ){ 
			this.nodes.push(event); 
		}
	}
}

class CVevent {
	// currently just replicates the node data object
	constructor(id,url){
		this.id = id; 
		this.url = url;
	}
	uid(){ // returns a numeric ID (wp post_id)
		return +this.id.match(/\d+/);
	}
}

class Filum {
	// just a temporal sequence of related events
	constructor(slug,name){
		this.name = name;
		this.slug = slug; // short name
		this.nodes_list = [];
	}
	add_event(event){
		this.nodes_list.push(event);
	}
}

// a map layer which can be turned on and off
class Stratum {
	constructor(id,name){
		this.id = id;
		this.name = name;
		this.the_fila = [];
	};
	add_filum(filum){
		this.the_fila.push(filum);
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
var theStrata = [];
var theNodes = new nodesList(); 

// this will get deleted soon
var mapped_fila_slugs = [];


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
				theNodes.pushNode(eventus);
				filum.add_event(eventus);
			}
			stratum.add_filum(filum);
		}
		theStrata.push(stratum);
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
	add_all_fila();
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

function add_all_fila(){
	// get post data from HTML into an array
	var fila = d3.selectAll('#page ol.eventus').nodes();
	for ( let elem of fila ) {
		add_filum(elem.dataset.filum);
		
	}
}

function add_filum(slug){
	// add to the list of mapped fila
	mapped_fila_slugs.push(slug);
	// get data on this filum from the document
	let elements = d3.selectAll('#page li.eventus[data-filum='+slug+']').nodes();
	for( let elem of elements ) {
		// add nodes
		nodes_data.push( new CVevent(
			elem.dataset.nodeId, elem.dataset.stratum,
			elem.dataset.filum, 
			d3.select(elem).select('a').attr('href')
			
		)	);
		// add links
		if(elem.dataset.anteNode){
			let new_link = {
				'source':elem.dataset.anteNode, 'target':elem.dataset.nodeId,
				'stratum':elem.dataset.stratum, 'filum':slug,
				'type':'filum'
			} 
			links_data.push(new_link);
		}
//		if(elem.dataset.gemini){
//			for ( let targetId of elem.dataset.gemini.split(' ') ) {
//				let new_link = { 
//					'source':elem.dataset.nodeId, 
//					'target':targetId, 
//					'type':'geminus'
//				};
//				links_data.push(new_link);
//			}
//		}
	}
	restart();
}

function remove_filum(slug){
	// remove from list of mapped fila
	mapped_fila_slugs = mapped_fila_slugs.filter(mappedSlug => mappedSlug != slug);
	// get a list of node_ids's to remove (used for dropping links)
	let ids = nodes_data.filter(node=>node.filum==slug).map(node=>node.id);
	links_data = links_data.filter(
		link => ! ( ids.includes(link.target.id) || ids.includes(link.source.id) )
	);
	// and now drop those nodes
	nodes_data = nodes_data.filter(node=>node.filum!=slug);
	restart();
}

function remove_stratum(slug){
	// first remove links, then nodes
	// get a list of nodes to remove
	let delNid = nodes_data
		.filter(node => node.stratum == slug)
		.map(node=>node.id);
	// remove links associated with the nodes to remove
	links_data = links_data.filter(
		link => !( delNid.includes(link.target) || delNid.includes(link.source) )
	);
	// identify the nodes from this stratum and remove them
	nodes_data = nodes_data.filter( node => node.stratum != slug );
	restart();
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
		.domain(mapped_fila_slugs);
	// join nodes 
	nodes = node_group.selectAll('circle').data(nodes_data,d=>d.id);
	// enter nodes
	nodes.enter().append("circle")
		.attr("fill",'gray')
		.attr("r",radius)
		.merge(nodes);
	nodes.exit().remove();
	// join links
	links = link_group.selectAll('line').data(links_data,d=>d);
	// enter links
	links.enter().append("line")
		.attr('stroke',d => d.type=='filum' ? fila_colors(d.filum) : 'red' )
		.attr('class', d => 'new '+d.type )
		.merge(links);
	// exit links
	links.exit().remove();
	// Update the simulation with data-based forces and restart
	simulation.nodes(nodes_data).force(
		'link_force',d3.forceLink(links_data).id( datum => datum.id )
		.distance( datum => datum.type=='geminus' ? 0 : 50 )
	);
	simulation.alpha(1).restart();
	enable_drags();
}

// link key function https://github.com/d3/d3-selection/blob/v1.4.0/README.md#selection_data
function link_key(datum,index){
	if(datum.source.id){ return datum.source.id+'-'+datum.target.id; }
	return datum.source+'-'+datum.target;
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
