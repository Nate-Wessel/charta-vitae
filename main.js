import { chartaData } from './modules/data.js';
import * as config from './modules/config.js';
import { cvDateParse } from './modules/time.js'
import { hlt_colors } from './modules/pallet.js';

import { line, curveNatural } from 'd3-shape'
import { json } from 'd3-fetch';
import { 
	forceSimulation, 
	forceManyBody,
	forceY,
	forceCollide,
	forceLink
} from 'd3-force';
import { select, event } from 'd3-selection';
import { drag } from 'd3-drag';
import { transition } from 'd3-transition';


const minX = -config.width/2;
const maxX = config.width/2;

//
var simulation;
// SVG elements
var node_group, line_group, link_group, meta_group;
var svg, SVGtransG;
// global data variables
var CVD;
// line generator: https://github.com/d3/d3-shape#curves
var lineGen = line().x(d=>d.x).y(d=>d.y).curve(curveNatural);
//
const endpoint = '/wp-json/charta-vitae/projects/all/';

window.onload = function(){
	// async request for data
	json(endpoint).then( data => handle_data(data) );
	// set up the SVG
	setupCharta();
}

function handle_data(jsonData){
	// parse the data
	CVD = new chartaData(jsonData);
	// set up data-dependent elements
	CVD.initializePositions();

	setupMeta(jsonData.tags);
	//setColors();
	//enableChanges();
	// define non-data-based simulation forces
	simulation = forceSimulation()
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

var staticForce = forceManyBody().distanceMax(200).strength(-10);
var yForce = forceY().y( n => n.optimalY ).strength(0.2);
var collisionForce = forceCollide().radius(e=>e.radius);

function setupCharta(){
	// create SVG element before the first subtitle
	let cv = select('#charta-vitae');
	svg = cv.insert('svg')
		.attr('width',config.width)
		.attr('height',config.height);
	// define an arrow marker
	svg.append('svg:defs').insert('svg:marker').attr('id','markerArrow')
		.attr('markerWidth','4').attr('markerHeight','4')
		.attr('refX','2').attr('refY','2').attr('orient','auto')
		.append('svg:path').attr('d','M0,0 L0,4 L4,2 L0,0')
		.attr('style','fill:tomato;stroke:none;');
	// append a transform group containing everything
	SVGtransG = svg.append('g')
		.attr(
			'transform',
			'translate('+String(config.width/2)+','+String(config.height/2)+')'
		);
	meta_group = SVGtransG.append("g").attr('id','meta');
	link_group = SVGtransG.append("g").attr('id','links');
	line_group = SVGtransG.append("g").attr('id','lines');
	node_group = SVGtransG.append("g").attr('id','nodes');
}

function setupMeta(tagsData){
	// set up intra-charta metadata
	// TODO this is still a bit of a hack
	let startyear = 1989;
	let endyear = 2030;
	let year = startyear;
	let leftMargin = -config.width/2;
	while(year < endyear){
		let y = CVD.e2y( cvDateParse(`${year}`) );
		meta_group.append('svg:text')
			.attr('x',leftMargin)
			.attr('y',y+5)
			.attr('class','year')
			.text("'"+(year+'').substring(2,4)+" -");
		year+=1;
	}
	// set up extra-charta metadata
	let cv = select('#charta-vitae');
	// add section for links to tag selectors 
	let metaDiv = cv.append('div').attr('id','metabox');
	metaDiv.append('h4').text('Project Tags');
   metaDiv.append('p').text('Click a tag to highlight projects on the map')
	let tagContainer = metaDiv.append('div').attr('class','container');
	let tags = tagContainer.selectAll('div.tag').data(tagsData);
	tags.enter().append('div').attr('class','tag').on('click',tagClick)
		.attr('title',t=>t.description).attr('data-tagslug',t=>t.slug)
		.append('span').attr('class','name').text(t=>t.name);
}

function tagClick(event){ // highlight the nodes with the selected tag
	// select the elements
	let tag = select(this);
	let taggedNodes = node_group
		.selectAll( 'a.node.tag-'+tag.datum().slug )
		.select('circle');
	// which color to highlight with?
	let color = hlt_colors.pop();
	// change styles
	tag.style('background',color);
	taggedNodes.transition().duration(500).style('fill',color);
	// let a second click undo the changes
	select(this).on('click',(e)=>{
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
		forceLink(CVD.links).strength(l=>l.strength).distance(l=>l.distance)
	);
	simulation.alpha(alpha).restart();
	enable_drags();
}

function nodeUpdatePattern(){
	let nodes = node_group.selectAll('.node').data(CVD.nodes,n=>n.id)
		.call(parent=>parent.select('circle').transition().attr('r',n=>n.radius));
	let nodes_a = nodes.enter().append('svg:a').attr('xlink:href',n=>n.url)
		.attr('class', d=>d.tags.map(slug=>'tag-'+slug).join(' ') )
		.classed('node',true);
	nodes_a.append('title').text(n=>n.title);
	nodes_a.append('circle').attr('fill','gray').attr('r',n=>n.radius);
	nodes.exit().remove();
}

function lineUpdatePattern(){
	let lines = line_group.selectAll('.line').data(CVD.events,e=>e.id);
	let lines_a = lines.enter().append('svg:a').attr('xlink:href',e=>e.url);
	lines_a
		.append('svg:path')
		.attr('class',e=>'line event-id-'+e.id)
		.attr( 'd',e => lineGen( e.nodes ) )
		.style('stroke',e=>e.color);
	lines.exit().remove();
}

function linkUpdatePattern(){ 
	let links = link_group.selectAll('polyline.link').data(CVD.links);
	links.enter().append('svg:polyline').attr('class',l=>'link '+l.type);
	links.exit().remove();
}

// called on each simulation tick - updates geometry positions
function ticked(){
	node_group.selectAll('circle')
		.attr("cx", function(n){
			return n.x = Math.max(minX,Math.min(maxX,n.x));
		} )
		.attr("cy", function(n){
			 return n.y = Math.max(CVD.minY,Math.min(CVD.maxY,n.y));
		} ); 
	line_group.selectAll('path')
		.attr('d',event=>lineGen(event.nodes));
	link_group.selectAll('polyline')
		.attr('points',function(l){
			let x1 = l.source.x, y1 = l.source.y;
			let x2 = l.target.x, y2 = l.target.y;
			return x1+','+y1+' '+(x1+x2)/2+','+(y1+y2)/2+' '+x2+','+y2;
		});
}

function enable_drags(){
	//create drag handler     
	var drag_handler = drag()
		.on('start', d => {
			// set the fixed position of the node to be where it was when clicked
			if (! event.active) simulation.alphaTarget(0.3).restart();
			[d.fx,d.fy] = [d.x,d.y];
		})
		.on('drag', d => { [ d.fx, d.fy ] = [ event.x, event.y ]; })
		.on('end', d => {
			if (!event.active) simulation.alphaTarget(0);
			[d.fx,d.fy] = [null,null];
		})
	//apply the drag_handler to the circles 
	let all_nodes = node_group.selectAll('circle');
	drag_handler(all_nodes);
}
