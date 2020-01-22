class Link {
	constructor(sourceEventRef,targetEventRef,type){
		this._source = sourceEventRef;
		this._target = targetEventRef;
		this._type  = type;
	}
	get source(){return this._source;}
	get target(){return this._target;}
	get type(){return this._type;}
	get distance(){ 
		// https://github.com/d3/d3-force#link_distance
		if(this.type=='internal'){
			return Math.abs(this.source.optimalY - this.target.optimalY);
		}else{
			return this.source.radius + this.target.radius;
		}
	}
	get strength(){
		// https://github.com/d3/d3-force#link_strength
		return 0.2;
	}
}
