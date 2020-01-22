class CVtimePoint{
	// A point in time, measured with more or less accuracy
	constructor(timeString,parentEvent){
		this.parent = parentEvent;
		console.assert(typeof(timeString)=='string');
		this._time_string = timeString;
		this._unix_time = cvDateParse(timeString);
		//this._certainty = 1 / ( 10 - timeString.length );
		// reserved for simulation
		this.x; this.y; this.vx; this.vy;
	}
	get etime(){ return this._unix_time; }
	get id(){ return this.parent.id+'|'+this._time_string; }
	get tags(){ return this.parent.tags }
	get radius(){ return 8; }
	get url(){ return this.parent.url; }
	get title(){ return this.parent.title; }
	get optimalY(){ return e2y(this.etime); }
}

