
import Entity from './Entity.js?v=130'


class Player extends Entity {
	constructor( init ){
		super( init )
		init = init || {}

		Object.assign( this, init )

		this.animation_map = { 
			/*
				game actions -> the embedded animation names for that modeltype
			*/
			quaternius_low: {
				'walking': {
					localized: 'Walk',
					fade: 500,
				},
				'running': {
					localized: 'Run',
					fade: 500,
				},
				'strafing': {
					localized: 'Run',
					fade: 500,
				},
				'turning': {
					localized: 'Walk',
					fade: 500,
				},
				'idle': {
					localized: 'Idle',
					fade: 500,
				},
			},

		}

		/* 
			- hydrated with model:
			this.animation = {
				mixer: new AnimationMixer( obj.scene ),
				clips: obj.animations,
			}
		*/
	}


	process_model(){
		
		this.MODEL.traverse(ele => {
			if( ele.name.match(/cube/i)){
				ele.castShadow = true
				ele.receiveShadow = true
			}		
		})

		this.MODEL.userData.clickable = true
		this.MODEL.userData.uuid = this.uuid

	}


}


export default Player