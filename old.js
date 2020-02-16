/*
// Custom force to keep all nodes in the box
function boundingForce(alpha) {
	CVD.events.forEach( function(e){
		let halfWidth  = width/2 - e.radius;
		let halfHeight = height/2 - e.radius;
		if( Math.abs(e.x) > halfWidth ){ 
			e.x = Math.max(-(halfWidth),Math.min(halfWidth,e.x)); }
		if( Math.abs(e.y) > halfHeight ){ 
			e.y = Math.max(-(halfHeight),Math.min(halfHeight,e.y)); }
	} );
}

class Stratum {
	constructor(slug,name,displayDefault){
		this._name = name;			// Full name
		this._slug = slug;			// short name and unique id
		this._rendered = displayDefault == 'true';	// boolean
		this._ownNodes = [];			// direct child nodes/events, in chron order
		this._parent;					// link to parent stratum if any
		this._subStrata = [];		// children strata
		this._color;					// rendered line color
		// links to adjacent nodes in the parent category: pre2,pre1,post1,post2
		this._adjacentNodes = [undefined,undefined,undefined,undefined];
	}
	// rendering settings
	get rendered(){ return this._rendered; }
	render(){ 
		this._rendered = true; 
		this._subStrata.map(ss=>ss.linkAdjacentNodes());
	}
	unrender(){ 
		this._rendered = false; 
		this._subStrata.map(ss=>ss.linkAdjacentNodes());
	}
	linkAdjacentNodes(){
		// add adjacent nodes from rendered parent strata
		// fresh start
		this._adjacentNodes = [undefined,undefined,undefined,undefined];
		if ( ! ( 
			this.hasRenderedParent && 
			this._parent.nodes.length > 1 && this._ownNodes.length > 1 
		) ){ return; }
		// parent 1-2-3-4---6---8-9
		// self           5---7 
		// links to [3,4,8,9]
		let pNodes = this._parent.nodes;
		let start = this._ownNodes[0].etime;
		let end = this._ownNodes[this._ownNodes.length-1].etime;
		// see if start or end are between parent nodes
		for( let i=1; i<pNodes.length; i++ ){
			if( start > pNodes[i-1].etime && start < pNodes[i].etime ){
				this._adjacentNodes[1] = pNodes[i-1];
				if(i>1){this._adjacentNodes[0] = pNodes[i-2]; }
			}
			if( end > pNodes[i-1].etime && end < pNodes[i].etime ){
				this._adjacentNodes[2] = pNodes[i];
				if( i < pNodes.length - 2 ){ this._adjacentNodes[3] = pNodes[i+1]; }
			}
		}
		// now see if they are before/after the first/last
		if( start > pNodes[pNodes.length-1].etime ){
			this._adjacentNodes[0] = pNodes[pNodes.length-2];
			this._adjacentNodes[1] = pNodes[pNodes.length-1];
		}else if( end < pNodes[0].etime ){
			this._adjacentNodes[2] = pNodes[0];
			this._adjacentNodes[3] = pNodes[1];
		}
	}
	get nodes(){ return this._ownNodes; }
	get pathNodes(){
		// nodes used to render the smooth line (ownNodes +1 either way)
		let n1 = this._adjacentNodes[1], n2 = this._adjacentNodes[2];
		n1 = n1 instanceof CVevent ? [n1] : [];
		n2 = n2 instanceof CVevent ? [n2] : [];
		return n1.concat(this._ownNodes,n2);
	}
	get spanningLinkNodes(){
		// ownNodes plus all adjacent for sanning straightening links
		let n0 = this._adjacentNodes[0], n3 = this._adjacentNodes[3];
		n0 = n0 instanceof CVevent ? [n0] : [];
		n3 = n3 instanceof CVevent ? [n3] : [];
		return n0.concat(this.pathNodes,n3);
	}
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
	setParent(parentStratum){ this._parent = parentStratum; }
	get hasParent(){ return typeof(this._parent) === typeof(this); }
	get hasRenderedParent(){ return this.hasParent && this._parent.rendered; }
	addChild(childStratum){ this._subStrata.push(childStratum); }
	addNode(event){ event.addStratum(this); this._ownNodes.push(event); }
	get links(){
		let links = [];
		// direct node->node links
		for( let i=1; i<this.pathNodes.length; i++ ){
			links.push( new Link( this.pathNodes[i-1], this.pathNodes[i] ) );
		}
		// longer straightening links, skipping nodes
		for( let i=2; i<this.spanningLinkNodes.length; i++ ){
			links.push( new Link( 
				this.spanningLinkNodes[i-2], 
				this.spanningLinkNodes[i], 
				this.spanningLinkNodes[i-1] 
			) );
		}
		return links;
	}
	setColor(color){ this._color = color; }
	get color(){ return this._color; }
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
	// add a colored box (legend symbol)
	toggles.append('span').attr('class','symbol')
		.style('background-color',s=>s.color);
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
*/
