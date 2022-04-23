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




const framegeo = new BoxBufferGeometry(1,1,1)
const framemat = new MeshLambertMaterial({
	color: 'wheat',
})
const planegeo = new PlaneGeometry(1,1,1)

const texLoader = new TextureLoader()
const gltfLoader = new GLTFLoader()

const transformer = new TransformControls( CAMERA, RENDERER.domElement )


// any change whatsoever in state:
// transformer.addEventListener('change', e => {
// 	console.log('transformer change', e )
// })
// actual object change:

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
				quat: target_obj.quaternion,
				pos: target_obj.position,
			}
			console.log('sending', packet )
			BROKER.publish('SOCKET_SEND', packet )
			clearTimeout( updating[ target_obj.uuid ])
			delete updating[ target_obj.uuid ]
		}, 1000)
	}

	// console.log('scale: ', target_obj.scale )
	// console.log('scale: ', target_obj.position )
	// console.log('scale: ', target_obj.quaternion )

	// console.log('transformer objectChange')
	// console.log('should be controls', e.target )
	// console.log('should be target',  )
})

SCENE.add( transformer )



class Install {

	constructor( init ){
		init = init || {}
		if( typeof init.url !== 'string' ){
			console.log("installation is missing url")
			return
		}
		Object.assign( this, init )

		console.log('install init', init )

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
			// or lerp this eventually
			this.GROUP.quaternion.set( 
				this.REF.quaternion._x, 
				this.REF.quaternion._y, 
				this.REF.quaternion._z, 
				this.REF.quaternion._w 
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





export default Install