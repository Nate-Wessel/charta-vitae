// configure graph
const width =  600
const height = 400
const radius = 8

// 
var nodes_data = [];
var links_data = [];

window.onload = function(){
	// create SVG element before the first subtitle
	var svg = d3.select('#page').insert('svg','ul.strata')
		.attr('width', width)
		.attr('height',height);
	// add check boxes to stratum titles
	enable_data_changes();
	// pull all the data
	get_data();
	// 
	create_graph(svg);
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
				add_stratum(stratumSlug);
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
				links_data.push( {
					'source':elem.dataset.nodeId, 'target':targetId, 'type':'geminus'
				} );
			}
		}
	}
}
/*
function remove_stratum(slug){
	// removes both nodes and links associated with this stratum
	nodes_data = nodes_data.filter( node => node.stratum != slug );
	// update the chart
	var circles = d3.select('svg').selectAll('circle')
		.data(nodes_data).exit().remove();
}

function add_stratum(slug){
	// adds both nodes and links associated with this stratum
	nodes = d3.selectAll('#page li.eventus[data-stratum='+slug+']').nodes();
	for ( let elem of nodes ) {
		nodes_data.push({
			'id':elem.dataset.nodeId, 'stratum':slug,
			'filum':elem.dataset.filum, 
			'url':d3.select(elem).select('a').attr('href')
		})
	}
	var circles = d3.select('svg').selectAll('circle')
		.data(nodes_data).enter().append('svg:a')
		.attr('xlink:href',function(d){return d.url;})
		.append('circle').attr('r',radius).attr('fill','gray');

	if (!d3.event.active) sim.alphaTarget(0.3).restart()
}
*/
function create_graph(svg){
	link_stroke = function(data){
		return data.type=='filum' ? 'black' : 'red';
	}

	// Define the forces
	var linkForce = d3.forceLink(links_data)
		.id(function(d){return d.id})
		.distance(function(d){return d.type=='geminus' ? 0 : 50 })

		// Custom force to keep all nodes in the box
	function boundingForce() {
		for (let node of nodes_data) {
			node.x = Math.max(radius,Math.min(width-radius,node.x));
			node.y = Math.max(radius,Math.min(height-radius,node.y));
		}
	}
	
	var staticForce = d3.forceManyBody()
		.distanceMax(100)
		.strength(-20)

	// attach the forces
	var sim = d3.forceSimulation().nodes(nodes_data)
		.force('charge_force',staticForce)
		.force('center_force',d3.forceCenter(width/2, height/2))
		.force('link_force',linkForce)
		.force('bounding_force',boundingForce);

	//draw lines for the links 
	var link = svg.append("g")
		.attr('id','edges')
		.selectAll("line").data(links_data).enter().append("line")
		.attr('stroke',function(d){return link_stroke(d)})
		.attr('class',function(d){return d.type});

	//draw circles for the nodes, where each is a link to the post
	var nodes = svg.append("g").attr('id','nodes')
		.selectAll('circle')
		.data(nodes_data).enter()
		.append('svg:a').attr('xlink:href',function(d){return d.url;})
		.append('circle').attr('r', radius).attr('fill','gray');


	function tickActions() {
		//update circle positions to reflect node updates on each tick of the simulation 
		nodes
			.attr("cx", function(d) { return d.x; })
			.attr("cy", function(d) { return d.y; })
		//update link positions 
		//simply tells one end of the line to follow one node around
		//and the other end of the line to follow the other node around
		link
			.attr("x1", function(d) { return d.source.x; })
			.attr("y1", function(d) { return d.source.y; })
			.attr("x2", function(d) { return d.target.x; })
			.attr("y2", function(d) { return d.target.y; });
	}
	// assign this to listen to events
	sim.on("tick", tickActions );

	//create drag handler     
	var drag_handler = d3.drag()
		.on('start', function(d){
			// We set the fixed position of the dragged node to be wherever it was when we clicked
			if (!d3.event.active) sim.alphaTarget(0.3).restart();
			d.fx = d.x;
			d.fy = d.y;
		})
		.on('drag',function(d){
			d.fx = d3.event.x;
			d.fy = d3.event.y;
		})
		.on('end',function(d){
			if (!d3.event.active) sim.alphaTarget(0);
			d.fx = null;
			d.fy = null;
		})
	//apply the drag_handler to our circles 
	drag_handler(nodes);
}
