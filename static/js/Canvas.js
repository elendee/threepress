import {
	// Color,
	DirectionalLight,
	WebGLRenderer,
	Scene,
	PerspectiveCamera,
	Vector3,
} from './three.module.js'

import { GLTFLoader } from './helpers/GLTFLoader.js'



const overlays = []
const canvases = window.canvases = []

const resolutions = [4, 2, 1.5, 1]
const animation_types = ['static', 'interactive', 'animated']

const loader = new GLTFLoader()

const origin = new Vector3( 0, 0, 0 )




export default init => {

	init = init || {}

	const canvas = {}





	// inits
	canvas.res_key = typeof init.res_key === 'number' ? init.res_key : resolutions.length - 1

	canvas.render_type = animation_types[ typeof init.render_type === 'number' ? init.render_type : 2 ]

	canvas.view = init.view || 1000

	// state
	canvas.animating = false


	// threejs eles
	canvas.SCENE = new Scene()
	canvas.RENDERER = new WebGLRenderer({ 
		antialias: true,
		alpha: true
	})
	canvas.ele = canvas.RENDERER.domElement

	canvas.LIGHT = new DirectionalLight(0xffffff, 1)
	canvas.CAMERA = new PerspectiveCamera( 30, window.innerWidth / window.innerHeight, 1, canvas.view )

	canvas.SCENE.add( canvas.LIGHT )
	canvas.SCENE.add( canvas.CAMERA )

	canvas.CAMERA.position.set( 120, 120, 20 )
	canvas.CAMERA.lookAt( origin )

	if( init.overlay ){
		canvas.overlay = init.overlay
		canvas.ele.classList.add('threepress-overlay')
		overlays.push( canvas )
	}







	let now, delta, delta_seconds
	let then = 0

	// private methods
	const animate = () => {

		if( !canvas.animating ) return

		now = performance.now()
		delta = now - then
		delta_seconds = delta / 1000 
		canvas.RENDERER.render( canvas.SCENE, canvas.CAMERA )
		canvas.CAMERA.position.x += 5 * Math.sin( delta_seconds )
		canvas.CAMERA.position.z += 5 * Math.sin( delta_seconds )
		canvas.CAMERA.lookAt( origin )

		requestAnimationFrame( animate )

	}






	// public methods
	canvas.init = async( init ) => { // lights camera action

		init = init || {}

		if( !canvases.includes( canvas )) canvases.push( canvas )

		canvas.model = init.model_data

		if( canvas.model ){
			const m = canvas.model
			const model = await (()=>{
				return new Promise((resolve, reject ) => {
					loader.load( m.guid, res => {
						resolve( res.scene )
					}, xhr => {
						// loading time
					}, err => {
						reject( err )
					})
				})
			})();
			console.log( model )
			canvas.SCENE.add( model )
		}

		// canvas.then = performance.now()
		if( canvas.render_type === 'static' ){
			// canvas.RENDERER.render( canvas.SCENE, canvas.CAMERA )
		}else if( canvas.render_type === 'interactive'){
			// console.log( this )
			canvas.RENDERER.render( canvas.SCENE, canvas.CAMERA )
		}else if( canvas.render_type === 'animated'){
			animate()
		}

	}


	canvas.align = () => { // for ovlerays

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

	// set_renderer(){
	// 	canvas.RENDERER.setSize( 
	// 		window.innerWidth / resolutions[ canvas.res_key ], 
	// 		window.innerHeight / resolutions[ canvas.res_key ], 
	// 		false 
	// 	)
	// }

	// onWindowResize(){

	// 	canvas.CAMERA.aspect = window.innerWidth / window.innerHeight
	// 	canvas.CAMERA.updateProjectionMatrix()

	// 	canvas.set_renderer()

	// }

	return canvas

}






window.addEventListener('resize', () => {
	for( const overlay of overlays ) overlay.align()
})


