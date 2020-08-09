import { CVproject } from './project.js';
import { Link } from './link.js';
import { path_colors } from './pallet.js';
import * as config from './config.js';

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
				let targetNode = this.projectByID(l.target).start;
				let sourceProj = this.projectByID(l.source);
				let sourceNode = sourceProj.getNodeNear(targetNode);
				return new Link( sourceNode, targetNode, l.type );
			} )
		// convert logical links to link objects or references
		json_data.links
			.filter( l => l.type == 'constitutive' )
			.map( l => {
				let child  = this.projectByID(l.source);
				let parent = this.projectByID(l.target);
				parent.addChild(child);
			} )
		// assign colors to the largest projects, sorted descending by node length
		this._projects.sort((a,b)=>b.nodes.length - a.nodes.length);
		for(let i=0; i<Math.min(path_colors.length,this.events.length); i++ ){
			this.events[i].color = path_colors[i];
		}
		this._startTime = null;
		this._endTime = null;
	}
	initializePositions(){
		// set the initial x,y positions
		this.nodes.map( tp => { 
			tp.y = tp.optimalY;
			tp.x = 0;
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
	projectByID(project_id){
		for(let project of this._projects){
			if( project_id == project.id ){ return project; }
		}
		return project_id;
	}
	get nodes(){
		let nodes = [];
		for( let project of this._projects ){ 
			nodes = nodes.concat( project.nodes );
		}
		return [ ... new Set(nodes)];
	}
	get startTime(){
		if( ! this._startTime ){
			this._startTime = Math.min( ...this.events.map(e=>e.start.etime) );
			this._startTime -= 3*30*24*3600; // 3 months
		}
		return this._startTime;
	}
	get endTime(){
		if( ! this._endTime ){
			this._endTime = Math.max( ...this.events.map(e=>e.end.etime) );
			this._endTime += 3*30*24*3600; // 3 months
		}
		return this._endTime;
	}

	e2y(time){
		// convert an epoch time to a Y pixel position
		return -(time-this.startTime)/(this.endTime-this.startTime)*config.height+config.height/2;
	}
	get maxY(){ 
		return this.e2y(this.startTime); 
	}
	get minY(){ 
		return this.e2y(this.endTime); 
	}

}
