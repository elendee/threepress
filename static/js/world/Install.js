import {
	get_install_type,
} from '../lib.js?v=130'
import {
	BoxBufferGeometry,
	Group,
	MeshLambertMaterial,
	Mesh,
	PlaneGeometry,
	// Raycaster,
	// Vector2,
	TextureLoader,
} from '../../inc/three.module.js?v=130'
import { GLTFLoader } from '../../inc/GLTFLoader.js?v=130'


const framegeo = new BoxBufferGeometry(1,1,1)
const framemat = new MeshLambertMaterial({
	color: 'wheat',
})
const planegeo = new PlaneGeometry(1,1,1)

const texLoader = new TextureLoader()
const gltfLoader = new GLTFLoader()




class Install {

	constructor( init ){
		init = init || {}
		if( typeof init.url !== 'string' ){
			console.log("installation is missing url")
			return
		}
		Object.assign( this, init )

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

		try{
			const parse = JSON.parse( this.quaternion )
			this.GROUP.quaternion.set( parse._x, parse._y, parse._z, parse._w )
			console.log('parsed: ', parse )
		}catch( err ){
			console.log('failed to parse Install quaternion', err )
		}

	}

}



// const images = ['jpg', 'png', 'jpeg', 'gif']
// const models = ['glb', 'gltf']

// let regex
// const derive_type = url => {
// 	for( const type of images ){
// 		regex = new RegExp( type, 'i')
// 		if( url.match( regex )) return 'image'
// 	}
// 	for( const type of models ){
// 		regex = new RegExp( type, 'i')
// 		if( url.match( regex )) return 'model'
// 	}
// }


export default Install