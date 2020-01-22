class CVevent {
	// currently just replicates the node data object
	constructor(id,url,title,start,end,strata,tags){
		this._id = id; // WP post ID
		this._url = url; // WP post href
		this._title = title; 
		this._start = cvDateParse(start);
		this._end = cvDateParse(end);
		this.strata = strata; 
		this.tags = tags;
		// reserved for simulation
		this.x; this.y; this.vx; this.vy;
		// set once, but checked many times
		this._radius;
	}
	get id(){ return this._id; } // WP post_id
	get url(){ return this._url; }
	get title(){ return this._title; }
	get start(){ return this._start; }
	get end(){ return this._end; }
	get midTime(){ return this._start + this.duration / 2; }
	get duration(){ 
		// estimated duration of event in seconds, defaulting to 0
		if ( this._start && this._end  && this._start <= this._end ) {
			return this._end - this._start
		}else{ 
			return 0;
		}
	}
	get radius(){ // only calculate value once
		if(this._radius){
			return this._radius
		}
		this._radius = secs2pixels(this.duration);
		return this._radius; 
	}
	get timeCertainty(){ 
		// bigger date ranges mean fuzzier positions
		return 1/this.radius;
	}
}
