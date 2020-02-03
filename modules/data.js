// container class for all necessary data
class chartaData {
	constructor(json_data){
		// lets keep all structure from JSON to this function
		this._events = [];
		this._logicalLinks = [];
		this._structuralLinks = [];
		// convert events to event objects
		for( let e of json_data['events'] ){
			this._events.push( new CVevent( 
				e.id, e.url, e.title,
				e.start, e.end, e.strata, e.tags // start & end may be undefined
			) );
		}
		// convert logical links to link objects
		for( let l of json_data['links'] ){
			if( l.type == 'constitutive' ){
				let child  = this.eventByID(l.source);
				let parent = this.eventByID(l.target);
				parent.addChild(child);
			}else{ // causal links
				this._logicalLinks.push( new Link(
					this.eventByID(l.source),
					this.eventByID(l.target),
					l.type
				) );
			}
		}
		// assign colors to the largest projects, sorted descending by node length
		this._events.sort((a,b)=>b.nodes.length - a.nodes.length);
		for(let i=0; i<Math.min(path_colors.length,this.events.length); i++ ){
			this.events[i].color = path_colors[i];
		}
	}
	initializePositions(){
		// set the initial x,y positions
		for(let tp of this.nodes){
			tp.y = tp.optimalY;
			tp.x = 0;
		}
	}
	// accessors 
	get events(){ return this._events; }
	get links(){ 
		let internal = [];
		for(let event of this._events){
			internal = internal.concat( event.links );
		}
		let causal = [];
		for(let l of this._logicalLinks){
			if(l.type=='causal'){
				causal.push( new Link(
					l.source.start,
					l.target.start,
					l.type
				) );
			}
		}
		return internal.concat(causal);
	}
	eventByID(event_id){
		for(let event of this._events){
			if( event_id == event.id ){ return event; }
		}
		return event_id;
	}
	get nodes(){
		let nodes = [];
		for( let e of this._events ){
			nodes.push( e.start );
			if( e.duration > 0 ){
				nodes.push( e.end );
			}
		}
		return nodes;
	}
}
