import {
	set_scalars,
	resolutions,
} from './lib.js?v=0.4.0'

import {
	DoubleSide,
	PlaneGeometry,
	DirectionalLight,
	// SpotLight,
	// PointLight,
	WebGLRenderer,
	Scene,
	PerspectiveCamera,
	// Vector3,
	Mesh,
	Raycaster,
	MeshLambertMaterial,
} from '../inc/three.module.js'


const groundgeo = new PlaneGeometry( 100, 100 )
const groundmat = new MeshLambertMaterial({
	opacity: 0,
	transparent: true,
	depthTest: false,
	side: DoubleSide,
})

const scenes = window.scenes = []

export default function ThreePressScene( init ){

	init = init || {}

	const scene = {}
	window.scenes.push( scene )

	scene.type = init.type

	scene.SCENE = new Scene()
	scene.RENDERER = new WebGLRenderer({ 
		antialias: true,
		alpha: true,
	})
	scene.LIGHT = new DirectionalLight()
	scene.CAMERA = new PerspectiveCamera( 30, window.innerWidth / window.innerHeight, 1, scene.view )
	scene.GROUND = new Mesh( groundgeo, groundmat )
	scene.GROUND.receiveShadow = true
	scene.GROUND.rotation.x = Math.PI / 2
	scene.GROUND.userData.clickable = false

	scene.res_key = init.res_key || 1

	scene.canvas = scene.RENDERER.domElement
	scene.wrapper = document.createElement('div')
	scene.wrapper.appendChild( scene.canvas )
	scene.wrapper.classList.add('threepress-scene', 'threepress-' + scene.type + '-canvas')

	scene.fullscreen = true

	set_scalars( scene )

	// scene.canvas.style.border = '10px solid pink'

	scene.initialize = () => {
		scene.SCENE.add( scene.CAMERA )
		scene.CAMERA.position.set( 0, 100, 0 )
		scene.CAMERA.lookAt( 0, 0, 0 )
		scene.SCENE.add( scene.LIGHT )
		scene.SCENE.add( scene.GROUND )
	}

	scene.set_renderer = () => {

		const bound = scene.canvas.getBoundingClientRect()

		scene.CAMERA.aspect = bound.width / bound.height
		scene.CAMERA.updateProjectionMatrix()

		scene.RENDERER.setSize( 
			bound.width / resolutions[ scene.res_key ],
			bound.height / resolutions[ scene.res_key ],
			false 
		)
	}

	scene.fit = () => {
		// DOM
		if( scene.fullscreen ){
			scene.aspect_ratio = window.innerWidth / window.innerHeight 
		}else{
			const bounds = scene.getBoundingClientRect()
			scene.aspect_ratio = bounds.width / bounds.height
		}
		scene.canvas.height = scene.canvas.width / scene.aspect_ratio
		// RENDERER
		scene.set_renderer()
	}


	// let now, then

	const animate = () => {

		if( !scene.animating ) return

		// now = performance.now()
		// delta = now - then
		// delta_seconds = delta / 1000 
		scene.RENDERER.render( scene.SCENE, scene.CAMERA )

		requestAnimationFrame( animate )
	}

	scene.animate = animate



	const animate_controls = () => { // animation with controls
		if( !scene.animating ) return
		// now = performance.now()
		// delta = now - then
		// delta_seconds = delta / 1000 
		scene.RENDERER.render( scene.SCENE, scene.CAMERA )

		scene.orbit_controls.update()
		requestAnimationFrame( animate_controls )

	}

	scene.animate_controls = animate_controls


	let domX, domY
	scene.get_intersects = ( e, testers ) => {

		if( !scene.RAYCASTER ) scene.RAYCASTER	= new Raycaster()
		
		domX = ( e.clientX / scene.canvas.clientWidth ) * 2 - 1
		domY =  - ( e.clientY / scene.canvas.clientHeight ) * 2 + 1

		scene.RAYCASTER.setFromCamera({
			x: domX, 
			y: domY,
		}, scene.CAMERA )

		testers = testers || scene.SCENE.children

		const intersects = scene.RAYCASTER.intersectObjects( testers, true ) // [ objects ], recursive (children) (ok to turn on if needed)

		return intersects 

	}


	return scene

}