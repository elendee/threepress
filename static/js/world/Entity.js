import BROKER from './WorldBroker.js?v=121'
import {
	hal,
	get_bbox,
} from '../lib.js?v=121'
import {
	GLTFLoader,
} from '../../inc/GLTFLoader.js?v=121'
import {
	AnimationClip,
	AnimationMixer,
	Group,
	Vector3,
	Quaternion,
} from '../../inc/three.module.js?v=121'
import CAMERA from './CAMERA.js?v=121'
// import AnimationStudio from '../helpers/AnimationStudio.js?v=121'



const ANIM_STEP = 50


class Entity {
	
	constructor( init ){
		init = init || {}
		this.ongoing_anims = {}
		this.state = {
			walking: 0,
			running: 0,
			strafing: 0,
		}
		this.last_states = {}
		this.state_diffed = 0
		this.previously_strafing = false
		this.previously_walking = false
		// might need later for server corrections.. maybe not though:
		// this.lerpto = {
		// 	position: {
		// 		count: 0,
		// 		vec: new Vector3(),
		// 	},
		// 	quaternion: {
		// 		count: 0,
		// 		quat: new Quaternion(),
		// 	},
		// 	rotation: {
		// 		count: 0,
		// 		rad: 0,
		// 	}
		// }
	}


	hydrate( data ){
		for( const key in data ){
			// console.log('hydrating player: ', key )
			this[ key]= data[ key ]
		}
	}





	update( delta_seconds ){

		// animations
		if( this.anim_mixer ){
			this.anim_mixer.update( delta_seconds )
			// console.log('anim')
		}

		// movement
		// running
		if( this.state.running > 0 ){
			this.GROUP.translateZ( this.speed * delta_seconds )
		}else if( this.state.running < 0 ){
			this.GROUP.translateZ( -this.speed * delta_seconds )
		} 
		// walking
		else if( this.state.walking > 0 ){
			this.GROUP.translateZ( this.speed * delta_seconds * .5 )
		}else if( this.state.walking < 0 ){
			this.GROUP.translateZ( -this.speed * delta_seconds * .5 )
		}
		// strafing
		else if( this.state.strafing > 0 ){
			this.GROUP.translateX( -this.speed * delta_seconds )
		}else if( this.state.strafing < 0 ){
			this.GROUP.translateX( this.speed * delta_seconds )
		}
		
		// turning
		if( this.state.turning > 0 ){
			this.GROUP.rotateY( 1.5 * delta_seconds )
			// rotation.y -= 1.5 * delta_seconds
		}else if( this.state.turning < 0 ){
			this.GROUP.rotateY( -1.5 * delta_seconds )
			// this.GROUP.rotation.y += 1.5 * delta_seconds
		}

	}

	deconstruct_model(){
		this.GROUP.remove( this.GROUP.MODEL )
		delete this.GROUP.MODEL // may need to make a `destruct_model` method here
		delete this.world_modeltype
		delete this.world_slug
		delete this.animation
	}

	async construct_model( is_update ){

		const entity = this

		const slug = entity.world_slug || entity.some_other_slug || 'unknown'
		const modeltype = entity.world_modeltype || 'unknown'

		const gltf = new GLTFLoader()

		await new Promise(( resolve, reject ) => {

			console.log('loading: ', slug, modeltype )

			const filepath = THREEPRESS.ARCADE.URLS.https + '/resource/world-models/' + modeltype + '/' + slug

			console.log('loading: ', filepath )

			gltf.load( filepath, 

				obj => {

					console.log('entity load: ', obj )

					if( modeltype === 'quaternius_low'){

						// handle CREATE / UPDATE of model
						if( is_update ){
							entity.GROUP.remove( entity.MODEL )
							delete entity.animation
						}else{
							entity.GROUP = new Group()
						}

						entity.MODEL = obj.scene
						entity.GROUP.add( entity.MODEL )	

						// shadows
						entity.MODEL.traverse(ele => {
							// or, ele.isMesh
							if( ele.name.match(/cube/i)){
								ele.castShadow = true
							}
						})

						// animations
						if( obj.animations && obj.animations.length ){
							const map = entity.animation_map[ modeltype ]
							console.log('adding anim map: ', map )
							entity.add_animation( obj, map )
						}

						// done
						resolve()

					}else{

						// ( probably the same as ^^ )

						console.log('unhandled model type..', modeltype, obj)

						resolve()

					}

				},
				xhr => {
					if( xhr && xhr.type !== 'progress' ) console.log( `bad xhr: ${ modeltype } ${ slug }: ${ xhr.type }` )
				}, 
				error => {
					hal('error', 'error loading model: ', entity.handle || entity.name )
					console.log( `err ${ modeltype } ${ slug }`, error )
					reject('model err: ', slug )
				}
			)
		})

		// post processing:

		entity.bbox = get_bbox( entity.MODEL )
		CAMERA.fixture.position.y = entity.bbox.max.y

		if( entity.animation ) entity.anim_mixer = entity.animation.mixer // ( for anim loop access )

		// post_process( entity )

	}



	add_animation( model, animation_map ){

		if( !model || !animation_map ){
			console.log( 'invalid animation init' )
			console.log( 'animation_map', animation_map )
			console.log( 'model', model )
			return
		}

		this.animation = {
			mixer: new AnimationMixer( model.scene ),
			clips: model.animations,
			actions: {},
			fades: {},
		}
	
		let given_name, clip
		for( const type of Object.keys( animation_map ) ){
			given_name = animation_map[ type ]?.localized
			clip = AnimationClip.findByName( this.animation.clips, given_name )
			if( !clip ){
				if( type === 'running' ){ // ( a weird edge case - no 'Run' available )
					clip = AnimationClip.findByName( this.animation.clips, 'Run_Carry' )
				}
				if( !clip ){
					console.log('animation map failed to find: ', type )
					continue					
				}

			}
			this.animation.actions[ type ] = this.animation.mixer.clipAction( clip )
		}


	}


	send_state_immediate( type, state ){
		/* 
			check for movement "ends" (keyUPS, when previously keyDOWN ) 
			send END packet immediately to stop rubber banding
		*/
		if( type === 'walking' ){
			if( state ){
				this.previously_walking = true
				return false
			}
			if( this.previously_walking ){ // ( not walking now and was before )
				this.previously_walking = false
				return true
			}
		}else if( type === 'strafing' ){
			if( state ){
				this.previously_strafing = true
				return false
			}
			if( this.previously_strafing ){ // ( not walking now and was before )
				this.previously_strafing = false
				return true
			}
		}

		// ( can skip turning check )

		return false

	}



	set_move_state( type, state ){
		/*
			this is called solely by keydowns currently
			but here for abstraction

		*/

		this.state_diffed = this.last_states[ type ] !== state

		// set state
		this.state[ type ] = this.last_states[ type ] = state

		// check for keyUPS (end immediate)
		if( this.send_state_immediate( type, state )){
			this.send_update()
		// normal moves:
		}else{
			if( this.state_diffed ) this.need_stream = true
		}

		// set animate
		const fade_time = this.animation_map[ this.world_modeltype ][ type ].fade
		// console.log( type, fade_time )
		if( this.state_diffed ) this.animate( type, state !== 0 , fade_time || 0 )

	}




	list_anims(){
		if( !this.animation ){
			console.log('no animation')
			return
		}
		for( const clip of this.animation.clips ){
			console.log( clip.name )
		}
	}






	// --------------- top level animation controls ---------------

	clearFade( name ){
		clearInterval( this.animation.fades[ name ] )
		// clearTimeout( this.animation.fades[ name ].timeout ) // deprecated
		delete this.animation.fades[ name ]
	}


	animate( name, state, fadeN ){
		if( !this.animation || !name || typeof fadeN !== 'number' ){
			console.log('invalid fade', name )
			return
		}
		const action = this.animation.actions[ name ]
		if( !action ){
			console.log('action not found: ', name )
			return
		}

		// console.log( name, state, fadeN )

		let fades, step
		if( typeof fadeN === 'number' ){
			fades = this.animation.fades
		}

		if( state ){ // animate 'on'
			// if( action.isRunning() ){
			// 	console.log('action still running; skip: ' + name + ', weight: ' + action.weight )
			// 	return
			// }

			action.weight = 0
			action.enabled = true
			step = ANIM_STEP / fadeN

			if( fades[ name ] ) this.clearFade( name )
			fades[ name ] = setInterval(() => {
				action.weight = Math.min( 1, action.weight + step )
				if( action.weight >= 1 ) this.clearFade( name )
			}, ANIM_STEP )

			// maybe else() this 
			action.play() 

		}else{ // animate 'off'

			step = ANIM_STEP / fadeN
			if( fades[ name ] ) this.clearFade( name )
			fades[ name ] = setInterval(() => {
				action.weight = Math.max( 0, action.weight - step )
				if( action.weight <= 0 ){
					this.clearFade( name )
					action.stop()
				}
			}, ANIM_STEP )

		}

	}


	rest(){
		/*
			called whenever no anims are detected
		*/
		if( !this.animation ) return

		// this.animation.mixer.stopAllAction()
		// const fade_time = this.animation_map[ this.world_modeltype ].idle.fade
		this.animate('idle', true, 500 ) // fade_time || 0
		setTimeout(() => {
			for( const type in this.animation_map[ this.world_modeltype ] ){
				if( type === 'idle' ) continue
				this.set_move_state( type, 0 )
				// BROKER.publish('MOVE_KEY', {
				// 	type: action,
				// 	state: 0,
				// })
			}			
		}, 800)

	}

	// --------------- end top level animation controls ---------------

}

export default Entity