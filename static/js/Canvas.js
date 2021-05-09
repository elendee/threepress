import {
	// Color,
	DirectionalLight,
	WebGLRenderer,
	Scene,
	PerspectiveCamera,
	// Vector3,
} from '../inc/three.module.js'

import { GLTFLoader } from '../inc/GLTFLoader.js'
import { OrbitControls } from '../inc/OrbitControls.js'

import {
	fill_dimensions,
} from './lib.js'

import { Modal } from './helpers/Modal.js'



const overlays = THREEPRESS.overlays = []
const canvases = THREEPRESS.canvases = []

const resolutions = [4, 2, 1.5, 1]

// const animation_types = ['static', 'rotating', 'pulsing']
// const interaction_types = ['none', 'orbit_controls', 'first_person', 'third_person', 'flight']

const loader = new GLTFLoader()


let previewing = false






export default init => {

	init = init || {}

	const canvas = window.canvas = {}

	for( const key in init ) canvas[ key ] = init[ key ]

	// inits
	canvas.res_key = typeof init.res_key === 'number' ? init.res_key : resolutions.length - 1
	canvas.view = init.view || 1000

	canvas.rotate_speed = canvas.rotate_speed || 1
	canvas.scaled_rotate = canvas.rotate_speed / 1000

	canvas.camera_dist = init.camera_dist || 5
	canvas.intensity = init.intensity || 5
	canvas.light = init.light || 'directional'

	// state
	canvas.animating = false


	// threejs eles
	canvas.SCENE = new Scene()
	canvas.RENDERER = new WebGLRenderer({ 
		antialias: true,
		alpha: true
	})
	canvas.ele = canvas.RENDERER.domElement
	canvas.ele.height = canvas.ele.width * .7
	// console.log( canvas.ele.width , canvas.ele.height )

	const intensity_threshold = 3 // input value goes higher than this intentionally

	if( canvas.light === 'directional' ){
		canvas.LIGHT = new DirectionalLight( 0xffffff, ( canvas.intensity / intensity_threshold ) )
	}else{
		//
	}
	canvas.CAMERA = new PerspectiveCamera( 30, window.innerWidth / window.innerHeight, 1, canvas.view )

	canvas.SCENE.add( canvas.LIGHT )
	canvas.SCENE.add( canvas.CAMERA )

	// dom
	if( init.overlay ){
		canvas.overlay = init.overlay
		canvas.ele.classList.add('threepress-overlay')
		overlays.push( canvas )
	}


	console.log('instantiate: ', canvas )



	canvas.init = async() => { // lights camera action

		if( !canvases.includes( canvas )) canvases.push( canvas )

		// model
		let model
		if( canvas.model ){
			const m = canvas.model
			model = await (()=>{
				return new Promise((resolve, reject ) => {
					loader.load( m.guid, res => {
						resolve( res.scene )
					}, xhr => {
						// loading progress
					}, err => {
						reject( err )
					})
				})
			})();

			fill_dimensions( model )
			model.userData.subject = true

			canvas.SCENE.add( model )

			const radius = model.userData.radius
			const diam = radius * 2

			canvas.CAMERA.far = radius * 100

			canvas.CAMERA.position.set( 0, radius, radius * canvas.camera_dist )
			canvas.LIGHT.position.set( -diam, diam, diam )
			canvas.CAMERA.lookAt( model.position )
			canvas.LIGHT.lookAt( model.position )

		}

		canvas.set_renderer()

		if( canvas.controls === 'orbit' ){
			canvas.orbit_controls = new OrbitControls( canvas.CAMERA, canvas.ele )
		}

		if( canvas.rotate_scene ){

			canvas.animating = true
			canvas.orbit_controls ? animate_controls() : animate()

		}else{

			canvas.RENDERER.render( canvas.SCENE, canvas.CAMERA )

		}

		if( canvas.bg_color )  canvas.ele.style.background = canvas.bg_color


		// console.log('init: ', canvas )


	}





	let now// , delta//, delta_seconds
	// let then = 0

	const animate = () => {

		if( !canvas.animating ) return

		now = performance.now()
		// delta = now - then
		// delta_seconds = delta / 1000 
		canvas.RENDERER.render( canvas.SCENE, canvas.CAMERA )

		for( const child of canvas.SCENE.children ){
			if( child.userData.subject && canvas.rotate_scene ){
				if( canvas.rotate_x ) child.rotation.x += canvas.scaled_rotate
				if( canvas.rotate_y ) child.rotation.y += canvas.scaled_rotate
				if( canvas.rotate_z ) child.rotation.z += canvas.scaled_rotate
			}
		}

		requestAnimationFrame( animate )

	}


	const animate_controls = () => {
		if( !canvas.animating ) return
		now = performance.now()
		// delta = now - then
		// delta_seconds = delta / 1000 
		canvas.RENDERER.render( canvas.SCENE, canvas.CAMERA )

		for( const child of canvas.SCENE.children ){
			if( child.userData.subject && canvas.rotate_scene ){
				if( canvas.rotate_x ) child.rotation.x += canvas.scaled_rotate
				if( canvas.rotate_y ) child.rotation.y += canvas.scaled_rotate
				if( canvas.rotate_z ) child.rotation.z += canvas.scaled_rotate
			}
		}
		canvas.orbit_controls.update()
		requestAnimationFrame( animate_controls )

	}






	canvas.align = () => { // for image overlays

		if( !canvas.overlay ){
			console.log('threepress: invalid align called', this )
			return
		}
		const bounds = canvas.overlay.getBoundingClientRect()
		canvas.ele.style.top = bounds.top + 'px'
		canvas.ele.style.left = bounds.left + 'px'
		canvas.ele.style.width = bounds.width + 'px'
		canvas.ele.style.height = bounds.height + 'px'

	}


	canvas.display = target => {

		if( target ){
			canvas.ele.style.opacity = 0
			canvas.overlay.style.opacity = 1
		}else{
			canvas.ele.style.opacity = 1
			canvas.overlay.style.opacity = 0
		}

	}

	canvas.set_renderer = () => {

		canvas.CAMERA.aspect = canvas.ele.getBoundingClientRect().width / canvas.ele.getBoundingClientRect().height
		canvas.CAMERA.updateProjectionMatrix()

		canvas.RENDERER.setSize( 
			canvas.ele.getBoundingClientRect().width / resolutions[ canvas.res_key ],
			canvas.ele.getBoundingClientRect().height / resolutions[ canvas.res_key ],
			false 
		)
	}


	canvas.preview = () => {

		if( previewing ) return 
		previewing = true

		const modal = new Modal({
			type: 'gallery-preview'
		})
		const viewer = document.createElement('div')
		viewer.classList.add('threepress-viewer')
		viewer.appendChild( canvas.ele )
		modal.content.appendChild( viewer )
		canvas.init()
		modal.close.addEventListener('click', () => {
			canvas.animating = false
			previewing = false
		})
		document.querySelector('.threepress').appendChild( modal.ele )

	}

	return canvas

}






let resizing = false
window.addEventListener('resize', () => {
	if( !resizing ){
		resizing = setTimeout(() => {  // be nice to overloaded WP sites
			for( const overlay of overlays ) overlay.align()
			for( const canvas of canvases ) canvas.set_renderer()		
			clearTimeout( resizing )
			resizing = false
		}, 1000 )
	}
})


