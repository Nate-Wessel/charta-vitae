// container class for all necessary data
class chartaData {
	constructor(json_data){
		// lets keep all structure from JSON to this function
		this._projects = [];
		this._causalLinks = [];
		// convert projects to project objects
		for( let p of json_data['projects'] ){
			this._projects.push( new CVproject( 
				p.id, p.url, p.title,
				p.start, p.end, p.strata, p.tags // start & end may be undefined
			) );
		}
		// convert logical links to link objects or references
		for( let l of json_data['links'] ){
			if( l.type == 'constitutive' ){
				let child  = this.projectByID(l.source);
				let parent = this.projectByID(l.target);
				parent.addChild(child);
			}else if( l.type == 'causal' ){
				// need to convert from links between project IDs to links 
				// between timepoints
				let targetNode = this.projectByID(l.target).start;
				let sourceProj = this.projectByID(l.source);
				let sourceNode = sourceProj.getNodeNear(targetNode.etime);
				this._causalLinks.push( new Link(
					sourceNode,
					targetNode,
					l.type
				) );
			}
		}
		// assign colors to the largest projects, sorted descending by node length
		this._projects.sort((a,b)=>b.nodes.length - a.nodes.length);
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
		for( let e of this._projects ){
			nodes.push( e.start );
			if( e.duration > 0 ){
				nodes.push( e.end );
			}
		}
		return nodes;
	}
}
