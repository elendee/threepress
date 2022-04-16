import {
	spinner,
} from '../lib.js?V=130'
import BROKER from './WorldBroker.js?v=130'
import RENDERER from './RENDERER.js?v=130'
import SCENE from './SCENE.js?v=130'
import STATE from './STATE.js?v=130'
import MOUSE from '../controls/MOUSE.js?v=130'
import Artwork from './Artwork.js?v=130'
import {
	BoxBufferGeometry,
	MeshLambertMaterial,
	Mesh,
	Raycaster,
	Vector2,
	TextureLoader,
} from '../../inc/three.module.js?v=130'



const texLoader = new TextureLoader()




const hold_ui = document.createElement('div')
hold_ui.id = 'hold-ui'
const cancel = document.createElement('div')
cancel.id = 'hold-cancel'
cancel.innerHTML = 'cancel'
hold_ui.appendChild( cancel )
setTimeout( () => { // just needs to wait for compile to be done
	RENDERER.domElement.parentElement.appendChild( hold_ui )
}, 1000 ) 




const image_geo = new BoxBufferGeometry(1,1,1)
const image_mat = new MeshLambertMaterial({
	color: 'rgb(255, 245, 245)',
})



const holdcaster = new Raycaster()
const pointer = new Vector2()


let held_mesh
let hit_detecting = false
let updating_held_position = false





const clear_hold = event => {

	console.log('clear hold')

	// state
	STATE.splice('holding')
	STATE.hold = false

	// object
	SCENE.remove( held_mesh )

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



const render_hold = async( event ) => {

	spinner.show()

	try{

		const { url, type } = event

		console.log('render hold:', type, url )

		const artwork = new Artwork({
			url: url,
		})

		held_mesh = await artwork.construct_model()
		// if( !held_mesh || STATE.get() !== 'holding' ){
		// 	console.log("got invalid hold somehow", type, url)
		// 	BROKER.publish('CLEAR_HOLD')
		// 	return
		// }
		console.log('rendering: ', held_mesh )

		// state
		STATE.set('holding')

		// object
		SCENE.add( held_mesh )

		// tracking
		show_tracking( true )

		// ui
		show_ui( true )	

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


const show_ui = state => {

	if( state ){
		hold_ui.style.display = 'inline-block'
	}else{
		hold_ui.style.display = 'none'
	}

}




const update_hold_point = () => {
	/*
		runs every 500ms
	*/

	clearInterval( updating_held_position )

	if( !held_mesh ){
		console.log('no mesh to update')
		BROKER.publish('CLEAR_HOLD')
		return
	}

	const { 
		intersection,
		// intersects,
	} = MOUSE.detect_object_hovered( last_traced, RENDERER.domElement.getBoundingClientRect() )

	if( intersection ){
		let lerps = 0
		updating_held_position = setInterval(() => {
			held_mesh.position.lerp( intersection.point, .1 )
			lerps++
			if( lerps > 50 ){
				clearInterval( updating_held_position )
				updating_held_position = false
			}
		}, 30)
	}

}




let mx, my, bounds, last_traced
let iter = 0
const trace_hold = e => {
	if( iter % 3 === 0 ){
		last_traced = e
		bounds = RENDERER.domElement.getBoundingClientRect()
		mx = e.clientX - bounds.left
		my = e.clientY - bounds.top
		// console.log('tracin hold', mx, my)

	}
	iter++
}









BROKER.subscribe('RENDER_HOLD', render_hold )
BROKER.subscribe('CLEAR_HOLD', clear_hold )


export default {}