import { chartaData } from './modules/data.js'
import * as config from './modules/config.js'
import { hlt_colors } from './modules/pallet.js'
import { line, curveNatural } from 'd3-shape'
import { json } from 'd3-fetch'
import { 
	forceSimulation, 
	forceManyBody,
	forceY,
	forceCollide,
	forceLink
} from 'd3-force'
import { select, event } from 'd3-selection'
import { drag } from 'd3-drag'
import { transition } from 'd3-transition'
import { scaleLinear } from 'd3-scale'
import { timeFormat } from 'd3-time-format'
import { axisLeft } from 'd3-axis'
import { timeMonth, timeYear } from 'd3-time'

const margin = { left: 45, right: 0, top: 0, bottom: 0 }

const Y = scaleLinear()
	.range( [ config.height, 0 ] )
// the X scale is meaningless, but the "clamp" keeps nodes from wandering off 
const X = scaleLinear()
	.range(  [ margin.left, config.width ] )
	.domain( [ margin.left, config.width ] )
	.clamp(true)

// SVG elements
var svg, node_group, line_group, link_group, meta_group
var CVD // global data variable
var simulation

const lineGen = line().x(d=>d.x).y(d=>d.y).curve(curveNatural)

window.onload = async function(){
	// set up the basics of the SVG
	setupCharta()
	// gather and parse the data
	await json('/wp-json/charta-vitae/projects/all/')
		.then( jsonData => {
			// parse the data into the CVD object
			CVD = new chartaData(jsonData)
			// add tag selector buttons
			setupTagsMeta(jsonData.tags)
		} )
	console.log(CVD)
	configureScales()
	// define non-data-based simulation forces
	simulation = forceSimulation()
		.nodes(CVD.nodes)
		.velocityDecay(0.3) // lower is faster
		.force('charge_force',staticForce)
		//.force('bounding_force',boundingForce)
		.force('date_position',yForce)
		.force('collision',collisionForce)
		.force( 'link_force',
			forceLink(CVD.links)
				.strength( l => l.strength )
				.distance( l => Math.abs( Y(l.source.time) - Y(l.target.time) ) )
		)
		.on("tick",tickUpdates)
	node_group
		.selectAll('.node')
		.data(CVD.nodes,n=>n.id)
		.join('svg:a').attr('xlink:href',n=>n.url)
		.attr('class', d=>d.tags.map(slug=>'tag-'+slug).join(' ') )
		.classed('node',true)
		.call( a => {
			a.append('title').text(n=>n.title)
			a.append('circle')
				.on('mouseover',highlightNode)
				.attr('fill','gray')
				.attr('r',n=>n.radius)
		} )
	line_group
		.selectAll('.line')
		.data(CVD.events,e=>e.id)
		.join('svg:a').attr('xlink:href',e=>e.url)
		.call( a => {
			a.append('svg:path')
				.attr('class',e=>'line event-id-'+e.id)
				.attr( 'd',e => lineGen( e.nodes ) )
				.style('stroke',e=>e.color)
		} )
	link_group
		.selectAll('polyline.link')
		.data(CVD.links)
		.join('svg:polyline')
		.attr('class',l=>`link ${l.type}`)
	// enable dragging for nodes
	node_group.selectAll('circle').call(
		drag()
			.on('start', n => {
				[n.fx,n.fy] = [n.x,n.y]
				simulation.alphaTarget(0.3).restart()
			})
			.on('drag', n => { [ n.fx, n.fy ] = [ event.x, event.y ] })
			.on('end', n => {
				[n.fx,n.fy] = [null,null]
				simulation.alphaTarget(0)
			})
		)
}

function configureScales(){
	// configure the Y (time) scale and add the Y axis
	Y.domain( [ 
		timeMonth.offset(CVD.firstTime,-3), 
		timeMonth.offset(CVD.lastTime, +3) 
	] )
	let allYears = timeYear.every(1).range(CVD.firstTime, CVD.lastTime)
	const yAxis = axisLeft(Y)
		.tickValues( allYears )
		.tickFormat( timeFormat('%Y') )
	meta_group
		.attr('transform',`translate(${margin.left},0)`)
		.call( yAxis )
	// set up data-dependent elements
	CVD.initializePositions(X,Y)
}

var staticForce = forceManyBody().distanceMax(200).strength(-10)
var yForce = forceY().y( n => Y(n.time) ).strength(0.2)
var collisionForce = forceCollide().radius(e=>e.radius)

function setupCharta(){
	// create SVG element before the first subtitle
	svg = select('#charta-vitae')
		.insert('svg')
		.attr('width',config.width)
		.attr('height',config.height)
	// define an arrow marker
	svg.append('svg:defs').insert('svg:marker').attr('id','markerArrow')
		.attr('markerWidth','4').attr('markerHeight','4')
		.attr('refX','2').attr('refY','2').attr('orient','auto')
		.append('svg:path').attr('d','M0,0 L0,4 L4,2 L0,0')
		.attr('style','fill:tomato;stroke:none;')
	meta_group = svg.append("g").attr('id','meta')
	link_group = svg.append("g").attr('id','links')
	line_group = svg.append("g").attr('id','lines')
	node_group = svg.append("g").attr('id','nodes')
}

function setupTagsMeta(tagsData){
	// set up extra-charta metadata
	let cv = select('#charta-vitae')
	// add section for links to tag selectors 
	let metaDiv = cv.append('div').attr('id','metabox')
	metaDiv.append('h4').text('Project Tags')
   metaDiv.append('p').text('Click a tag to highlight projects on the map')
	let tagContainer = metaDiv.append('div').attr('class','container')
	let tags = tagContainer.selectAll('div.tag').data(tagsData)
	tags.enter().append('div').attr('class','tag').on('click',tagClick)
		.attr('title',t=>t.description).attr('data-tagslug',t=>t.slug)
		.append('span').attr('class','name').text(t=>t.name)
}

function tagClick(event){ // highlight the nodes with the selected tag
	// select the elements
	let tag = select(this)
	let taggedNodes = node_group
		.selectAll( 'a.node.tag-'+tag.datum().slug )
		.select('circle')
	// which color to highlight with?
	let color = hlt_colors.pop()
	// change styles
	tag.style('background',color)
	taggedNodes.transition().duration(500).style('fill',color)
	// let a second click undo the changes
	select(this).on('click',(e)=>{
		taggedNodes.transition().duration(500).style('fill','grey')
		tag.on('click',tagClick)
		tag.style('background',null)
		// put that color back in line
		hlt_colors.push(color)
	})
}

function highlightNode(datum,index,nodes){
	select(nodes[index])
		.on('mouseleave',unHighlightNode)
		.transition().style('fill','red')
}
function unHighlightNode(datum,index,nodes){
	select(nodes[index]).transition().duration(750).style('fill',null)
}

// called on each simulation tick - updates geometry positions
function tickUpdates(){
	node_group
		.selectAll('circle')
		.attr("cx", n => { return n.x = X(n.x) } )
		.attr("cy", n => n.y) 
	line_group.selectAll('path')
		.attr('d',event=>lineGen(event.nodes))
	link_group.selectAll('polyline')
		.attr('points',function(l){
			let x1 = l.source.x, y1 = l.source.y
			let x2 = l.target.x, y2 = l.target.y
			return `${x1},${y1} ${(x1+x2)/2},${(y1+y2)/2} ${x2},${y2}`
		})
}
