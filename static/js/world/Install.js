import BROKER from './WorldBroker.js?v=130'
import {
	get_install_type,
} from '../lib.js?v=130'
import {
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
			console.log('sending', packet )
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
				this.image = new Mesh( planegeo, new MeshLambertMaterial({
					map: texLoader.load( this.url ),
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
				const res = await gltfLoader.load( this.url )
				console.log('unhandled gltf model load', res )
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

}


// BROKER.subscribe('CONTROLS_SET_STATE', controls_set_state )


export default Install