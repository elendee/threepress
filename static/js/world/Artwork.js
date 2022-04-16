import {
	BoxBufferGeometry,
	Group,
	MeshLambertMaterial,
	Mesh,
	PlaneGeometry,
	Raycaster,
	Vector2,
	TextureLoader,
} from '../../inc/three.module.js?v=130'


const framegeo = new BoxBufferGeometry(1,1,1)
const framemat = new MeshLambertMaterial({
	color: 'wheat',
})
const planegeo = new PlaneGeometry(1,1,1)

const texLoader = new TextureLoader()




class Artwork {

	constructor( init ){
		init = init || {}
		if( typeof init.url !== 'string' ){
			console.log("artwork is missing url")
			return
		}
		this.url = init.url
		this.type = derive_type( init.url )
		this.held_mesh = init.held_mesh
	}

	async construct_model(){

		let group = new Group()
		if( this.held_mesh ){
			group.userData.held_mesh = true
		}

		switch( this.type ){

			case 'image':
				const frame = new Mesh( framegeo, framemat )
				frame.userData.held_mesh = this.held_mesh
				group.add( frame )
				const image = new Mesh( planegeo, new MeshLambertMaterial({
					map: texLoader.load( this.url ),
				}))
				image.userData.held_mesh = this.held_mesh
				group.add( image )
				group.scale.x = 5
				group.scale.y = 5
				group.scale.z = 1
				image.position.z = .6
				this.GROUP = group
				return group

			case 'model':

				break;

			default:
				console.log('invalid artwork construct', this)
				return
		}

		// return gltf

	}

}



const images = ['jpg', 'png', 'jpeg', 'gif']
const models = ['glb', 'gltf']

let regex
const derive_type = url => {
	for( const type of images ){
		regex = new RegExp( type, 'i')
		if( url.match( regex )) return 'image'
	}
	for( const type of models ){
		regex = new RegExp( type, 'i')
		if( url.match( regex )) return 'model'
	}
}


export default Artwork