import BROKER from './WorldBroker.js?v=130'
import {
	get_install_type,
	hal,
	debug_load,
	get_bbox,
} from '../lib.js?v=130'
import {
	Texture,
	BoxBufferGeometry,
	Group,
	MeshLambertMaterial,
	Mesh,
	PlaneGeometry,
	TextureLoader,
} from '../../inc/three.module.js?v=130'
import { GLTFLoader } from '../../inc/GLTFLoader.js?v=130'
import { TransformControls } from '../../inc/TransformControls.js?v=130'
import CAMERA from './CAMERA.js?v=130'
import RENDERER from './RENDERER.js?v=130'
import SCENE from './SCENE.js?v=130'


const texLoader = new TextureLoader()
const gltfLoader = new GLTFLoader()






// TRANSFORMER
const transformer = THREEPRESS.transformer = new TransformControls( CAMERA, RENDERER.domElement )
SCENE.add( transformer )

// send changes to server
const updating = {}
transformer.addEventListener('objectChange', e => {
	const target_obj = e.target?.object
	if( !target_obj ){
		console.log('missing obj for update')
		return
	}

	if( !updating[ target_obj.uuid ] ){
		updating[ target_obj.uuid ] = setTimeout(()=>{
			const packet = {
				type: 'update_object',
				uuid: target_obj.userData?.uuid,
				scale: target_obj.scale,
				quaternion: target_obj.quaternion,
				position: target_obj.position,
			}
			// console.log('sending', packet )
			BROKER.publish('SOCKET_SEND', packet )
			clearTimeout( updating[ target_obj.uuid ])
			delete updating[ target_obj.uuid ]
		}, 1000)
	}

})

// controls for different transformer states
const build_control = type => {
	const wrapper = document.createElement('div')
	wrapper.classList.add('object-control')
	const img = document.createElement('img')
	img.src = THREEPRESS.ARCADE.URLS.https + '/resource/image/control-' + type + '.jpg'
	wrapper.appendChild( img )
	wrapper.addEventListener('click', () => {
		// BROKER.publish('CONTROLS_SET_STATE', { type: type } )
		transformer.mode = type
	})
	return wrapper
}

// transformer controls UI
const controls_ui = document.createElement('div')
controls_ui.id = 'controls-ui'
controls_ui.appendChild( build_control('translate') )
controls_ui.appendChild( build_control('scale') )
controls_ui.appendChild( build_control('rotate') )
setTimeout( () => { // just needs to wait for compile to be done
	RENDERER.domElement.parentElement.appendChild( controls_ui )
}, 1000 ) 

// togggle transformer UI as needed
let t_current, t_previous
transformer.addEventListener('change', e => { // update UI on transform changes..
	t_current = !!transformer.object
	if( t_current !== t_previous ){
		if( t_current ){
			controls_ui.style.display = 'inline-block'
		}else{
			controls_ui.style.display = 'none'
		}
	}
	t_previous = t_current
})












// install components
const framegeo = new BoxBufferGeometry(1,1,1)
const framemat = new MeshLambertMaterial({
	color: 'wheat',
})
const planegeo = new PlaneGeometry(1,1,1)


class Install {

	constructor( init ){
		init = init || {}
		if( typeof init.url !== 'string' ){
			console.log("installation is missing url")
			return
		}
		Object.assign( this, init )

		// console.log('install init', init )

		// instantiated
		this.type = get_install_type( init.url )
		this.held_mesh = init.held_mesh
		// if image:
		// this.GROUP:
		// - this.image
		// - this.frame
	}

	async construct_model(){

		let group = new Group()
		if( this.held_mesh ){
			group.userData.held_mesh = true
		}

		switch( this.type ){

			case 'image':

				this.frame = new Mesh( framegeo, framemat )
				this.frame.userData.held_mesh = this.held_mesh
				group.add( this.frame )

				let image = document.createElement('img')
				const tex = new Texture()
				const logurl = this.url.substr( this.url.length - 30 )
				try{

					await new Promise( (resolve, reject) => {
						// load img to test url...
						image.crossOrigin = 'Anonymous'
						image.onload = () => {
							resolve()
						}
						image.onerror = err => {
							console.log( 'error 1', logurl, err )
							image.src = THREEPRESS.ARCADE.URLS.https + '/resource/image/no-load.jpg'
							resolve()
						}
						image.src = this.url
						setTimeout
					})

				}catch(error){
					console.log( 'error 2', logurl, error )
					image.src = THREEPRESS.ARCADE.URLS.https + '/resource/image/no-load.jpg'
				}
				tex.image = image
				setTimeout(()=>{
					tex.needsUpdate = true
				}, 1000)
				this.image = new Mesh( planegeo, new MeshLambertMaterial({
					map: tex,
				}))
				this.image.userData.held_mesh = this.held_mesh
				group.add( this.image )


				group.scale.x = 5
				group.scale.y = 5
				group.scale.z = 1
				this.image.position.z = .6
				this.GROUP = group
				break;

			case 'model':
				await construct_model( this, false )
				break;

			default:
				console.log('invalid installation construct', this)
				return
		}

		// return gltf
		this.process_model()

		// console.log('constructing', this._REF.scale )

	}

	process_model(){

		if( this.type === 'image' ){

			this.frame.castShadow = true 
			this.frame.receiveShadow = true 

		}else if( this.type === 'model' ){

		// this.GROUP.traverse( child => {
		// 	if( child.isMesh ) child.castShadow = true
		// })			

		}else{
			console.log('unknown process_model', this )
		}

		this.GROUP.userData.clickable = true
		this.GROUP.userData.uuid = this.uuid
		this.GROUP.userData.name = this.name
		this.GROUP.userData.description = this.description

		try{

			this.REF = JSON.parse( this.ref )

			// set QUATERNION and SCALE internally here, but POSITION handle externally
			this.GROUP.quaternion.set( 
				this.REF.quaternion._x, 
				this.REF.quaternion._y, 
				this.REF.quaternion._z, 
				this.REF.quaternion._w 
			)

			this.GROUP.scale.set(
				this.REF.scale.x,
				this.REF.scale.y,
				this.REF.scale.z,
			)

			// console.log('parsed: ', parse )
		}catch( err ){
			console.log('failed to parse Install quaternion', err )
		}

	}

	set_controls( state ){
		if( state ){
			transformer.attach( this.GROUP )
		}else{
			transformer.detach()
		}
	}

	add_group( is_update ){ // mirrors Entity
		if( is_update ){
			this.GROUP.remove( this.MODEL )
			delete this.animation
		}else{
			this.GROUP = new Group()
		}
	}

}






















const construct_model = async( entity, is_update ) => {

	// const modeltype = entity.modeltype || 'unknown'
	// const slug = entity.slug || entity.some_other_slug || 'unknown'

	// console.log('rrg, what i got: ', entity )

	const gltf = new GLTFLoader()

	const filepath = entity.url
	// THREEPRESS.ARCADE.URLS.https + '/resource/world-models/' + modeltype + '/' + slug

	const result = await new Promise(( resolve, reject ) => {

		if( entity.use_cache && MODEL_CACHE[ filepath ] ){ // cached loads
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

			if( entity.use_cache && !MODEL_CACHE[ filepath ]){ // first time cache loads
				MODEL_CACHE[ filepath] = 'loading'
				debug_load('beginning cache load:', filepath)
			}else{
				debug_load('beginning single load: ', filepath )
			}

			// console.log('loading: ', slug, modeltype )

			gltf.load( filepath, 

				obj => {

					// console.log('gltf loaded: ', obj )

					// if( standard_modeltypes.includes( modeltype ) ){

					// handle CREATE / UPDATE of model
					entity.add_group( is_update )

					entity.MODEL = obj.scene

					if( entity.use_cache && MODEL_CACHE[ filepath ] === 'loading' ){
						debug_load('instantiated cache: ', filepath )
						MODEL_CACHE[ filepath ] = entity.MODEL.clone()
					}

					entity.GROUP.add( entity.MODEL )	
					entity.process_model()

					// animations
					if( obj.animations && obj.animations.length ){
						const map = entity.animation_map[ modeltype ]
						// console.log('adding anim map: ', filepath )
						entity.add_animation( obj, map )
					}

					// done
					resolve('loaded: ' + filepath )

					// }else{

					// 	debug_load('unhandled model type..', modeltype, obj)

					// 	resolve('failed to load: ' + filepath )

					// }

				},
				xhr => {
					if( xhr && xhr.type !== 'progress' ) console.log( `bad xhr: ${ modeltype } ${ slug }: ${ xhr.type }` )
				}, 
				error => {
					// const report = entity.handle || entity.name || entity.type
					// hal('error', 'failed to load model: ' + report, 2000 )
					// console.log( `failed load path: ${ modeltype } ${ slug }` )
					reject('failed model load: ' + filepath )
				}
			)
		}

	})

	debug_load( result )

	// post processing:

	entity.bbox = get_bbox( entity.MODEL )

	if( entity.animation ) entity.anim_mixer = entity.animation.mixer // ( for anim loop access )

	// post_process( entity )

}





// BROKER.subscribe('CONTROLS_SET_STATE', controls_set_state )


export default Install