class CVevent {
	constructor(id,url,title,start,end,strata,tags){
		this._id = id; // WP post ID
		this._url = url; // WP post href
		this._title = title; 
		this._times = [ 
			new CVtimePoint(start), 
			new CVtimePoint(end) 
		];
		this.strata = strata; 
		this.tags = tags;
		// reserved for simulation
		this.x; this.y; this.vx; this.vy;
		// set once, but checked many times
		this._radius = 8;
	}
	get id(){ return this._id; } // WP post_id
	get url(){ return this._url; }
	get title(){ return this._title; }
	get start(){ return this._times[0].etime; }
	get end(){ return this._times[1].etime; }
	get duration(){ 
		// estimated duration of event in seconds, defaulting to 0
		if ( this.start && this.end  && this.start <= this.end ) {
			return this.end - this.start
		}else{ 
			return 0;
		}
	}
	get radius(){ return this._radius; }
	get nodes(){
		return this._times;
	}
}