class Link {
	constructor(sourceProjectRef,targetProjectRef,type){
		this._source = sourceProjectRef;
		this._target = targetProjectRef;
		// ('internal','causal')
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
		switch(this._type){
			case 'causal': return 0.01;
			case 'internal': return 0.2;
		}
		return 0.2;
	}
}
