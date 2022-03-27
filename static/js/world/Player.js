
import Entity from './Entity.js?v=121'


class Player extends Entity {
	constructor( init ){
		super( init )
		init = init || {}

		Object.assign( this, init )

		/* 
			- hydrated with model:
			this.animation = {
				mixer: new AnimationMixer( obj.scene ),
				clips: obj.animations,
			}
		*/
	}



}


export default Player