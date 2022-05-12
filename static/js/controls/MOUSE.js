import PLAYER from '../world/PLAYER.js?v=140'
import CAMERA from '../world/CAMERA.js?v=140'
import RAYCASTER from './RAYCASTER.js?v=140'
import RENDERER from '../world/RENDERER.js?v=140'
import SCENE from '../world/SCENE.js?v=140'
import {
	Vector3,
} from '../../inc/three.module.js?v=140'
import BROKER from '../world/WorldBroker.js?v=140'
import STATE from '../world/STATE.js?v=140'

// const buttons = ['left', 'middle', 'right']





const ORIGIN = new Vector3()

let lastX = 0
let lastY = 0
let diffX, diffY
let tracking_look = false
let vert_scalar

const track_look = e => { // ( right click )

	// console.log( 'track look')
	if( !PLAYER.GROUP ) return // pre model-load

	diffX = e.clientX - lastX
	diffY = e.clientY - lastY

	// PLAYER.GROUP.rotateX( diffY / 300 )

	lastY = e.clientY
	lastX = e.clientX

	// BROKER.publish('STREAM_SET')
	PLAYER.GROUP.rotateY( -diffX / 300 )

	if( current_cam_dist > MAX_DIST * .66 ){
		vert_scalar = 6
	}else if( current_cam_dist > MAX_DIST * .33 ){
		vert_scalar = 4
	}else{
		vert_scalar = 2
	}

	if( !STATE.first_person ){

		CAMERA.position.y += ( diffY / 20 ) * vert_scalar
		CAMERA.position.y = Math.min( MAX_DIST, CAMERA.position.y )
		camera_look_home()

	}else{

		CAMERA.rotation.x += diffY / 200 

	}

	PLAYER.need_stream = true

}

let panned = false

const pan_look = e => { // ( left click )

	// console.log('pan look ', e )

	if( current_cam_dist === 'unset' ){
		current_cam_dist = CAMERA.position.distanceTo( CAMERA.fixture.position )
	}

	diffX = e.clientX - lastX
	diffY = e.clientY - lastY

	lastX = e.clientX
	lastY = e.clientY

	if( STATE.first_person ){
		track_look( e )
		return 
	}

	if( tracking_look ){
		console.log('tracking look abort')
		return
	}

	// if( !panned ){
	// 	const trigger = document.querySelector('#modal-trigger-unpan')
	// 	if( trigger ) trigger.style.display = 'inline-block'
	// }

	panned = true

	// console.log('debug', e.clientX, e.clientY, lastX, lastY, diffX, diffY, current_cam_dist )

	CAMERA.fixture.rotateY( -diffX / 300 )

	if( current_cam_dist > MAX_DIST * .66 ){
		vert_scalar = 6
	}else if( current_cam_dist > MAX_DIST * .33 ){
		vert_scalar = 4
	}else{
		vert_scalar = 2
	}
	// CAMERA.fixture.rotateX( diffY / 300 )
	CAMERA.position.y += ( diffY / 20 ) * vert_scalar // moved to pan

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
				const { mesh } = detect_object_clicked( e, RENDERER.domElement.getBoundingClientRect() )
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
			PLAYER.animate('turning', false, 500 )
			document.removeEventListener('mousemove', track_look )
			break;

		default: break;
	}

}


function click_down( e ){

	lastX = e.clientX
	lastY = e.clientY

	// console.log( e.which )

	BROKER.publish('WORLD_SET_ACTIVE', {
		state: true,
	})

	BROKER.publish('CHAT_BLUR')

	switch( e.which ){

		case 1: // left
			e.preventDefault()
			if( STATE.get() === 'holding' ){
				BROKER.publish('WORLD_INSTALL', {
					e: e,
				})
				return
			}
			document.addEventListener('mousemove', pan_look )
			break;

		case 2: // mid
			break;

		case 3: // right
			e.preventDefault()
			lastX = e.clientX
			lastY = e.clientY
			tracking_look = true
			PLAYER.animate( 'turning', true, 500 )
			document.addEventListener('mousemove', track_look )
			break;

		default: break;
	}

}







const scroll_dist = new Vector3()

let current_cam_dist = 'unset'

const SCROLL_STEP = 1

function mouse_wheel( e ){

	e.preventDefault()

	scroll_dist.subVectors( ORIGIN, CAMERA.position ).normalize()
	.multiplyScalar( SCROLL_STEP )

	if( typeof current_cam_dist === 'number'){
		scroll_dist.multiplyScalar( current_cam_dist / 20 )
	}

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

		if( CAMERA.position.length() < MIN_DIST + 1 ){ // GLOBAL.RENDER.MIN_CAM
			set_cam_state( true )
		}

	}

	current_cam_dist = CAMERA.position.distanceTo( CAMERA.fixture.position )

	return true

}


const set_cam_state = state => {
	if( !PLAYER.GROUP ) return
	if( state ){
		STATE.first_person = true
		CAMERA.position.set(0,0,-1)
		PLAYER.GROUP.visible = false
		CAMERA.rotation.x = Math.PI
	}else{
		STATE.first_person = false
		CAMERA.position.set(0,5,-10)
		PLAYER.GROUP.visible = true
	}
	// CAMERA.rotation.x = 0
	console.log('skipping set_cam_state ', state )
}



const camera_look_home = () => {
	// 
	if( !PLAYER.GROUP ) return
	// console.log('ya.. runs')
	CAMERA.lookAt( new Vector3().copy( PLAYER.GROUP.position ).add( CAMERA.fixture.position ) )
}



const projection = new Vector3()
let dist = new Vector3()

const MIN_DIST = 3
const MAX_DIST = 300

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
		Math.max( MIN_DIST * 10, MAX_DIST ) // ( SHIP.dimensions.z / 2 )
	)

	camera_look_home()

}




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
function detect_object_clicked( e, bounds ){

	if( !e.preventDefault ) return { mesh: false }
	e.preventDefault();

	if( STATE.get() === 'holding') return { mesh: false }

	let mx, my

	// bounds == a frame for the click
	if( bounds ){
		mx = e.clientX - bounds.left
		my = e.clientY - bounds.top
	}else{
		mx = e.clientX
		my = e.clientY
	}

	const x = ( mx / RENDERER.domElement.clientWidth ) * 2 - 1
	const y =  - ( my / RENDERER.domElement.clientHeight ) * 2 + 1

	RAYCASTER.setFromCamera({
		x: x, 
		y: y
	}, CAMERA )

	const intersects = RAYCASTER.intersectObjects( SCENE.children, true ) // [ objects ], recursive (children) (ok to turn on if needed)

	if( !intersects.length ){ // no more skybox woot  xx1 == skyboxxx
		BROKER.publish('TARGET_SET', { uuid: false, mesh: false, caller: 'clear'} )
		return { mesh: false }
	}

	// --- should it check entire intersects
	let clicked = false
	let c = 0
	while( !clicked && c < intersects.length ){
		clicked = get_clickable( intersects[c].object )
		c++
	}
	// --- or just the first.. but sometimes this is not an actual object
	// clicked = get_clickable( intersects[0].object )

	return {
		mesh: clicked,
		// point: 'blorb',
		intersects: intersects,
	}
 
}


const get_intersects = ( relative_x, relative_y, bounds ) => {

	const x = ( relative_x / RENDERER.domElement.clientWidth ) * 2 - 1
	const y =  - ( relative_y / RENDERER.domElement.clientHeight ) * 2 + 1

	RAYCASTER.setFromCamera({
		x: x, 
		y: y
	}, CAMERA )

	const intersects = RAYCASTER.intersectObjects( SCENE.children, true ) // [ objects ], recursive (children) (ok to turn on if needed)

	return intersects

}


function detect_object_hovered( e, bounds ){

	if( !e || !e.preventDefault ) return { intersection: false }
	e.preventDefault();

	let mx, my

	// bounds == frame for the click
	if( bounds ){
		mx = e.clientX - bounds.left
		my = e.clientY - bounds.top
	}else{
		mx = e.clientX
		my = e.clientY
	}

	const intersects = get_intersects( mx, my, bounds )

	// console.log('detect intersects:', intersects )

	if( !intersects.length ){ // no more skybox woot  xx1 == skyboxxx
		BROKER.publish('TARGET_SET', { 
			uuid: false, 
			mesh: false, 
			caller: 'clear'
		})
		return { mesh: false }
	}	

	let hovered_intersection = false
	let c = 0
	while( !hovered_intersection && c < intersects.length ){
		hovered_intersection = scour_collidable( intersects )
		c++
	}
	// const hovered_intersection = intersects[0].object

	// console.log('hover detect', hovered_intersection )
	
	return {
		intersection: hovered_intersection,
		// intersects: intersects,
	}
 
}


function scour_collidable( intersects ){

	if( !intersects ) return; // 'no object'

	let type
	let userData
	for( const int of intersects ){  // basically anything but the object itself for now...
		userData = int.object?.userData
		if( userData.held_mesh || userData.is_cosmetic ) continue
		type = int.object?.type
		if( type === 'TransformControlsPlane' || type === 'Line' ) continue
		return int
	}

	return false
}


// B)
function get_clickable( obj ){
	// careful of mutation here, but its ok as is

	if( !obj ) return // 'no object'

	const original = obj

	// console.log('checking: ' + original.type, original.userData )

	if( is_clickable( obj ) ) return obj

	for( let i = 0; i < 5; i++ ){

		if( !obj.parent ){
			// if( THREEPRESS.home_url.match(/localhost/)) console.log('not clickable', original.type )
			return // 'no parent' 
		}

		if( is_clickable( obj.parent ) ) return obj.parent
		// console.log('checking: ', obj.parent.userData )
		obj = obj.parent 

	}

	return false

}

// C)
function is_clickable( obj ){
	// console.log( 'is click: ', obj?.userData )
	return obj?.userData?.clickable
}



const click_up_both = event => {
	click_up({ which: 3, caller: 'mouseout' }) 
	click_up({ which: 1, caller: 'mouseout' }) 	
}





RENDERER.domElement.addEventListener('wheel', mouse_wheel, { passive: false } )
RENDERER.domElement.addEventListener('mousedown', click_down )
RENDERER.domElement.addEventListener('mouseup', click_up )

RENDERER.domElement.addEventListener('contextmenu', event => event.preventDefault())

document.addEventListener('visibilitychange', event => {
	BROKER.publish('WORLD_SET_ACTIVE', { 
		state: document.visibilityState !== 'visible' 
	})
	// Howler.mute( document.visibilityState !== 'visible' )
})

BROKER.subscribe('MOUSE_UNPAN', unpan_cam )
BROKER.subscribe('QUERY_DROP_TARGET', query_drop )
BROKER.subscribe('CAMERA_LOOK_HOME', camera_look_home )
BROKER.subscribe('CLICKUP', click_up_both )





const init = () => {
	// no op
}

export default {
	init,
	detect_object_clicked,
	detect_object_hovered,
	get_intersects,
}
