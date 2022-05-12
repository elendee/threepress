import {
	TILE_SIZE,
	BLOCK_SIZE,
	// random_range,
	// random_entry,
} from '../lib.js?v=140'
import SCENE from './SCENE.js?v=140'

import PLAYER from './PLAYER.js?v=140'
// import {
// 	// Mesh,
// 	// PlaneBufferGeometry,
// 	// MeshLambertMaterial,
// 	TextureLoader,
// } from '../../inc/three.module.js?v=140'
import {
	Block,
	BlockRegister,
}from './Block.js'




// const texLoader = new TextureLoader()

const GROUND_INTERVAL = 3000

let rendering



const BLOCK_REGISTER = THREEPRESS.BLOCK_REGISTER =  new BlockRegister()



let world_seed 
let environment


const init = world_data => {

	console.log( 'init world', world_data )

	const { 
		environment, 
		seed,
		// description,
		// domain,
		// name,
		// _require_logged,
	} = world_data 

	world_seed = seed

	// BASICS

	// const tilegeo = new PlaneBufferGeometry(1)
	// const tilemat = new MeshLambertMaterial({
	// 	// color: world_obj._plane_color,
	// 	// side: DoubleSide,
	// })
	// tilemat.map = texLoader.load( THREEPRESS.ARCADE.URLS.https +  '/resource/texture/tile.jpg')
	// const tiles = new Mesh( tilegeo, tilemat )
	// tiles.userData.is_ground = true
	// tiles.userData.is_tile = true
	// tiles.receiveShadow = true
	// tiles.rotation.x = -Math.PI /2
	// tiles.position.y += .05
	// tiles.scale.multiplyScalar( TILE_SIZE )
	// SCENE.add( tiles )

	// set updater to env and start interval
	let updater
	if( world_data.environment === 'grass' ){ 
		updater = tick_grass
	}else{
		updater = tick_grass
		console.log('unhandled env type, rendering default')//, world_data )
	}
	rendering = setInterval(() => {
		updater()
	}, GROUND_INTERVAL )

	// init
	updater()

}










// const BLOCK_CACHE = [] // []


const tick_size = 4

const tick_grass = () => {

	const playerIndex = PLAYER.getBlockIndex()

	// fill nearby Blocks
	for( let x = -tick_size; x <= tick_size; x++ ){
		for( let z = -tick_size; z <= tick_size; z++ ){

			// found = false

			const tile = { // relativize tile coords
				x: playerIndex[0] + x,
				z: playerIndex[1] + z,
			}

			const b = new Block({
				coords: [tile.x, tile.z],
				grid: [],
				seed: world_seed,
				size: BLOCK_SIZE,
				environment: environment,
			})

			// const cell_size

			if( BLOCK_REGISTER.add( b ) ){ // block was added to BLOCK_REGISTER

				b.init_grid( BLOCK_SIZE )
				b.build_ground()
				b.build_mesh_sets( tile )
				SCENE.add( b.fixture )
				b.fixture.add( b.ground_mesh )

				// const offset = ( b.cell_size / 2 )
				const offset = TILE_SIZE / 2

				b.fixture.position.set( 
					( tile.x * TILE_SIZE ),  
					0,// Math.random(), // blorb
					( tile.z * TILE_SIZE )
				)

				// console.log('adding tile', tile )

				const low = Math.abs( playerIndex[0] - x ) > 1 || Math.abs( playerIndex[1] - z ) > 1
				b.setLOD( low ? 'low' : 'high')

			}

		}
	}

	// clear distant Blocks
	BLOCK_REGISTER.sweep( playerIndex, tick_size )

}













































































// 



export default {
	init,
	BLOCK_REGISTER,
}