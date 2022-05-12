import {
	AnimationClip,
} from '../../inc/three.module.js?v=140'


class AnimationStudio {

	constructor( entity, desired_animations, animation_map, loaded_file ){

		if( !desired_animations || !animation_map || !loaded_file ){
			console.log( 'invalid AnimationStudio', entity, desired_animations, animation_map, loaded_file )
			return
		}

		this.mixer = new AnimationMixer( loaded_file.scene ),
		this.animations = loaded_file.animations
	
		let local_name
		for( const type of desired_animations ){
			// if( !entity.standard_actions[ type ]) continue
			local_name = animation_map[ type ]
			const clip = AnimationClip.findByName( entity.animation.clips, local_name )
			if( !clip ){
				console.log('animation map failed to find: ', type )
				continue
			}
			entity.actions[ type ] = entity.animation.mixer.clipAction( clip )
			entity.actions[ type ].enabled = true
		}


		entity.animate = ( name, state ) => {
			// validate
			if( !entity.animation ) return
			if( !name && !state ){
				entity.list_anims()
				return
			}
			const clip = AnimationClip.findByName( entity.animation.clips, name )
			if( !clip ){
				console.log('missing anim clip', this, entity.anim_clip )
				return
			}

			if( entity.actions[ name ] ){
				if( state ){
					entity.actions[ name ].fadeIn(1)
					// entity.actions[ name ].enabled = true
					// entity.actions[ name ].play()
				}else{
					entity.actions[ name ].fadeOut(1)
					// entity.actions[ name ].enabled = false
					// entity.actions[ name ].stop()
				}
			}
		
		}


		entity.rest = () => {
			/*
				called whenever no anims are detected
			*/
			if( !entity.animation ) return

			entity.animation.mixer.stopAllAction()
			entity.actions.idle?.play?.()

			// handle my cache
			// for( const type in entity.ongoing_anims ){
			// 	entity.ongoing_anims[ type ].fadeOut(1)
			// }
			// // use built in method
			// setTimeout(() => {
			// 	entity.animation.mixer.stopAllAction()
			// 	entity.animate('idle', true)
			// }, 1000)
		}


		entity.list_anims = () => {
			if( !entity.animation ){
				console.log('none')
				return
			}
			for( const clip of entity.animation.clips ){
				console.log( clip.name )
			}
		}

	}

}


export default AnimationStudio