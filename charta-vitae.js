// configure graph
const width =  600
const height = 400
const radius = 8

// data for nodes and links
var nodes_data = [];
var links_data = [];
// elements representing nodes and links
var nodes_repr = [];
var links_repr = [];

var simulation = d3.forceSimulation();

window.onload = function(){
	// create SVG element before the first subtitle
	var svg = d3.select('#page').insert('svg','ul.strata')
		.attr('width', width)
		.attr('height',height);
	// add check boxes to stratum titles
	enable_data_changes();
	// pull all the data
	get_data();
	// define forces
	simulation.nodes(nodes_data)
		.force('center_force',d3.forceCenter(width/2, height/2))
		.force('bounding_force',boundingForce)
		.force('charge_force',staticForce)
		.force('link_force',linkForce);
	
	init_graph(svg);
	enable_drag();
}

function enable_data_changes(){
	// add checkboxes to all strata, allowing them to be turned on and off
	d3.selectAll('li.stratum h2')
		.append('input').lower() // put it before the text
		.attr('type','checkbox')
		.attr('checked','')
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

function get_data(){
	// get post data from HTML into an array
	var event_entries = d3.selectAll('#page li.eventus').nodes();
	for ( let elem of event_entries ) {
		// append all elements as nodes
		nodes_data.push( {
			'id':elem.dataset.nodeId, 'stratum':elem.dataset.stratum,
			'filum':elem.dataset.filum, 
			'url':d3.select(elem).select('a').attr('href')
		} );
		// some nodes entail links
		if(elem.dataset.anteNode){
			links_data.push( {
				'source':elem.dataset.anteNode, 'target':elem.dataset.nodeId,
				'stratum':elem.dataset.stratum, 'type':'filum'
			} );
		}
		if(elem.dataset.gemini){
			for ( let targetId of elem.dataset.gemini.split(' ') ) {
				if( targetId > elem.dataset.nodeId ) { // avoid duplicates
					links_data.push( {
						'source':elem.dataset.nodeId, 'target':targetId, 
						'type':'geminus'
					} );
				}
			}
		}
	}
}

function remove_stratum(slug){
	// first remove links, then nodes
	// get a list of nodes to remove
	let del_nodes = nodes_data.filter(node => node.stratum == slug);
	// remove links associated with the nodes to remove
	links_data = links_data.filter(
		link => ( del_nodes.includes(link.target) || del_nodes.includes(link.source) )
	);
	// identify the nodes from this stratum and remove them
	nodes_data = nodes_data.filter( node => node.stratum != slug );
	d3.select('svg').selectAll('circle').data(nodes_data).exit().remove();
	d3.select('svg').selectAll('line').data(links_data).exit().remove();
}

// Define the forces
var linkForce = d3.forceLink(links_data)
	.id( d => d.id )
	.distance( d => d.type=='geminus' ? 0 : 50 )

// Custom force to keep all nodes in the box
function boundingForce() {
	for (let node of nodes_data) {
		node.x = Math.max(radius,Math.min(width-radius,node.x));
		node.y = Math.max(radius,Math.min(height-radius,node.y));
	}
}

var staticForce = d3.forceManyBody().distanceMax(100).strength(-20)

function init_graph(svg){
	//draw lines for the links 
	var link = svg.append("g")
		.attr('id','edges')
		.selectAll("line").data(links_data).enter().append("line")
		.attr('stroke',d => d.type=='filum' ? 'black' : 'red' )
		.attr('class', d => d.type );

	//draw circles for the nodes, where each is a link to the post
	nodes_repr = svg.append("g").attr('id','nodes')
		.selectAll('circle')
		.data(nodes_data).enter()
		.append('svg:a')
		.attr( 'xlink:href', d => d.url )
		.append('circle')
		.attr('r', radius)
		.attr('fill','gray');

	// called on each simulation tick - updates geometry positions
	simulation.on("tick", tickActions );
	function tickActions() {
		//update circle positions to reflect node updates on each tick of the simulation 
		nodes_repr.attr("cx", d => d.x ).attr("cy", d => d.y );
		//update link positions 
		link
			.attr("x1", d => d.source.x ).attr("y1", d => d.source.y )
			.attr("x2", d => d.target.x ).attr("y2", d => d.target.y );
	}
}

function enable_drag(){
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
	drag_handler(nodes_repr);
}
