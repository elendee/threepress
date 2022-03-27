import * as lib from './lib.js?v=121'
// three stuff
import {
	Vector3,
	Quaternion,
	// BoxBufferGeometry,
	Mesh,
    MeshLambertMaterial,
    MeshBasicMaterial,
    PlaneBufferGeometry,
    TextureLoader,
} from '../inc/three.module.js?v=121'
import SCENE from './world/SCENE.js?v=121'
import RENDERER from './world/RENDERER.js?v=121'
import CAMERA from './world/CAMERA.js?v=121'
import LIGHT from './world/LIGHT.js?v=121'
// engine stuff
import animate from './world/animate.js?v=121'
import BROKER from './world/WorldBroker.js?v=121'
import WS from './world/WS.js?v=121'
// game stuff
import STATE from './world/STATE.js?v=121'
import Player from './world/Player.js?v=121'
// registers
import PLAYER from './world/PLAYER.js?v=121'
import TOONS from './world/TOONS.js?v=121'
// controls
import KEYS from './controls/KEYS.js?v=121'
import BINDS from './controls/BINDS.js?v=121'
import MOUSE from './controls/MOUSE.js?v=121'
import CHAT from './world_ui/CHAT.js?v=121'
import TARGET from './world_ui/TARGET.js?v=121'
import HUD from './world_ui/HUD.js?v=121'


lib.tstack('add_world')



// basic init
const eles = document.querySelectorAll('#threepress-world')
const world_ele = eles[0] // ( already checked in init_base.js )
world_ele.innerHTML = ''
world_ele.appendChild( RENDERER.domElement )
// SCENE.add( CAMERA ) // ( move to player on load )
SCENE.add( LIGHT.hemispherical )
if( eles.length > 1 ){
	console.log('too many Threepress World elements found', eles )
	// lib.hal('error', 'currently only one Threepress world is allowed per page', 5 * 1000 )
}else{

	const style = document.createElement('link')
	style.rel = 'stylesheet'
	style.href = THREEPRESS.plugin_url + '/static/css/world.css?v=121'
	document.head.appendChild( style )

	const wrapper = document.createElement('div')
	wrapper.id = 'threepress-ui-wrapper'
	world_ele.prepend( wrapper )
	// insertBefore( RENDERER.domElement, wrapper )

	WS.init( world_ele )
	KEYS.init()
	MOUSE.init()
	TARGET.init()
	HUD.init()
	CHAT.init()
}




const voxel_type_map = {
	lambert: MeshLambertMaterial,
	basic: MeshBasicMaterial,
}


const WORLD = {
	voxel_scale: 1,
	voxel_mats: {},
}

const texLoader = new TextureLoader()




// callbacks

const init_toon = async( event, toon_data, is_player1 ) => {
	/*
		called both directly and as a callback... probably unecessary
		player1 should init like any other player
	*/

	if( event ) toon_data = event.toon 
		
	// console.log('init toon event:', event )
	// console.log('init toon toon_data:', toon_data, is_player1 )

	if( is_player1 ){
		PLAYER.hydrate( toon_data )
		PLAYER.player1 = true
	}

	const toon = is_player1 ? PLAYER : new Player( toon_data )

	TOONS[ toon.uuid ] = toon

	// if( !is_player1 ){
	// 	console.log( 'hydrated new toon: ', toon )
	// }

	switch( toon_data.world_modeltype ){

		case 'quaternius_low':
			await toon.construct_model()
			break;

		default: 
			console.log('unknown toon modeltype: ', toon_data )
			break;
	}

	toon.rest()

	SCENE.add( toon.GROUP )

	PLAYER.begin_pulse()

}








const init_world = async( world_data ) => {

	switch( world_data.ground ){

		case 'plane':

			const planegeo = new PlaneBufferGeometry(1)
			const planemat = new MeshLambertMaterial({
				// color: world_data._plane_color,
				// side: DoubleSide,
			})
			if( 0 && world_data._plane_color ){
				planemat.color.set( world_data._plane_color )
			}else{
				planemat.map = texLoader.load('https://arcade.threepress.shop/resource/texture/tile.jpg')
			}
			const plane = new Mesh( planegeo, planemat )
			plane.rotation.x = -Math.PI /2
			plane.scale.multiplyScalar( 100 )
			SCENE.add( plane )
			break;

		case 'voxel':

			const { voxel_mats, voxels, scale } = world_data

			if( !voxel_mats || !voxels || !scale ){
				console.log('missing voxel data: ', voxel_mats, voxels, scale)
				return
			}

			// ___ scale
			WORLD.voxel_scale = scale

			// ___ mats 
			/* 
			-- name
			-- type
			-- color
			server-sent voxels must be tagged with a key of an existing voxel mat
			*/
			for( const mat of voxel_mats ){
				const{ name, type, color } = mat
				if( !name || !type || !color ){
					console.log('voxel mat data missing', mat )
					continue
				}
				WORLD.voxel_mats[ mat.name ] = new voxel_type_map[ mat.type ]({
					color: mat.color,
				})
			}

			// ___ the voxels
			let i = 0
			for( const v of voxels ){
				setTimeout(()=>{
					BROKER.publish('WORLD_ADD_VOXEL', { data: v })
				}, i * 100)
				i++
			}
			break;

		default: 
			console.log('unknown ground type: ', world_data )
			break;
	}

}







const init_entry = async( event ) => {

	console.log('world init: ', event )
	
	const { type, world, toon } = event	

	if( !world ){
		console.log('missing ground init')
		return
	}
	if( !toon ){
		console.log('missing toon init')
		return
	}

	animate()

	await init_world( world )

	await init_toon( null, toon, true )

	PLAYER.GROUP.add( CAMERA.fixture )

	CAMERA.position.set( 0, 1, -10 ) // 1 == just slightly elevated
	// PLAYER.bbox.max.y * 1.5

	CAMERA.lookAt( CAMERA.fixture.position )

	setTimeout(() => {
		BROKER.publish('CAMERA_LOOK_HOME')
	}, 2000)

	// BROKER.publish('CONTROLS_TARGET', {
	// 	target: PLAYER.GROUP.position,
	// })

}








const add_voxel = event => {
	const { data } = event

	const { coords, mat, shared } = data

	if( !coords || !mat ){
		console.log('invalid voxel data', data )
		return
	}

	const reference = WORLD.voxel_mats[ mat ]

	const material = shared ? reference : reference.clone()

	const voxel = new Mesh( WORLD.voxel_geo, material )

	voxel.position.set( 
		coords.x * WORLD.voxel_scale, 
		coords.y * WORLD.voxel_scale,
		coords.z * WORLD.voxel_scale
	)

	SCENE.add( voxel )

}



const ping_toon = uuid => {
	BROKER.publish('SOCKET_SEND', {
		type: 'ping_toon',
		uuid: uuid,
	})
}


// const handle_walk = event => {
// 	const { type, state, uuid, data } = event
// 	const toon = TOONS[ uuid ]
// 	if( !toon ) return ping_toon( uuid )
// 	if( !toon.GROUP ) return // pre-load

// 	toon.animate('Walk', state )
// 	toon.state.walking = state

// 	const { pos, quat } = data
// 	toon.GROUP.position.set( pos.x, pos.y, pos.z )
// 	toon.GROUP.quaternion.set( quat._x, quat._y, quat._z, quat._w )
// 	// toon.lerpto.position.count = 100
// 	// toon.lerpto.position.vec.set( pos.x, pos.y, pos.z )

// }

// const handle_turn = event => {

// 	const { type, state, uuid, data } = event
// 	// const rad = data
// 	const toon = TOONS[ uuid ]
// 	if( !toon ) return ping_toon( uuid )
// 	if( !toon.GROUP || !data ) return // pre-
// 	// if( toon.player1 ) return // always client authoritative

// 	toon.animate('Walk', state )
// 	setTimeout(()=>{
// 		toon.animate('Walk')
// 	}, 500 )

// 	console.log('data: ', data )

// 	const { quat } = data

// 	toon.GROUP.quaternion.set( quat._x, quat._y, quat._z, quat._w )
// 	// rotation.y = rad

// 	// console.log('receiving turn:', rad )
// // 	toon.state.turning = state

// // 	toon.GROUP.rotation.y = rad
// // 	// toon.lerpto.rotation.count = 50
// // 	// toon.lerpto.rotation.rad = rad
// // 	// set( pos.x, pos.y, pos.z )
// }

// const handle_strafe = event => {
// 	const { type, state, uuid, data } = event
// 	const toon = TOONS[ uuid ]
// 	if( !toon ) return ping_toon( uuid )
// 	if( !toon.GROUP ) return // pre-load

// 	toon.animate('Walk', state )
// 	toon.state.strafing = state

// 	const { pos, quat } = data
// 	toon.GROUP.position.set( pos.x, pos.y, pos.z )
// 	toon.GROUP.quaternion.set( quat._x, quat._y, quat._z, quat._w )
// 	// toon.GROUP.position.set( pos.x, pos.y, pos.z )
// 	// toon.lerpto.position.count = 100
// 	// toon.lerpto.position.vec.set( pos.x, pos.y, pos.z )

// }



const handle_core = event => {
	const { uuid, p, q, s, force } = event

	// console.log( event )

	if( PLAYER.uuid === uuid && !force ) return
	const toon = TOONS[ uuid ]
	if( !toon ) return ping_toon( uuid )
	if( !toon.GROUP ) return // pre-load

	toon.animate('Walk', s.s || s.w )
	toon.state.strafing = s.s
	toon.state.walking = s.w


	// pos
	if( toon.lerping ){
		clearInterval( toon.lerping )
		clearTimeout( toon.lerpstop )
	}
	toon.lerping = setInterval(() => {
		toon.GROUP.position.lerp( new Vector3( p.x, p.y, p.z ), .3 )
	}, 50)
	toon.lerpstop = setTimeout(()=> {
		toon.GROUP.position.set( p.x, p.y, p.z )
		clearInterval( toon.lerping )
	}, 400)

	// quat
	if( toon.slerping ){
		clearInterval( toon.slerping )
		clearTimeout( toon.slerpstop )
	}
	toon.slerping = setInterval(() => {
		toon.GROUP.quaternion.slerp( new Quaternion( q.x, q.y, q.z, q.w ), .3 )
	}, 50)
	toon.slerpstop = setTimeout(()=> {
		toon.GROUP.quaternion.set( q.x, q.y, q.z, q.w )
		clearInterval( toon.slerping )
	}, 400)

}





const set_active = event => {
	const { state } = event
	STATE.active = state
	if( state ){
		RENDERER.domElement.parentElement.classList.add('threepress-world-active')
	}else{
		RENDERER.domElement.parentElement.classList.remove('threepress-world-active')
	}
}


BROKER.subscribe('WORLD_SET_ACTIVE', set_active )
BROKER.subscribe('WORLD_INIT', init_entry )
BROKER.subscribe('TOON_INIT', init_toon )
BROKER.subscribe('WORLD_ADD_VOXEL', add_voxel )
BROKER.subscribe('TOON_CORE', handle_core )
// BROKER.subscribe('TOON_WALK', handle_walk )
// BROKER.subscribe('TOON_TURN', handle_turn )
// BROKER.subscribe('TOON_STRAFE', handle_strafe )
