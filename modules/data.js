import { CVproject } from './project.js';
import { Link } from './link.js';
import { path_colors } from './pallet.js';
import { width } from './config.js';

// container class for all necessary data
export class chartaData {
	constructor(json_data){
		// lets keep all structure from JSON to this function
		this._projects = json_data.projects
			.map( p => new CVproject( 
				this, p.id, p.url, p.title, p.start, p.end, p.strata, p.tags 
			) )
		this._causalLinks = json_data.links
			.filter( l => l.type == 'causal' )
			.map( l => {
				// need to convert from links between project IDs to links 
				// between timepoints of projects
				let targetNode = this._projects.find(p => p.id==l.target).start;
				let sourceProj = this._projects.find(p => p.id==l.source);
				let sourceNode = sourceProj.getNodeNear(targetNode);
				return new Link( sourceNode, targetNode, l.type );
			} )
		// convert logical links to link objects or references
		json_data.links
			.filter( l => l.type == 'constitutive' )
			.map( l => {
				let child  = this._projects.find(p => p.id==l.source);
				let parent = this._projects.find(p => p.id==l.target);
				parent.addChild(child);
			} )
		// assign colors to the largest projects, sorted descending by node length
		this._projects.sort((a,b)=>b.nodes.length - a.nodes.length);
		for(let i=0; i<Math.min(path_colors.length,this.events.length); i++ ){
			this.events[i].color = path_colors[i];
		}
		// find the min and max times from all projects
		this._firstTime = new Date( Math.min( ... 
			this._projects.map( p => p.start.time ) 
		) )
		this._lastTime = new Date( Math.max( ... 
			this._projects.map( p => p.end.time ) 
		) )
	}
	initializePositions(Xscale,Yscale){
		// set the initial x,y positions
		this.nodes.map( tp => { 
			tp.y = Yscale(tp.time);
			tp.x = Xscale(width/2);
		} )
	}
	// accessors 
	get events(){ return this._projects; }
	get links(){ 
		// returns a list of ALL links, internal, causal, etc
		let internal = [];
		for(let project of this._projects){
			internal = internal.concat( project.links );
		}
		return this._causalLinks.concat(internal);
	}
	get nodes(){
		let nodes = [];
		for( let project of this._projects ){ 
			nodes = nodes.concat( project.nodes );
		}
		return [ ... new Set(nodes)];
	}
	get firstTime(){ return this._firstTime }
	get lastTime(){ return this._lastTime }
}
