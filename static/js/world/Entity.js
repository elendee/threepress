// import BROKER from './WorldBroker.js?v=140'
import {
	hal,
	get_bbox,
	random_entry,
	debug_load,
	TILE_SIZE,
} from '../lib.js?v=140'
import {
	GLTFLoader,
} from '../../inc/GLTFLoader.js?v=140'
import {
	AnimationClip,
	AnimationMixer,
	Group,
	// Vector3,
	// Quaternion,
	// MeshLambertMaterial,
} from '../../inc/three.module.js?v=140'
// import CAMERA from './CAMERA.js?v=140'
// import AnimationStudio from '../helpers/AnimationStudio.js?v=140'



const ANIM_STEP = 50

const MODEL_CACHE = THREEPRESS.MODEL_CACHE = {}

const standard_modeltypes = ['quaternius_low', 'trees']




class Entity {
	
	constructor( init ){
		init = init || {}
		this.ongoing_anims = {}
		this.state = {
			walking: 0,
			running: 0,
			strafing: 0,
		}
		this.isEntity = true
		this.last_states = {}
		this.state_diffed = 0
		this.previously_strafing = false
		this.previously_walking = false
		this.use_cache = init.use_cache
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
		delete this.modeltype
		delete this.slug
		delete this.animation
	}

	async construct_model( is_update ){

		const entity = this

		const slug = entity.slug || entity.some_other_slug || 'unknown'
		const modeltype = entity.modeltype || 'unknown'

		const gltf = new GLTFLoader()

		const filepath = THREEPRESS.ARCADE.URLS.https + '/resource/world-models/' + modeltype + '/' + slug

		const result = await new Promise(( resolve, reject ) => {

			if( this.use_cache && MODEL_CACHE[ filepath ] ){ // cached loads
				/*
					--- do not use_cache for models with animations, they will not load them --- 
				*/

				if( MODEL_CACHE[ filepath ] === 'loading' ){ // interim loads
					/*
						begin wait; model is loading..
					*/
					let count = 0
					let waiting = setInterval(() => {
						if( MODEL_CACHE[ filepath] !== 'loading' ){
							clearInterval( waiting )
							entity.MODEL = MODEL_CACHE[ filepath ].clone()
							entity.add_group( is_update )
							entity.GROUP.add( entity.MODEL )	
							entity.process_model()
							resolve('loaded from wait: ' + filepath )	
						}else{
							debug_load('still waiting', filepath)
						}
						if( count > 20 ){
							clearInterval( waiting )
							reject('unable to load from cache: ' + filepath)
						}
						count++
					}, 300)

				}else{ // cached loads

					entity.MODEL = MODEL_CACHE[ filepath ].clone()
					entity.add_group( is_update )
					entity.GROUP.add( entity.MODEL )
					entity.process_model()
					resolve('loaded from cache: ' + filepath)

				}

				/*
					this does not yet  kick into effect until model is loaded
					- MOST - models are still going to load un-cached, if requested at once ( trees )
					fix...
				*/

			}else{ // no-cache loads AND first-time cache loads

				if( this.use_cache && !MODEL_CACHE[ filepath ]){ // first time cache loads
					MODEL_CACHE[ filepath] = 'loading'
					debug_load('beginning cache load:', filepath)
				}else{
					debug_load('beginning single load: ', filepath )
				}

				// console.log('loading: ', slug, modeltype )

				gltf.load( filepath, 

					obj => {

						// console.log('gltf loaded: ', obj )

						if( standard_modeltypes.includes( modeltype ) ){

							// handle CREATE / UPDATE of model
							this.add_group( is_update )

							entity.MODEL = obj.scene

							if( this.use_cache && MODEL_CACHE[ filepath ] === 'loading' ){
								debug_load('instantiated cache: ', filepath )
								MODEL_CACHE[ filepath ] = entity.MODEL.clone()
							}

							entity.GROUP.add( entity.MODEL )	
							entity.process_model()

							// animations
							if( obj.animations && obj.animations.length && entity.animation_map ){
								const map = entity.animation_map[ entity.modeltype ]
								// console.log('adding anim map: ', filepath )
								entity.add_animation( obj, map )
							}else{
								console.log('unhandled animations for upload', entity )
							}

							// done
							resolve('loaded: ' + filepath )

						}else{

							debug_load('unhandled model type..', modeltype, obj)

							resolve('failed to load: ' + filepath )

						}

					},
					xhr => {
						if( xhr && xhr.type !== 'progress' ) console.log( `bad xhr: ${ modeltype } ${ slug }: ${ xhr.type }` )
					}, 
					error => {
						console.log('FAILED LOAD', error )
						// const report = entity.handle || entity.name || entity.type
						// hal('error', 'failed to load model: ' + report, 2000 )
						// console.log( `failed load path: ${ modeltype } ${ slug }` )
						reject( error )
					}
				) // gltf load

			}

		})

		debug_load( result )

		// post processing:

		entity.bbox = get_bbox( entity.MODEL )

		if( entity.animation ) entity.anim_mixer = entity.animation.mixer // ( for anim loop access )

		// post_process( entity )

	}

	add_group( is_update ){
		if( is_update ){
			this.GROUP.remove( this.MODEL )
			delete this.animation
		}else{
			this.GROUP = new Group()
		}
	}


	process_model(){

		console.log('class is missing its process_model method: ' + this )

		// // shadows
		// this.MODEL.traverse(ele => {

		// 	switch( this.type ){

		// 		// case 'tree':
		// 		// 	ele.castShadow = true
		// 		// 	if( ele.material ) ele.material = random_entry( tree_mats[ this.species ] )
		// 		// 	break;

		// 		case 'toon':
		// 			// or, ele.isMesh
		// 			if( ele.name.match(/cube/i)){
		// 				ele.castShadow = true
		// 				ele.receiveShadow = true
		// 			}
		// 			break;

		// 		default: 

		// 			break;
		// 	}
		// })

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
			// console.log('looking to init: ', given_name )
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



	set_move_state( type, state, e ){
		/*
			this is called solely by keydowns currently
			but here for abstraction

		*/

		// console.log( type, state )
		if( type === 'strafing'){
			if( state ){
				this.MODEL.rotation.y = -Math.PI / 6 * state
			}else{
				this.MODEL.rotation.y = 0
			}
		}

		if( e ) e.preventDefault()

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
		const fade_time = this.animation_map[ this.modeltype ][ type ].fade
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
		if( typeof fadeN !== 'number' ){
			console.log('invalid fade', fadeN, name )
			return			
		}
		if( !this.animation || !name ){
			console.log('invalid anim: ', name )
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
		// const fade_time = this.animation_map[ this.modeltype ].idle.fade
		this.animate('idle', true, 500 ) // fade_time || 0
		setTimeout(() => {
			for( const type in this.animation_map[ this.modeltype ] ){
				if( type === 'idle' ) continue
				this.set_move_state( type, 0 )
				// BROKER.publish('MOVE_KEY', {
				// 	type: action,
				// 	state: 0,
				// })
			}			
		}, 800)

	}

	getBlockIndex(){
		const x = Math.floor( ( this.GROUP?.position?.x || 0 ) / TILE_SIZE )
		const z = Math.floor( ( this.GROUP?.position?.z || 0 ) / TILE_SIZE )
		return [x,z]
	}

	// --------------- end top level animation controls ---------------

}

export default Entity





