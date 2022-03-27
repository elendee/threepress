import PLAYER from '../world/PLAYER.js?v=121'
import CAMERA from '../world/CAMERA.js?v=121'
import RAYCASTER from './RAYCASTER.js?v=121'
import RENDERER from '../world/RENDERER.js?v=121'
import SCENE from '../world/SCENE.js?v=121'
import {
	Vector3,
} from '../../inc/three.module.js'
import BROKER from '../world/WorldBroker.js?v=121'
import STATE from '../world/STATE.js?v=121'

// const buttons = ['left', 'middle', 'right']





const ORIGIN = new Vector3()

let currentX, currentY, diffX, diffY
let tracking_look = false
const track_look = e => { // ( right click )

	// console.log( 'track look')
	if( !PLAYER.GROUP ) return // pre model-load

	diffX = e.clientX - currentX
	diffY = e.clientY - currentY

	PLAYER.GROUP.rotateY( -diffX / 300 )
	// PLAYER.GROUP.rotateX( diffY / 300 )

	// BROKER.publish('STREAM_SET')
	CAMERA.position.y += diffY / 20 // moved to pan

	// console.log( diffX, diffY )

	currentY = e.clientY
	currentX = e.clientX
	
	camera_look_home()

	// if( !PLAYER.sending_track ){
	// 	BROKER.publish('SOCKET_SEND', {
	// 		type: 'turn',
	// 		quat: PLAYER.GROUP.quaternion,
	// 	})
	// 	PLAYER.sending_track = setInterval(() => {
	// 		BROKER.publish('SOCKET_SEND', {
	// 			type: 'turn',
	// 			quat: PLAYER.GROUP.quaternion,
	// 		})
	// 	}, 500 )
	// }
	PLAYER.need_stream = true

}

let panned = false
const pan_look = e => { // ( left click )

	// console.log('pan look ', panned )

	if( tracking_look ){
		console.log('tracking look abort')
		return
	}

	if( !panned ){
		const trigger = document.querySelector('#modal-trigger-unpan')
		if( trigger ) trigger.style.display = 'inline-block'
	}

	panned = true

	diffX = e.clientX - currentX
	diffY = e.clientY - currentY

	CAMERA.fixture.rotateY( -diffX / 300 )

	// CAMERA.fixture.rotateX( diffY / 300 )
	CAMERA.position.y += diffY / 20 // moved to pan

	currentY = e.clientY
	currentX = e.clientX

	clearInterval( unpan )
	unpan = false
	// clear_unpan()
	camera_look_home()

}


let unpan
let unpan_count = THREEPRESS.unpan_count = 0
const unpan_cam = () => {
	
	if( !unpan ){

		unpan = setInterval(()=> {
			CAMERA.fixture.rotation.x -= ( CAMERA.fixture.rotation.x * .1 )
			CAMERA.fixture.rotation.y -= ( CAMERA.fixture.rotation.y * .1 )
			CAMERA.fixture.rotation.z -= ( CAMERA.fixture.rotation.z * .1 )
			unpan_count++
			// console.log('unpan')
			if( unpan_count > 50 ){
				clear_unpan()
			}

		}, 20 )
	}

	const trigger = document.querySelector('#modal-trigger-unpan')
	if( trigger ) trigger.style.display = 'none'

	panned = false
}



const clear_unpan = () => {
	CAMERA.fixture.rotation.set( 0, 0, 0 )
	clearInterval( unpan )
	unpan = false
	unpan_count = 0
}

function click_up( e ){

	switch( e.which ){
		case 1: // left
			document.removeEventListener('mousemove', pan_look )
			if( e.caller !== 'mouseout'){
				const { mesh } = detect_object_clicked( e )
				BROKER.publish('TARGET_SET', { 
					mesh: mesh, 
					caller: 'click' 
				})				
			}
			break;

		case 2: // mid
			break;
			
		case 3: // right
			tracking_look = false
			PLAYER.animate( PLAYER.animation_map.turning, false )
			document.removeEventListener('mousemove', track_look )
			// clearInterval( PLAYER.sending_track )
			// delete PLAYER.sending_track 
			break;

		default: break;
	}

}


function click_down( e ){

	// console.log( e.which )
	BROKER.publish('WORLD_SET_ACTIVE', {
		state: true,
	})

	BROKER.publish('CHAT_BLUR')

	switch( e.which ){
		case 1: // left
			e.preventDefault()
			currentX = e.clientX
			currentY = e.clientY
			document.addEventListener('mousemove', pan_look )
			break;
		case 2: // mid
			break;
		case 3: // right
			e.preventDefault()
			currentX = e.clientX
			currentY = e.clientY
			tracking_look = true
			PLAYER.animate( PLAYER.animation_map.turning, true)
			document.addEventListener('mousemove', track_look )
			break;
		default: break;
	}

}







const scroll_dist = new Vector3()

const SCROLL_STEP = 10

function mouse_wheel( e ){

	e.preventDefault()

	scroll_dist.subVectors( ORIGIN, CAMERA.position ).normalize()
	.multiplyScalar( SCROLL_STEP ) 

	// console.log( scroll_dist, ORIGIN, CAMERA.position, SCROLL_STEP )

	if( e.deltaY > 0 ){

		scroll_dist.multiplyScalar( -1 )

		if( STATE.first_person ) set_cam_state( false )

		move_wheel_amount( scroll_dist, 'out' )

		// console.log( scroll_dist, ORIGIN, CAMERA.position, SCROLL_STEP )

	}else{ // scrolling in

		if( STATE.first_person ){
			console.log('already in first')
			return true
		}

		move_wheel_amount( scroll_dist, 'in' )

		if( CAMERA.position.length() < 5 ){ // GLOBAL.RENDER.MIN_CAM
			set_cam_state( true )
		}

	}

	return true

}


const set_cam_state = state => {
	console.log('skipping set_cam_state ', state )
}



const camera_look_home = () => {
	// 
	CAMERA.lookAt( new Vector3().copy( PLAYER.GROUP.position ).add( CAMERA.fixture.position ) )
	// ORIGIN
	// CAMERA.rotation.z = -Math.PI
	// CAMERA.lookAt( ORIGIN )
}



const projection = new Vector3()
let dist = new Vector3()

const MIN_DIST = 10

const move_wheel_amount = ( scroll_dist, dir ) => {

	projection.addVectors( CAMERA.position, scroll_dist )

	dist = projection.distanceTo( ORIGIN )



	if( dist < MIN_DIST || dist < SCROLL_STEP ){  // ( SHIP.dimensions.z / 2 ) * 1.1
		// console.log('no scroll')
		set_cam_state( true )
		return false
	}

	CAMERA.position.add( scroll_dist ).clampLength( 
		MIN_DIST,
		// ( SHIP.dimensions.z / 2 ) * 1.1, 
		Math.max( MIN_DIST * 10, 500 ) // ( SHIP.dimensions.z / 2 )
		// GLOBAL.RENDER.MAX_CAM
	)

	camera_look_home()

}



// function detectMouseWheelDirection( e ){

//     var delta = null//,

//     if ( !e ) { // if the event is not provided, we get it from the window object
//         e = window.event;
//     }
//     if ( e.wheelDelta ) { // will work in most cases
//         delta = e.wheelDelta / 60;
//     } else if ( e.detail ) { // fallback for Firefox
//         delta = -e.detail / 2;
//     }

//     return delta
// }


const query_drop = event => {

	console.log('unhandled query drop', event )
	// const { e } = event

	// const { mesh } = detect_object_clicked( e )

	// console.log('query_drop:', mesh )

	// BROKER.publish('SELECTOR_DROP_SYSTEM', {
	// 	mesh: mesh,
	// })

}




// A)
function detect_object_clicked( e ){

	if(!e.preventDefault ) return { mesh: false }
	e.preventDefault();

	const x = ( e.clientX / RENDERER.domElement.clientWidth ) * 2 - 1
	const y =  - ( e.clientY / RENDERER.domElement.clientHeight ) * 2 + 1

	RAYCASTER.setFromCamera({
		x: x, 
		y: y
	}, CAMERA )

	const intersects = RAYCASTER.intersectObjects( SCENE.children, true ) // [ objects ], recursive (children) (ok to turn on if needed)

	// console.log('detect intersects:', intersects )

	if( !intersects.length ){ // no more skybox woot  xx1 == skyboxxx
		BROKER.publish('TARGET_SET', { uuid: false, mesh: false, caller: 'clear'} )
		return { mesh: false }
	}	

	// if( intersects[0].distance < GLOBAL.RENDER.TARGET_DIST ){
	let clicked = 'ethereal'
	let c = 0
	while( clicked === 'ethereal' && c < intersects.length ){
		clicked = scour_clickable( intersects[c].object )
		c++
	}

	// console.log( 'scour clicked: ', clicked )
	
	return {
		mesh: clicked,
	}
 
}

// B)
function scour_clickable( obj ){

	if( !obj ) return 'no object'

	if( obj.userData ){
		// if( obj.userData.type === 'fogbox' ) return 'fogbox'
		if( obj.userData.ethereal ) return 'ethereal'
	}

	if( check_clickable( obj ) ) return obj

	for( let i = 0; i < 5; i++ ){

		if( !obj.parent ){
			// console.log('no parent', obj )
			return 'no parent' 
		}

		if( check_clickable( obj.parent ) ) return obj.parent
		obj = obj.parent 

	}

	return false

}

// C)
function check_clickable( obj ){

	if( ( obj && obj.userData && obj.userData.clickable ) ){ // || obj && obj.type === 'planet' 
		return obj
	}else{
		return false
	}

}







RENDERER.domElement.addEventListener('wheel', mouse_wheel, { passive: false } )
RENDERER.domElement.addEventListener('mousedown', click_down )
RENDERER.domElement.addEventListener('mouseup', click_up )

RENDERER.domElement.addEventListener('contextmenu', event => event.preventDefault())

BROKER.subscribe('MOUSE_UNPAN', unpan_cam )
BROKER.subscribe('QUERY_DROP_TARGET', query_drop )


RENDERER.domElement.addEventListener('mouseout', e => { 
	click_up({ which: 3, caller: 'mouseout' }) 
	click_up({ which: 1, caller: 'mouseout' }) 
	BROKER.publish('WORLD_SET_ACTIVE', { state: false } )	
})
document.addEventListener('mouseout', e => { 
	click_up({ which: 3, caller: 'mouseout' }) 
	click_up({ which: 1, caller: 'mouseout' }) 
	BROKER.publish('WORLD_SET_ACTIVE', { state: false } )	
})


document.addEventListener('visibilitychange', event => {
	BROKER.publish('WORLD_SET_ACTIVE', { state: document.visibilityState !== 'visible' } )
	// Howler.mute( document.visibilityState !== 'visible' )
})








const init = () => {
	// no op
}

export default {
	init,
}
