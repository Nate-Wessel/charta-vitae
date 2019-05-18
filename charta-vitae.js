window.onload = function () {

	// get post data from HTML into an array
	var nodes_data = d3.selectAll('#page li').nodes().map( function(e){
		return {
			'id':e.dataset.nodeId,
			'stratum':e.dataset.stratum,
			'filum':e.dataset.filum,
			'url':d3.select(e).select('a').attr('href')
		}
	})
	console.log( nodes_data );

	// get links data from HTML into array
	// first the fila
	var filaments = d3.selectAll('#page li[data-ante-node]').nodes().map( 
		function(e){ return {
			'source':e.dataset.anteNode,
			'target':e.dataset.nodeId,
			'type':'filum'
		} }
	)
	console.log( filaments )
	// then link the gemini
	var gemini_links = d3.selectAll('#page li[data-gemini]').nodes().map(
		function(elem){ 
			return elem.dataset.gemini.split(' ').map(
				function(targetNodeId){
					return {
						'source':elem.dataset.nodeId,
						'target':targetNodeId,
						'type':'geminus'
					}
				}
			)
		}
	)
	// flatten the arrays
	gemini_links = [].concat.apply([], gemini_links)
	console.log( gemini_links );

	// join the main and connecting links
	links_data = filaments.concat(gemini_links);

	link_stroke = function(data){
		return data.type=='filum' ? 'black' : 'red';
	}

	const width =  600
	const height = 400
	const radius = 8

	// create SVG element before the first subtitle
	var svg = d3.select('#page').insert('svg','h3')
		.attr('width', width)
		.attr('height',height);

	// Define the forces
	var linkForce = d3.forceLink(links_data)
		.id(function(d){return d.id})
		.distance(function(d){return d.type=='geminus' ? 10 : 50 })

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
