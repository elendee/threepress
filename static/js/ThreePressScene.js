import {
	set_scalars,
	resolutions,
} from './lib.js?v=0.3.5'

import {
	// Color,
	DoubleSide,
	PlaneGeometry,
	DirectionalLight,
	SpotLight,
	WebGLRenderer,
	Scene,
	PerspectiveCamera,
	Vector3,
	Mesh,
	Raycaster,
	MeshLambertMaterial,
	// PCFSoftShadowMap,
} from '../inc/three.module.js?v=0.3.5'


const groundgeo = new PlaneGeometry( 100, 100 )
const groundmat = new MeshLambertMaterial({
	opacity: 0,
	transparent: true,
	depthTest: false,
	side: DoubleSide,
	// color: 'yellow'
})

export default function ThreePressScene( init ){

	init = init || {}

	const scene = window.scene = {}

	scene.SCENE = new Scene()
	scene.RENDERER = new WebGLRenderer({ 
		antialias: true,
		alpha: true,
	})
	// scene.RENDERER.shadowMap.enabled = true
	// scene.RENDERER.shadowMap.type = PCFSoftShadowMap
	scene.LIGHT = new DirectionalLight()
	// scene.LIGHT.position.set( 1, 1, 1 )
	// scene.LIGHT.position.set( 0, 20, 10 )
	// scene.SCENE.add( scene.LIGHT.target )
	// scene.LIGHT.target.position.set( 0, 0, 0 )
	// scene.LIGHT.castShadow = true
	// scene.LIGHT.shadow.mapSize.width = 512
	// scene.LIGHT.shadow.mapSize.height = 512
	// scene.LIGHT.shadow.camera.near = 0.5
	// scene.LIGHT.shadow.camera.far = 500
	scene.CAMERA = new PerspectiveCamera( 30, window.innerWidth / window.innerHeight, 1, scene.view )
	scene.GROUND = new Mesh( groundgeo, groundmat )
	scene.GROUND.receiveShadow = true
	scene.GROUND.rotation.x = Math.PI / 2
	scene.GROUND.userData.clickable = false

	scene.res_key = init.res_key || 1

	scene.canvas = scene.RENDERER.domElement
	scene.wrapper = document.createElement('div')
	scene.wrapper.appendChild( scene.canvas )
	scene.wrapper.classList.add('threepress-scene')

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
		}
		scene.canvas.height = scene.canvas.width / scene.aspect_ratio
		// RENDERER
		scene.set_renderer()
	}


	let now, then

	const animate = () => {

		if( !scene.animating ) return

		now = performance.now()
		// delta = now - then
		// delta_seconds = delta / 1000 
		scene.RENDERER.render( scene.SCENE, scene.CAMERA )

		// for( const child of scene.SCENE.children ){
		// 	if( child.userData.subject && scene.rotate_scene ){
		// 		if( scene.rotate_x ) child.rotation.x += scene.scaled_rotate
		// 		if( scene.rotate_y ) child.rotation.y += scene.scaled_rotate
		// 		if( scene.rotate_z ) child.rotation.z += scene.scaled_rotate
		// 	}
		// }
		// console.log('frame')

		requestAnimationFrame( animate )
	}

	scene.animate = animate



	const animate_controls = () => { // animation with controls
		if( !scene.animating ) return
		now = performance.now()
		// delta = now - then
		// delta_seconds = delta / 1000 
		scene.RENDERER.render( scene.SCENE, scene.CAMERA )

		// for( const child of scene.SCENE.children ){
		// 	if( child.userData.subject && scene.rotate_scene ){
		// 		if( scene.rotate_x ) child.rotation.x += scene.scaled_rotate
		// 		if( scene.rotate_y ) child.rotation.y += scene.scaled_rotate
		// 		if( scene.rotate_z ) child.rotation.z += scene.scaled_rotate
		// 	}
		// }
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