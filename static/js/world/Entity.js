
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
			strafing: 0,
			// turning: 0,
			// moved: {
			// 	x: false,
			// 	y: false,
			// 	z: false,
			// },
		}
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


	deconstruct_model(){
		this.GROUP.remove( this.GROUP.MODEL )
		delete this.GROUP.MODEL // may need to make a `destruct_model` method here
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

						// shadows
						entity.MODEL.traverse(ele => {
							// or, ele.isMesh
							if( ele.name.match(/cube/i)){
								ele.castShadow = true
							}
						})
						entity.GROUP.add( entity.MODEL )	

						// animations
						if( obj.animations && obj.animations.length ){
							entity.add_animation( obj, entity.standard_actions, entity.animation_map[ modeltype ] )
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



	add_animation( model, desired_animations, animation_map ){

		if( !model || !desired_animations || !animation_map ){
			console.log( 'invalid AnimationStudio', desired_animations, animation_map, model )
			return
		}

		this.animation = {
			mixer: new AnimationMixer( model.scene ),
			clips: model.animations,
			actions: {},
			fades: {},
		}
	
		let local_name
		for( const type of desired_animations ){
			// if( !this.standard_actions[ type ]) continue
			local_name = animation_map[ type ]
			const clip = AnimationClip.findByName( this.animation.clips, local_name )
			if( !clip ){
				console.log('animation map failed to find: ', type )
				continue
			}
			this.animation.actions[ type ] = this.animation.mixer.clipAction( clip )
			this.animation.actions[ type ].enabled = true
		}


	}


	clearFade( name ){
		clearInterval( this.animation.fades[ name ].interval )
		clearTimeout( this.animation.fades[ name ].timeout )
		delete this.animation.fades[ name ]
	}


	animate( name, state, fadeN ){
		if( !this.animation ) return
		if( !name && !state ){
			this.list_anims()
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

		if( state ){
			if( action.isRunning() ){
				console.log('action still running; skip: ' + name )
				return
			}

			if( fades ){
				action.weight = 0
				action.enabled = true
				// step = ANIM_STEP / fadeN
				step = fadeN / ANIM_STEP

				if( fades[ name ] ) this.clearFade( name )
				fades[ name ] = {}
				fades[ name ].interval = setInterval(() => {
					action.weight += step
				}, ANIM_STEP )
				fades[ name ].timeout = setTimeout(() => {
					this.clearFade( name )
					console.log('end fade in ', name )
				}, fadeN )
			}else{
				console.log('insta anim: ', name, state )
			}

			action.play() // maybe else() this ????????

		}else{

			if( fades ){
				// action.weight = 0
				// action.enabled = true
				step = fadeN / ANIM_STEP
				
				if( fades[ name ] ) this.clearFade( name )
				fades[ name ] = {}
				fades[ name ].interval = setInterval(() => {
					action.weight -= step
				}, ANIM_STEP )
				fades[ name ].timeout = setTimeout(() => {
					this.clearFade( name )
					console.log('end fade out ', name )
				}, fadeN )
			}else{
				action.stop()
				console.log('insta anim: ', name, state )
			}

		}
	
	}


	rest(){
		/*
			called whenever no anims are detected
		*/
		if( !this.animation ) return

		this.animation.mixer.stopAllAction()
		this.animation.actions.idle?.play?.()

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





	update( delta_seconds ){

		// animations
		if( this.anim_mixer ){
			this.anim_mixer.update( delta_seconds )
			// console.log('anim')
		}

		// movement
		// walking
		if( this.state.walking > 0 ){
			this.GROUP.translateZ( this.speed * delta_seconds )
		}else if( this.state.walking < 0 ){
			this.GROUP.translateZ( -this.speed * delta_seconds )
		}
		// strafing
		if( this.state.strafing > 0 ){
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




}

export default Entity