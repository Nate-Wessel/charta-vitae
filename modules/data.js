// container class for all necessary data
class chartaData {
	constructor(json_data){
		// lets keep all structure from JSON to this function
		this._projects = [];
		this._logicalLinks = [];
		this._structuralLinks = [];
		// convert projects to project objects
		for( let p of json_data['projects'] ){
			this._projects.push( new CVproject( 
				p.id, p.url, p.title,
				p.start, p.end, p.strata, p.tags // start & end may be undefined
			) );
		}
		// convert logical links to link objects
		for( let l of json_data['links'] ){
			if( l.type == 'constitutive' ){
				let child  = this.projectByID(l.source);
				let parent = this.projectByID(l.target);
				parent.addChild(child);
			}else{ // causal links
				this._logicalLinks.push( new Link(
					this.projectByID(l.source),
					this.projectByID(l.target),
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
		let internal = [];
		for(let project of this._projects){
			internal = internal.concat( project.links );
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
