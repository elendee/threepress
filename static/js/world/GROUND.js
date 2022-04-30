import {
	TILE_SIZE,
} from '../lib.js?v=130'
import SCENE from './SCENE.js?v=130'
import * as GRASS from './grass.js?v=130'
import PLAYER from './PLAYER.js?v=130'
import {
	Mesh,
	PlaneBufferGeometry,
	MeshLambertMaterial,
	TextureLoader,
} from '../../inc/three.module.js?v=130'




const texLoader = new TextureLoader()

const GROUND_INTERVAL = 5000

let playerIndex = []
let rendering


const grasses = THREEPRESS.grasses = []
const gusts = []





const init = world_data => {

	console.log( 'init world', world_data )

	const { environment } = world_data 

	const terrain = environment || 'grass'


	// BASICS

	const tilegeo = new PlaneBufferGeometry(1)
	const tilemat = new MeshLambertMaterial({
		// color: world_obj._plane_color,
		// side: DoubleSide,
	})
	tilemat.map = texLoader.load( THREEPRESS.ARCADE.URLS.https +  '/resource/texture/tile.jpg')
	const tiles = new Mesh( tilegeo, tilemat )
	tiles.userData.is_ground = true
	tiles.userData.is_tile = true
	tiles.receiveShadow = true
	tiles.rotation.x = -Math.PI /2
	tiles.position.y += .05
	tiles.scale.multiplyScalar( TILE_SIZE )
	SCENE.add( tiles )




	// ENVIRONMENT INTERVALS

	// init
	if( world_data.environment === 'grass' ){
		init_grass()
	}else{
		console.log('unhandled env type, rendering default')//, world_data )
		init_grass()
	}

	// set updater to env and start interval
	let updater
	if( world_data.environment === 'grass' ){
		updater = update_grass
	}else{
		updater = update_grass
		console.log('unhandled env type, rendering default')//, world_data )
	}
	rendering = setInterval(() => {
		playerIndex[0] = Math.floor( ( PLAYER.GROUP.position?.x || 0 ) / TILE_SIZE )
		playerIndex[1] = Math.floor( ( PLAYER.GROUP.position?.z || 0 ) / TILE_SIZE )
		updater()
	}, GROUND_INTERVAL )

	// init
	playerIndex[0] = Math.floor( ( PLAYER.GROUP?.position?.x || 0 ) / TILE_SIZE )
	playerIndex[1] = Math.floor( ( PLAYER.GROUP?.position?.z || 0 ) / TILE_SIZE )
	updater()

}










// init grass
const init_grass = () => {
	for( let i = 0; i < 25; i++ ){
		grasses[i] = {
			mesh: GRASS.grass.clone(true),
			index: false,
		}
		// grasses[i].mesh.frustumCulled = false
		// setTimeout(() => {
		// 	SCENE.add( grasses[i].mesh )	
		// }, GROUND_INTERVAL )
		
	}	
}

const update_grass = () => {

	// clear up distant grasses
	for( const grass of grasses ){
		if( Array.isArray( grass.index ) ){
			if( Math.abs( grass.index[0] - playerIndex[0] ) > 2 || 
				Math.abs( grass.index[1] - playerIndex[1] ) > 2 ){
				grass.index = false
			}
		}
	}

	// console.log('playerIndex: ', playerIndex)
	// let free =  0
	// for( const grass of grasses ){
	// 	if( !grass.index ){
	// 		free++
	// 	}else{
	// 		console.log( grass.index )
	// 	}
	// }
	// console.log('free grasses', free)

	// find empty nearby tiles
	let tile, found
	for( let x = -2; x <=2; x++ ){
		for( let z = -2; z <=2; z++ ){
			found = false
			tile = { // relativize tile coords
				x: playerIndex[0] + x,
				z: playerIndex[1] + z,
			}

			if( !tile.x && !tile.z ) continue // invalid, but also skip origin

			for( const grass of grasses ){ // see if already got a mesh there from grasses
				if( grass.index && grass.index[0] === tile.x && grass.index[1] === tile.z ){
					found = true
				}
			}
			if( !found ){ // if not, assign an empty one
				for( const grass of grasses ){
					if( !Array.isArray( grass.index ) ){
						grass.index = [ tile.x, tile.z ]
						grass.mesh.position.set( tile.x * TILE_SIZE , 0, tile.z * TILE_SIZE )
						if( !grass.mesh.parent ) SCENE.add( grass.mesh )
						break;
					}
				}
			}
		}
	}

	// console.log('player in tile', playerIndex )
}


// const place_grass = () => {
// 	SCENE.add( grasses[i] )
// 	grasses[i].position.x += Math.random() * 200
// }





// 



export default {
	init,
}