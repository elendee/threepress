import BROKER from '../helpers/EventBroker.js?v=130'
import SCENE from './SCENE.js?v=130'
import {	
	MeshLambertMaterial,
} from '../../inc/three.module.js?v=130'
import {	
	GLTFLoader,
} from '../../inc/GLTFLoader.js?v=130'
import Tree from './Tree.js?v=130'



// const loaded_trees = window.trees = {}

// const loader = new GLTFLoader()



// const materials = {
// 	pine0: new MeshLambertMaterial({
// 		color: 0x559955
// 	}),
// 	pine1: new MeshLambertMaterial({
// 		color: 0x558822
// 	}),
// 	pine2: new MeshLambertMaterial({
// 		color: 0x339955
// 	}),
// }







// const get_material = species => {
// 	return materials[ species + Math.floor( Math.random() * 3 ) ]
// }


// const preload_tree = species => {

// 	return new Promise((resolve, reject) => {

// 		loader.load('/resource/models/tree_' + species + '.gltf', gltf => {
// 			if( !gltf ){
// 				reject()
// 			}else{
// 				loaded_trees[ species ] = gltf.scene
// 				resolve()
// 			}
// 		})

// 	})

// }


// const load_tree_types = async( tree_data ) => {

// 	// console.log( 'tree load types' )

// 	let loads = []
// 	for( const tree of tree_data ){
// 		if( !loaded_trees[ tree.species ] ){
// 			loads.push( preload_tree( tree.species ) )
// 		}	
// 	}

// 	await Promise.all( loads )

// 	return true

// }



// const install_trees = tree_data => {

// 	console.log( 'tree install', tree_data )

// 	let tree
// 	for( let i = 0; i < tree_data.length; i++ ){
// 		setTimeout(() => {
// 			tree = new Tree( tree_data[i] )
// 			tree.model()
// 			tree.MODEL.position.set( tree.x, 3, tree.z )
// 			tree.MODEL.rotation.y = tree.rotation
// 			tree.MODEL.scale.multiplyScalar( .5 + tree.scale * 2 )
// 			SCENE.add( tree.MODEL )
// 		}, i * 50 )
// 	}

// }



const init = async( event ) => {

	console.log( 'tree init', event  )

	await load_tree_types( tree_data )

	install_trees( tree_data )

	return true

}


BROKER.subscribe('PONG_TREES', init )

export default {}