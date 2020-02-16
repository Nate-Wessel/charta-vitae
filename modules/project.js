class CVproject {
	constructor(id,url,title,start,end,strata,tags){
		this.self = this;
		this._id = id; // WP post ID
		this._url = url; // WP post href
		this._title = title; // WP post title
		this._times = []; // times associated with the project
		// four types of temporality
		if(start && end && start != end){ 
			// started and completed project
			this._times = [
				new CVtimePoint( start, this, 'start' ), 
				new CVtimePoint( end, this, 'end' )
			]; 
		}else if(start && ! end){
			// started and ongoing project 
			this._times = [ 
				new CVtimePoint( start, this, 'start'), 
				new CVtimePoint( '', this, 'now' ) 
			];
		}else if( ( end && ! start ) || ( start && end == start ) ){
			// event - no duration
			this._times = [ new CVtimePoint(end,this,'only') ];
		}else{
			// no times provided
			this._times = [];
			console.log('no times on' + url);
		}
		this.strata = strata; // not used currently
		this.tags = tags; // non-hierarchical tags
		// reserved for simulation
		this.x; this.y; this.vx; this.vy;
		// references to projects partially consituting this project
		this._children = [];
		this._parents = [];
		this.color;
	}
	get id(){ return this._id; } // WP post_id
	get url(){ return this._url; }
	get title(){ return this._title; }
	get start(){ 
		if( this._times.length > 0 ){
			return this._times[0]; 
		}else{
			console.log(this);
		}
	}
	get end(){ 
		if( this._times.length > 0 ){
			return this._times[this._times.length-1]; 
		}
	}
	get duration(){ 
		// approximate duration in seconds, defaulting to 0
		if ( this.start && this.end  && this.start.etime <= this.end.etime ) {
			return this.end.etime - this.start.etime
		}else{ 
			return 0;
		}
	}
	get radius(){ return this._radius; }
	get nodes(){
		let n = this._times.concat( this._children.map(child=>child.start) );
		n.sort( (a,b)=>a.etime-b.etime );
		return n;
	}
	get links(){ 
		// build internal links between the nodes of this project
		let l = [];
		for( let i=1; i < this.nodes.length; i++ ){
			let source = this.nodes[i-1];
			let target = this.nodes[i];
			l.push( new Link( source, target, 'internal' ) ); 
		}
		return l; 
	}
	addChild(child){
		// append a reference to a given component
		console.assert(child instanceof CVproject);
		if( ! this._children.includes(child) ){ this._children.push(child); }
		// bond the child to the parent as well
		child.addParent(this);
		// sort by start date
		this._children.sort( (a,b)=>a.start.etime-b.start.etime );
	}
	addParent(parent){
		console.assert(parent instanceof CVproject);
		if( ! this._parents.includes(parent) ){ this._parents.push(parent); }
	}
	getNodeNear(etime){ // TODO finish
		let nodes = this.nodes;
		return nodes[0];
	}

}
