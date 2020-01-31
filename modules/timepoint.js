class CVtimePoint{
	// A point in time, measured with variable precision
	constructor( timeString, parent, position ){
		// link to parent project/event
		console.assert( parent instanceof CVevent );
		this.parent = parent;
		// parse the time once on construction
		console.assert( typeof(timeString) == 'string' );
		this._time_string = timeString;
		this._unix_time = cvDateParse(timeString);
		// TODO improve precision measure
		this._precison = timeString.length;
		// either 'start' or 'end'
		this.position = position;
		// reserved for simulation
		this.x; this.y; this.vx; this.vy;
	}
	get etime(){ 
		return this._unix_time; 
	}
	get id(){ 
		return this.parent.id+'|'+this._time_string; 
	}
	get tags(){ 
		return this.parent.tags 
	}
	get radius(){
		switch( this.position) {
			case 'start': return 8;
			case 'end': return 1;
		}
	}
	get url(){
		return this.parent.url;
	}
	get title(){
		return this.parent.title;
	}
	get optimalY(){ 
		return e2y(this.etime); 
	}
}

