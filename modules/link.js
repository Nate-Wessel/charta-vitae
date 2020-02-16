// a link is always a link between two timepoints
// if causal, source = cause, target = effect
// if internal, source = earlier, target = later
// i.e. links point forward in time

class Link {
	constructor(sourceRef,targetRef,type){
		console.assert(sourceRef instanceof CVtimePoint);
		this._source = sourceRef;
		console.assert(targetRef instanceof CVtimePoint);
		this._target = targetRef;
		console.assert( ['internal','causal'].includes(type) );
		this._type  = type;
		if(this._source.etime > this._target.etime){
			console.log('link points back in time:',this);
		}
	}
	get source(){return this._source;}
	get target(){return this._target;}
	get type(){
		// one of ('causal','internal')
		return this._type;
	}
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
