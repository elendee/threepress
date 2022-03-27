
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

	async construct_model(){

		const entity = this

		const slug = entity.world_slug || entity.some_other_slug || 'unknown'
		const modeltype = entity.world_modeltype || 'unknown'
		const filetype = entity.world_filetype || 'unknown'

		const gltf = new GLTFLoader()

		await new Promise(( resolve, reject ) => {

			const filepath = 'https://arcade.threepress.shop/resource/world-models/' + modeltype + '/' + slug + '.' + filetype

			gltf.load( filepath, 

				obj => {

					console.log('entity load: ', obj )

					let add_anim
					if( obj.animations && obj.animations.length ) add_anim = true

					if( modeltype === 'quaternius_low'){

						if( add_anim ){
							entity.animation = {
								mixer: new AnimationMixer( obj.scene ),
								clips: obj.animations,
							}
						}

						entity.MODEL = obj.scene
						entity.GROUP = new Group()
						entity.GROUP.add( entity.MODEL )

						resolve()

					}else{ // currently same, but for example ...

						if( add_anim ){
							entity.animation = {
								mixer: new AnimationMixer( obj.scene ),
								clips: obj.animations,
							}							
						}

						entity.MODEL = obj.scene
						entity.GROUP = new Group()
						entity.GROUP.add( entity.MODEL )

						resolve( obj.scene )

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


	list_anims(){
		if( !this.animation ){
			console.log('none')
			return
		}
		for( const clip of this.animation.clips ){
			console.log( clip.name )
		}
	}

	animate( name, state ){
		// validate
		if( !this.animation ) return
		if( !name && !state ){
			this.list_anims()
			return
		}
		const clip = AnimationClip.findByName( this.animation.clips, name )
		if( !clip ){
			console.log('missing anim clip', this, this.anim_clip )
			return
		}
		// start
		if( state ){ 
			const action = this.animation.mixer.clipAction( clip )
			this.ongoing_anims[ name ] = action
			action.enabled = true
			action.play()
		// stop
		}else{ 
			for( const type in this.ongoing_anims ){
				if( type === name ){
					this.ongoing_anims[ type ].fadeOut(1)
					setTimeout(()=>{
						if( this.ongoing_anims[ type ] ){
							this.ongoing_anims[ type ].stop()
						}else{
							// already deleted.. should be ok
						}
						delete this.ongoing_anims[ type ]
						if( !Object.keys( this.ongoing_anims ).length ){
							this.rest()
						}
					}, 1000)
					return
				}
			}
		}
	}


	rest(){
		/*
			called whenever no anims are detected
		*/
		if( !this.animation ) return
		// handle my cache
		for( const type in this.ongoing_anims ){
			this.ongoing_anims[ type ].fadeOut(1)
		}
		// use built in method
		setTimeout(() => {
			this.animation.mixer.stopAllAction()
			this.animate('Idle', true)
		}, 1000)
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