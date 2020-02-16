// configure graph
const width =  700;
const height = 800;
const minX = -width/2
const maxX = width/2;

//
var simulation;
// SVG elements
var node_group, line_group, link_group, meta_group;
var svg, SVGtransG;

// global data variables
var CVD;
// line generator
var lineGen = d3.line().x(d=>d.x).y(d=>d.y).curve(d3.curveNatural);

// bounding event times
var startTime, endTime;
var minY, maxY;

function e2y(time){
	// convert an epoch time to a Y pixel position
	console.assert( startTime & endTime ); 
	return -(time-startTime)/(endTime-startTime)*height+height/2;
}

// selected highlight colors
var hlt_colors = ['green','red','blue','purple','orange','yellow'];

// selected path colors
var path_colors = ['teal','orange','crimson','deeppink','gold','indigo'];

// this is the thing that kicks it all off
window.onload = function(){
	// parse and extend the JSON data from Wordpress
	CVD = new chartaData(cv_data);
	startTime = Math.min( ...CVD.events.map(e=>e.start.etime) );
	endTime = Math.max( ...CVD.events.map(e=>e.end.etime) );
	maxY = e2y(startTime);
	minY = e2y(endTime);
	CVD.initializePositions();
	// set up the map etc
	setupCharta();
	setupMeta();
	//setColors();
	//enableChanges();
	// define non-data-based simulation forces
	simulation = d3.forceSimulation()
		.nodes(CVD.nodes)
		.velocityDecay(0.3) // lower is faster
		.force('charge_force',staticForce)
		//.force('bounding_force',boundingForce)
		.force('date_position',yForce)
		.force('collision',collisionForce)
		.on("tick",ticked);
	// update the graph
	restart();
}

var staticForce = d3.forceManyBody().distanceMax(200).strength(-10);
var yForce = d3.forceY().y( n => n.optimalY ).strength(0.2);
var collisionForce = d3.forceCollide().radius(e=>e.radius);

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
	meta_group = SVGtransG.append("g").attr('id','meta');
	link_group = SVGtransG.append("g").attr('id','links');
	line_group = SVGtransG.append("g").attr('id','lines');
	node_group = SVGtransG.append("g").attr('id','nodes');
}

function setupMeta(){
	// set up intra-charta metadata
	// TODO this is still a bit of a hack
	let startyear = 1989;
	let endyear = 2030;
	let year = startyear;
	let leftMargin = -width/2;
	while(year < endyear){
		let y = e2y( cvDateParse(`${year}`) );
		meta_group.append('svg:text')
			.attr('x',leftMargin)
			.attr('y',y+5)
			.attr('class','year')
			.text("'"+(year+'').substring(2,4)+" -");
		year+=1;
	}
	// set up extra-charta metadata
	let cv = d3.select('#charta-vitae');
	// add section for links to tag selectors 
	let metaDiv = cv.append('div').attr('id','metabox');
	metaDiv.append('h3').text('Event Tags');
	let tagContainer = metaDiv.append('div').attr('class','container');
	let tags = tagContainer.selectAll('div.tag').data(cv_data.tags);
	tags.enter().append('div').attr('class','tag').on('click',tagClick)
		.attr('title',t=>t.description).attr('data-tagslug',t=>t.slug)
		.append('span').attr('class','name').text(t=>t.name);
}

function tagClick(event){ // highlight the nodes with the selected tag
	// select the elements
	let tag = d3.select(this);
	let taggedNodes = node_group
		.selectAll( 'a.node.tag-'+tag.datum().slug )
		.select('circle');
	// which color to highlight with?
	let color = hlt_colors.pop();
	// change styles
	tag.style('background',color);
	taggedNodes.transition().duration(500).style('fill',color);
	// let a second click undo the changes
	d3.select(this).on('click',(e)=>{
		taggedNodes.transition().duration(500).style('fill','grey');
		tag.on('click',tagClick);
		tag.style('background',null);
		// put that color back in line
		hlt_colors.push(color);
	})
}

function restart(alpha=1) {
	nodeUpdatePattern();
	lineUpdatePattern();
	linkUpdatePattern();
	// Update the simulation with data-based forces and restart
	simulation.nodes(CVD.nodes).force(
		'link_force',
		d3.forceLink(CVD.links).strength(l=>l.strength).distance(l=>l.distance)
	);
	simulation.alpha(alpha).restart();
	enable_drags();
}

function nodeUpdatePattern(){
	nodes = node_group.selectAll('.node').data(CVD.nodes,n=>n.id)
		.call(parent=>parent.select('circle').transition().attr('r',n=>n.radius));
	nodes_a = nodes.enter().append('svg:a').attr('xlink:href',n=>n.url)
		.attr('class', d=>d.tags.map(slug=>'tag-'+slug).join(' ') )
		.classed('node',true);
	nodes_a.append('title').text(n=>n.title);
	nodes_a.append('circle').attr('fill','gray').attr('r',n=>n.radius);
	nodes.exit().remove();
}

function lineUpdatePattern(){
	lines = line_group.selectAll('.line').data(CVD.events,e=>e.id);
	let lines_a = lines.enter().append('svg:a').attr('xlink:href',e=>e.url);
	lines_a
		.append('svg:path')
		.attr('class',e=>'line event-id-'+e.id)
		.attr( 'd',e => lineGen( e.nodes ) )
		.style('stroke',e=>e.color);
	lines.exit().remove();
}

function linkUpdatePattern(){ 
	links = link_group.selectAll('path.link').data(CVD.links);
	links.enter().append('svg:path').attr('class',l=>'link '+l.type);
	links.exit().remove();
}

// called on each simulation tick - updates geometry positions
function ticked(){
	node_group.selectAll('circle')
		.attr("cx", function(n){
			return n.x = Math.max(minX,Math.min(maxX,n.x));
		} )
		.attr("cy", function(n){
			 return n.y = Math.max(minY,Math.min(maxY,n.y));
		} ); 
	line_group.selectAll('path')
		.attr('d',event=>lineGen(event.nodes));
	link_group.selectAll('path')
		.attr('d',l=>lineGen([l.source,l.target]));
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
