class CVtimePoint{
	// A point in time, measured with more or less accuracy
	constructor(timeString){
		console.assert(typeof(timeString)=='string');
		this._time_string = timeString;
		this._unix_time = cvDateParse(timeString);
		//this._certainty = 1 / ( 10 - timeString.length );
		// reserved for simulation
		this.x; this.y; this.vx; this.vy;
	}
	get etime(){ return this._unix_time; }
}

