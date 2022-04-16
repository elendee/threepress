import {
	BoxBufferGeometry,
	MeshLambertMaterial,
	Mesh,
	Raycaster,
	Vector2,
	TextureLoader,
} from '../../inc/three.module.js?v=130'



class Artwork {

	constructor(init){
		init = init || {}
		if( typeof init.url !== 'string' ){
			console.log("artwork is missing url")
			return
		}
		this.type = derive_type( init.url )
	}

	async construct_model(){

		switch( this.type ){

			case 'image':

				break;

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