class CVevent {
	constructor(id,url,title,start,end,strata,tags){
		this.self - this;
		this._id = id; // WP post ID
		this._url = url; // WP post href
		this._title = title; // WP post title
		this._times = []; // start and end times associated with the event
		if(start){ this._times.push( new CVtimePoint(start,this) ); } 
		if(end){ this._times.push( new CVtimePoint(end,this) ); } 
		this._internalLinks = [];
		if(start && end){
			this._internalLinks.push( new Link( this.start,this.end,'internal' ) );
		}
		this.strata = strata; // not used currently
		this.tags = tags; // non-hierarchical tags
		// reserved for simulation
		this.x; this.y; this.vx; this.vy;
		this._radius = 8;
		// references to events partially consituting this event
		this._children = [];
		this._parents = [];
	}
	get id(){ return this._id; } // WP post_id
	get url(){ return this._url; }
	get title(){ return this._title; }
	get start(){ 
		if( this._times.length > 0 ){
			return this._times[0]; 
		}
	}
	get end(){ 
		if( this._times.length > 0 ){
			return this._times[this._times.length-1]; 
		}
	}
	get duration(){ 
		// estimated duration of event in seconds, defaulting to 0
		if ( this.start && this.end  && this.start.etime <= this.end.etime ) {
			return this.end.etime - this.start.etime
		}else{ 
			return 0;
		}
	}
	get radius(){ return this._radius; }
	get nodes(){
		return this._times;
	}
	get links(){ return this._internalLinks; }
	addChild(child){
		// append a reference to a given child event
		console.assert(child instanceof CVevent);
		if( ! this._children.includes(child) ){ this._children.push(child); }
		// bond the child to the parent as well
		child.addParent(this);
	}
	addParent(parent){
		console.assert(parent instanceof CVevent);
		if( ! this._parents.includes(parent) ){ this._parents.push(parent); }
	}
}
