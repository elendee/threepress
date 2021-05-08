import {
	// Color,
	DirectionalLight,
	WebGLRenderer,
	Scene,
	PerspectiveCamera,
	Vector3,
} from '../inc/three.module.js'

import { GLTFLoader } from '../inc/GLTFLoader.js'

import {
	fill_dimensions,
} from './lib.js'



const overlays = THREEPRESS.overlays = []
const canvases = THREEPRESS.canvases = []

const resolutions = [4, 2, 1.5, 1]

const animation_types = ['static', 'rotating', 'pulsing']
const interaction_types = ['none', 'orbit_controls', 'first_person', 'third_person', 'flight']

const loader = new GLTFLoader()

const origin = new Vector3( 0, 0, 0 )








export default init => {

	init = init || {}

	const canvas = {}





	// inits
	canvas.res_key = typeof init.res_key === 'number' ? init.res_key : resolutions.length - 1

	canvas.render_type = animation_types[ typeof init.render_type === 'number' ? init.render_type : 1 ]

	canvas.view = init.view || 1000

	canvas.name = init.name

	canvas.model = init.model || canvas.model


	// state
	canvas.animating = false


	// threejs eles
	canvas.SCENE = new Scene()
	canvas.RENDERER = new WebGLRenderer({ 
		antialias: true,
		alpha: true
	})
	canvas.ele = canvas.RENDERER.domElement

	canvas.LIGHT = new DirectionalLight( 0xffffff, 1 )
	canvas.CAMERA = new PerspectiveCamera( 30, window.innerWidth / window.innerHeight, 1, canvas.view )

	canvas.SCENE.add( canvas.LIGHT )
	canvas.SCENE.add( canvas.CAMERA )

	// dom
	if( init.overlay ){
		canvas.overlay = init.overlay
		canvas.ele.classList.add('threepress-overlay')
		overlays.push( canvas )
	}






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

			canvas.CAMERA.far = radius * 10

			canvas.CAMERA.position.set( 0, radius, radius * 2.5 )
			canvas.CAMERA.lookAt( model.position )

		}

		canvas.set_renderer()

		if( canvas.render_type === 'static' ){

			canvas.RENDERER.render( canvas.SCENE, canvas.CAMERA )

		}else if( canvas.render_type === 'rotating' || canvas.render_type === 'pulsing' ){

			canvas.animating = true
			animate()

		}

	}





	let now, delta, delta_seconds
	let then = 0

	const animate = () => {

		if( !canvas.animating ) return

		now = performance.now()
		delta = now - then
		delta_seconds = delta / 1000 
		canvas.RENDERER.render( canvas.SCENE, canvas.CAMERA )

		for( const child of canvas.SCENE.children ){
			if( child.userData.subject ){
				switch( canvas.render_type ){
					case 'rotating':
						child.rotation.y += .001
						break;
					// case 'pulsing':
					// 	break;
					default: break;

				}
			}
		}

		requestAnimationFrame( animate )

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


