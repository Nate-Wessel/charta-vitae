import { utcParse, timeFormat } from 'd3-time-format';

export class CVtimePoint{
	// A point in time, measured with variable precision
	constructor( timeString, parent, position ){
		this.parent = parent;
		// parse the time once on construction
		console.assert( typeof(timeString) == 'string' );
		this._time_string = timeString;
		this._time = cvDateParse(timeString);
		this._unix_time = Number( timeFormat('%s')(this._time) );
		// TODO improve precision measure
		this._precison = timeString.length;
		// either 'start' or 'end'
		this.position = position;
		// reserved for simulation
		this.x; this.y; 
		this.vx; this.vy;
	}
	get ts(){
		return this._time_string;
	}
	get time(){
		return this._time;
	}
	get etime(){ 
		return this._unix_time; 
	}
	get id(){ 
		return `${this.parent.id}|${this._time_string}`; 
	}
	get tags(){ 
		return this.parent.tags 
	}
	get radius(){
		switch( this.position) {
			case 'start': return 8;
			case 'only': return 5;
			case 'end': return 2;
			case 'now': return 1;
			case 'mid': return 1;
		}
	}
	get url(){
		return this.parent.url;
	}
	get title(){
		return this.parent.title;
	}
}

export function cvDateParse(dateString){
	// parse a date (YYYY-MM-DD HH:MM:SS) with optional precision
	// returning an epoch int
	let date = // assigns first non-null value
		utcParse("%Y-%m-%d %H:%M:%S")(dateString) || 
		utcParse("%Y-%m-%d %H:%M")(dateString) ||
		utcParse("%Y-%m-%d %H")(dateString) ||
		utcParse("%Y-%m-%d")(dateString) ||
		utcParse("%Y-%m")(dateString) ||
		utcParse("%Y")(dateString);
	// default to Now if no parsable date
	return date ? date : new Date
}

