window.onload = function () {
	// define vars
	var nodes_data = [
		{'id':'A','cat':1},
		{'id':'B','cat':1},
		{'id':'C','cat':2},
		{'id':'D','cat':2},
		{'id':'E','cat':2},
		{'id':'F','cat':2},
		{'id':'G','cat':2}
	]
	var links_data = [
		{'source':'A','target':'B','cat':1},
		{'source':'B','target':'C','cat':1},
		{'source':'D','target':'E','cat':2},
		{'source':'E','target':'F','cat':2},
		{'source':'F','target':'G','cat':2}
	]

	const width = 500
	const height = 300

	// create SVG element before the first subtitle
	var svg = d3.select('#page').insert('svg','h3')
		.attr('width', width)
		.attr('height',height);

	var sim = d3.forceSimulation()
		.nodes(nodes_data)
		.force('charge_force', d3.forceManyBody())
		.force('center_force',d3.forceCenter(width/2, height/2))
		.force('link_force',d3.forceLink(links_data).id(function(d){return d.id}));

	//draw lines for the links 
	var link = svg.append("g")
		.attr("class", "link")
		.selectAll("line")
		.data(links_data)
		.enter().append("line")
		.attr("stroke-width", 2)
		.attr('stroke',function(d){ return d.cat==1 ? 'red' : 'blue' });

	//draw circles for the nodes 
	var node = svg.append("g")
		.attr("class", "node")
		.selectAll('circle')
		.data(nodes_data)
		.enter()
		.append('circle')
		.attr('r', 10)
		.attr('fill',function(d){ return d.cat==1 ? 'red' : 'blue' });

	function tickActions() {
		//update circle positions to reflect node updates on each tick of the simulation 
		node
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
	drag_handler(node);


	// TODO:
	// work on getting data from href links into an array
	var posts = d3.select('#page').selectAll('a');
	ps = posts;
	console.log( ps, posts );



}
