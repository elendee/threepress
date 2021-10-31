import init_snow from './init_snow.js?v=112'

import {
	Color,
	DirectionalLight,
	AmbientLight,
	// DirectionalLightHelper,
	// CameraHelper,
	FogExp2,
	// SpotLight,
	WebGLRenderer,
	Scene,
	PerspectiveCamera,
	Vector3,
	Raycaster,
	PlaneBufferGeometry,
    DoubleSide,
    // MeshLambertMaterial,
    MeshStandardMaterial,
    TextureLoader,
    AnimationMixer,
    AnimationClip,
    // MeshDepthMaterial,
    // RGBADepthPacking,
    Mesh,
    Group,
    // RepeatWrapping,
} from '../../inc/three.module.js?v=112'

import { OrbitControls } from '../../inc/OrbitControls.js?v=112'

import Sun from './Sun.js'

import {
	fill_dimensions,
	process_split,
	// random_hex,
	// diff,
	// sleep,
} from '../lib.js?v=112'

import { GLTFLoader } from '../../inc/GLTFLoader.js?v=112'




const ORIGIN = new Vector3()

const loader = new GLTFLoader()
const texLoader = new TextureLoader()




export default async( gallery ) => { // init_scene

	// gallery.id = gallery.id || random_hex( 6 )

	if( !gallery.validate( false, true, false ) ) return


	// window.thisgal = gallery



	// SCENE, RENDERER, RAYCASTER, CAMERA

	// lights camera action
	gallery.SCENE = gallery.SCENE || new Scene()
	gallery.RENDERER = gallery.RENDERER || new WebGLRenderer({ 
		antialias: true,
		alpha: true,
	})
	gallery.RENDERER.shadowMap.enabled = true
	// raycaster
	gallery.RAYCASTER = new Raycaster()

	gallery.CAMERA = gallery.CAMERA || new PerspectiveCamera( 
		30, 
		window.innerWidth / window.innerHeight, 
		1, 
		gallery.view
	)

	gallery.FIXTURE = new Group()
	gallery.SCENE.add( gallery.FIXTURE )

	// console.log('init Scene, Renderer: ', gallery.SCENE, gallery.RENDERER )






	gallery.canvas = gallery.RENDERER.domElement // gallery.canvas ||
	gallery.canvas.height = gallery.canvas.width * gallery.aspect_ratio

	if( gallery.bg_color ){
		gallery.canvas.style.background = gallery.bg_color
	}




















	// LIGHT

	// debugger

	if( !gallery.LIGHT ){

		if( gallery.light === 'directional' ){ // || gallery.light === 'sun'

			gallery.LIGHT = new DirectionalLight( 0xffffff, gallery.scale_intensity() )

		}else if( gallery.light === 'sun'){

			// sun stuffs...
			gallery.SUN = new Sun({
				intensity: gallery.scale_intensity(),
				has_lensflare: gallery.has_lensflare,
				light_type: 'directional'
			})
			gallery.LIGHT = gallery.SUN.light
			gallery.SCENE.add( gallery.SUN.ele )

		}

		// console.log('initializing LIGHT', gallery.LIGHT )

		// debugger

		gallery.LIGHT.castShadow = true
		// console.log('toggle light shadow')

		gallery.LIGHT.shadow.camera.near = 1;
		gallery.LIGHT.shadow.camera.far = gallery.view;

		if( gallery.LIGHT.type === 'DirectionalLight'){

			// bounds
			gallery.LIGHT.shadow.camera.left = -gallery.ground_coords.x * 15; // * 3
			gallery.LIGHT.shadow.camera.right = gallery.ground_coords.x * 15; // * 3
			gallery.LIGHT.shadow.camera.top = gallery.ground_coords.z * 15; // * 3
			gallery.LIGHT.shadow.camera.bottom = -gallery.ground_coords.z * 15; // * 3

		}

		// resolution
		gallery.LIGHT.shadow.mapSize.width = gallery.ground_coords.x * 200;
		gallery.LIGHT.shadow.mapSize.height = gallery.ground_coords.z * 200;

	}




	// FOG

	if( gallery.has_fog ){
		gallery.SCENE.fog = new FogExp2( new Color( gallery.fog_color || 0xffffff ), ( gallery.fog_density || 5 ) / 100 )
	}else{
		delete gallery.SCENE.fog
	}













	// MODEL

	let gltf

	if( gallery.model ){

		// console.log('initializing MODEL')

		if( location.href.match(/^https/) && gallery.model.guid.match(/^http:/) ){
			gallery.model.guid = gallery.model.guid.replace(/^http:/, 'https:')
		}
		
		const model = await (()=>{
			return new Promise((resolve, reject ) => {
				loader.load( gallery.model.guid, res => {
					gltf = res
					resolve( res.scene )
				}, xhr => {
					// loading progress
				}, err => {
					reject( err )
				})
			})
		})();

		// process model
		fill_dimensions( model )
		gallery.scale_model( model )

		model.userData.subject = true
		model.traverse( ele => {
			ele.castShadow = true
			if( !ele.material || ele.material.type === 'MeshBasicMaterial'){
				ele.receiveShadow = true
			}
			if( gallery.has_bloom ){
				addBloom( ele )
			}
		})

		// adjust scene to model
		gallery.FIXTURE.add( model )
		gallery.MODEL = model

		const { x, y, z } = process_split( typeof gallery.cam_pos === 'string' ? gallery.cam_pos : gallery.cam_pos.string )

		// console.log('setting ' + gallery.name + ' to ', gallery.cam_pos, gallery.CAMERA.position )

		gallery.cam_coords.x = typeof x === 'number' ? x : 0
		gallery.cam_coords.y = typeof y === 'number' ? y : 0
		gallery.cam_coords.z = typeof z === 'number' ? z : 0

		// const re_hydrate = 1 / gltf.scene.scale.length()

		gallery.CAMERA.position.set( 
			gallery.cam_coords.x, 
			gallery.cam_coords.y, 
			gallery.cam_coords.z,
		)
		.normalize()
		.multiplyScalar( Number( gallery.initial_zoom ) )


		if( gallery.SUN && gallery.MODEL ){

			gallery.SUN.ele.position.set( 
				gallery.light_coords.x,
				gallery.light_coords.y,
				gallery.light_coords.z,
			)
			.normalize()
			.multiplyScalar( 110 ) 

			if( !gallery.SUN.ele.position.length() ){
				console.log('resetting invalid sun position', gallery.name, gallery.LIGHT.position )
				gallery.SUN.ele.position.set( 150, 150, 150 )
			}

			gallery.LIGHT.position.copy( gallery.SUN.ele.position )

			// console.log('setting sun to: ', gallery.LIGHT.position )

		}else{

			gallery.LIGHT.position.copy( new Vector3( 
				gallery.light_coords.x, 
				gallery.light_coords.y, 
				gallery.light_coords.z 
			)
			.normalize()
			.multiplyScalar( 150 ) ) // gallery.max_zoom * gallery.scalar * gallery.CAM_STEP

			// console.log('setting normal light to: ', gallery.LIGHT.position )

		}

		gallery.LIGHT.target = model

		if( !gallery.LIGHT.position.isVector3 || !gallery.LIGHT.position.length() ){
			console.log('resetting invalid light position', gallery.name, gallery.LIGHT.position )
			gallery.LIGHT.position.set( 150, 150, 150 )
		}

		// console.log("set light pos", gallery.LIGHT.position )

		gallery.LIGHT.lookAt( ORIGIN )


		if( gallery.ambience && Number( gallery.ambience ) ){

			gallery.AMBIENT = new AmbientLight( gallery.ambient_color || 0xffffff, gallery.ambience / 10 )
			gallery.SCENE.add( gallery.AMBIENT )

		}

	}





	if( gallery.has_blizzard ){

		init_snow('blizzard', gallery )

	}else if( gallery.has_snow ){

		init_snow('snow', gallery )

	}








	gallery.FIXTURE.add( gallery.LIGHT )
	gallery.FIXTURE.add( gallery.CAMERA )




	// GROUND 
	
	// debugger

	if( gallery.ground_tex_guid ){

		let tex
		if( gallery.ground_tex_guid ){

			const vertices = ( gallery.ground_resolution * 64 ) || 16

			const ground_geo = new PlaneBufferGeometry( 
				Number( gallery.ground_coords.x ) * 10, 
				Number( gallery.ground_coords.z ) * 10, 
				vertices, vertices )
			// debugger

			const tex_texture = await (()=>{
				return new Promise((resolve, reject) => {
					texLoader.load( gallery.ground_tex_guid, tex => {
						resolve( tex )
					}, xhr => {
						// loading progress
					}, err => {
						reject( err )
					})	
				})
				// console.log('loaded ground tex', tex_texture)
			})();

			let map_texture
			if( gallery.ground_map_guid ){
				map_texture = await (()=>{
					return new Promise((resolve, reject) => {
						texLoader.load( gallery.ground_map_guid, tex => {
							resolve( tex )
						}, xhr => {
							// loading progress
						}, err => {
							reject( err )
						})	
					})
				})();
				// console.log('loaded ground map', map_texture)
			}

			const ground_mat = new MeshStandardMaterial({
				map: tex_texture,
				displacementMap: map_texture, // gallery.ground_map_texture,
				displacementScale: Number( gallery.ground_coords.y ),
				// displacementBias: -10,
				side: DoubleSide,
			})

			gallery.GROUND = new Mesh( ground_geo, ground_mat )
			gallery.GROUND.receiveShadow = true
			// gallery.GROUND.castShadow = true
			gallery.GROUND.rotation.x = -Math.PI / 2
			gallery.SCENE.add( gallery.GROUND )

			gallery.FIXTURE.position.set( 0, Number( gallery.float_height ) / 10, 0 )

		}

	}





	// ANIMATIONS

	if( gallery.animations.length ){

		// console.log('ya init anims', gallery.animations )

		gallery.MIXER = new AnimationMixer( gltf.scene )

		const split = gallery.animations.split(',')

		for( const anim of split ){

			const clip = AnimationClip.findByName( gltf.animations, anim )

			if( clip ){

				const action = gallery.MIXER.clipAction( clip ) // = window.action

				action.play()

			}else{
				console.log('missing anim clip', anim )
			}
		}

		// setTimeout(() => {
		// 	gallery.SCENE.remove( gltf.scene )
		// }, 2000 )

	}else{

		console.log('nope no anims')

	}





	// CONTROLS

	// debugger

	if( !gallery.controls || gallery.controls === 'none' ) {

		if( gallery.orbit_controls ) gallery.orbit_controls.dispose()
		delete gallery.orbit_controls

		if( gallery.has_snow || gallery.has_blizzard ){
			gallery.animating = false
			gallery.anim_state = true
		}

	}else if( gallery.controls === 'orbit' ){

		if( gallery.orbit_controls ) gallery.orbit_controls.dispose()
		delete gallery.orbit_controls

		gallery.orbit_controls = new OrbitControls( gallery.CAMERA, gallery.canvas )
		gallery.orbit_controls.enableDamping = true
		gallery.orbit_controls.dampingFactor = .2

		gallery.orbit_controls.minDistance = gallery.BASE_UNIT * 2
		gallery.orbit_controls.maxDistance = 100

		// implement this yourself so it doesn't jack scroll
		// ( it will preventDefault scroll events entirely otherwise )
		if( !gallery.allow_zoom ){
			gallery.orbit_controls.enableZoom = false 
		}else{
			gallery.orbit_controls.zoomSpeed = gallery.zoom_speed / 50
		}

		if( gallery.is_continuous() ){

			if( gallery.rotate_scene ){
				gallery.orbit_controls.autoRotate = true
				gallery.orbit_controls.autoRotateSpeed = gallery.rotate_speed / 10				
			}

			gallery.animating = false
			gallery.anim_state( true )

		}else{

			gallery.RENDERER.domElement.addEventListener('mouseover', e => {
				gallery.animating = false
				gallery.anim_state( true )
			})
			gallery.RENDERER.domElement.addEventListener('mouseout', e => {
				// if( !gallery.is_continuous() ) 
					gallery.animating = false
			})

		}

	}





	if( gallery.orbit_controls ){

		gallery.orbit_controls.target = gallery.FIXTURE.position

		gallery.orbit_controls.update()

	}else{

		gallery.CAMERA.lookAt( gallery.FIXTURE.position )

	}


	if( localStorage.getItem('threepress-dev-view')){
		// const helper = new DirectionalLightHelper( gallery.LIGHT, 5 );
		// const helper = new CameraHelper( gallery.LIGHT.shadow.camera );
		// gallery.SCENE.add( helper );
		// setTimeout(()=>{
			// gallery.orbit_controls.update()
			// gallery.RENDERER.render( gallery.SCENE, gallery.RENDERER )
			// gallery.anim_state( true )
		// }, 500 )
	}

	return true

}