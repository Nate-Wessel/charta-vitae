class CVtimePoint{
	// A point in time, measured with more or less accuracy
	constructor(timeString){
		this._time_string = timeString;
		this._unix_time = cvDateParse(timeString);
		// reserved for simulation
		this.x; this.y; this.vx; this.vy;
		//this._certainty = 1/(10- timeString.length);
	}
	get etime(){ return this._unix_time; }
}

