import { CVtimePoint } from './time.js';

// a link is always a link between two timepoints
// if causal, source = cause, target = effect
// if internal, source = earlier, target = later
// i.e. links point forward in time

const acceptedTypes = new Set(['internal','causal'])

export class Link {
	constructor(sourceRef,targetRef,type){
		// validate inputs
		console.assert( sourceRef instanceof CVtimePoint )
		console.assert( targetRef instanceof CVtimePoint )
		console.assert( acceptedTypes.has(type) )
		if(sourceRef.time > targetRef.time){
			console.warn('link points back in time:',this)
		}
		// store inputs
		this._source = sourceRef
		this._target = targetRef
		this._type  = type
	}
	get source(){ return this._source }
	get target(){ return this._target }
	get type(){ return this._type }
	get strength(){
		// https://github.com/d3/d3-force#link_strength
		switch(this._type){
			case 'causal': return 0.1
			case 'internal': return 0.2
		}
	}
}
