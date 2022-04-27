import {
	spinner,
} from '../lib.js?V=130'
import BROKER from './WorldBroker.js?v=130'
import RENDERER from './RENDERER.js?v=130'
import SCENE from './SCENE.js?v=130'
import STATE from './STATE.js?v=130'
import MOUSE from '../controls/MOUSE.js?v=130'
// import Install from './Install.js?v=130'
import {
	// BoxBufferGeometry,
	MeshLambertMaterial,
	Mesh,
	SphereGeometry,
	// Raycaster,
	// Vector2,
} from '../../inc/three.module.js?v=130'






const hold_ui = document.createElement('div')
hold_ui.id = 'hold-ui'
const cancel = document.createElement('div')
cancel.id = 'hold-cancel'
cancel.innerHTML = '&times; done'
hold_ui.appendChild( cancel )

setTimeout( () => { // just needs to wait for compile to be done
	RENDERER.domElement.parentElement.appendChild( hold_ui )
}, 1000 ) 

// const image_geo = new BoxBufferGeometry(1,1,1)
// const image_mat = new MeshLambertMaterial({
// 	color: 'rgb(255, 245, 245)',
// })

const Placeholder = () => {
	const geo = new SphereGeometry(1,8,8)
	const mat = new MeshLambertMaterial({
		color: 'red',
		transparent: true,
		opacity: .5,
	})
	const mesh = new Mesh( geo, mat )
	mesh.userData.held_mesh = true
	mesh.scale.multiplyScalar( 2 )
	return mesh
}

// const holdcaster = new Raycaster()
// const pointer = new Vector2()


// let held_mesh
let hit_detecting = false
let updating_held_position = false





const clear_hold = event => {

	console.log('clear hold')

	// state
	STATE.splice('holding')
	STATE.held_url = false

	// object
	SCENE.remove( placeholder )

	// tracking
	show_tracking( false )
	// // mouse tracking
	// RENDERER.domElement.removeEventListener('mousemove', trace_hold )
	// // hover rendering
	// clearInterval( hit_detecting )

	// ui
	show_ui( false )

}

cancel.addEventListener('click', clear_hold )

let placeholder

const render_hold = async( event ) => {

	spinner.show()

	try{

		const { url, type } = event

		console.log('render hold:', type, url )

		placeholder = Placeholder()

		// state
		STATE.set('holding')
		STATE.held_url = url

		// object
		SCENE.add( placeholder )

		// tracking
		show_tracking( true )

		// ui
		show_ui( true, url )	

	}catch( err ){

		BROKER.publish('CLEAR_HOLD')
		console.log('err loading artwork', err )

	}

	spinner.hide()

}


const show_tracking = state => {

	RENDERER.domElement.removeEventListener('mousemove', trace_hold )
	clearInterval( hit_detecting )

	if( state ){
		RENDERER.domElement.addEventListener('mousemove', trace_hold )
		hit_detecting = setInterval(() => {
			update_hold_point()	
		}, 200)
	}else{

	}

}


const show_ui = ( state, url ) => {

	if( state ){

		hold_ui.style.display = 'inline-block'

		// const msg = document.createElement('div')
		// msg.innerHTML = 'placing: ...' + url.substr( url.length - 10 )
		// cancel.appendChild( msg )

		BROKER.publish('CHAT_ADD', {
			sender: 'system',
			chat_type: 'system',
			msg: 'placing: ...' + url.substr( url.length - 20 ),
		})

		// const { sender_uuid, chat_type, msg, color } = event

	}else{

		hold_ui.style.display = 'none'
		// cancel.innerHTML = 'cancel'

	}

}


// let spacer = 0

const update_hold_point = () => {
	/*
		runs every 500ms
	*/

	clearInterval( updating_held_position )

	if( !placeholder ){
		console.log('no mesh to update')
		BROKER.publish('CLEAR_HOLD')
		return
	}

	const { 
		intersection,
		// intersects,
	} = MOUSE.detect_object_hovered( last_traced, RENDERER.domElement.getBoundingClientRect() )

	// console.log( 'int: ', intersection )
	// spacer++
	// if( spacer % 10  === 0 ){
	// 	console.log( intersection )
	// }

	if( intersection ){
		let lerps = 0

		updating_held_position = setInterval(() => {

			// held_mesh.lookAt( held_mesh.position.add( intersection.face.normal ) )
			placeholder.position.lerp( intersection.point, .2 )

			lerps++
			if( lerps > 50 ){
				clearInterval( updating_held_position )
				updating_held_position = false
			}
		}, 30)
	}

}




let bounds
let last_traced
// let mx, my, 
let iter = 0
const trace_hold = e => {
	if( iter % 3 === 0 ){
		last_traced = e
		bounds = RENDERER.domElement.getBoundingClientRect()
		// mx = e.clientX - bounds.left
		// my = e.clientY - bounds.top
		// console.log('tracin hold', mx, my)
	}
	iter++
}









BROKER.subscribe('RENDER_HOLD', render_hold )
BROKER.subscribe('CLEAR_HOLD', clear_hold )


export default {}