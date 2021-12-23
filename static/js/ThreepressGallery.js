// ___adding a field:
// add to build_form
// add to shortcode_values
// add to class
// add to ingest_form
// add to hydrate_form
// add to init_scene


import * as composer from '../inc/composer/ComposerSelectiveBloom.js?v=112'

import {
	Scene,
} from '../inc/three.module.js?v=112'
import {
	GLTFLoader,
} from '../inc/GLTFLoader.js?v=112'

import {
	media_selector,
	fetch_wrap,
	ModelRow,
	ImageRow,
	set_contingents,
	hal,
	spinner,
	val_boolean,
	// origin,
	resolutions,
	process_split,
	build_option,
	validate_number,
	random_hex,
	// require_length,
} from './lib.js?v=112'

import { Modal } from './helpers/Modal.js?v=112'

import init_scene from './helpers/init_scene.js?v=112'

// import { HDRCubeTextureLoader } from '../inc/HDRCubeTextureLoader.js?v=112';







//////////////////////////////////////////////////////////////////////////////////////////



const stack_settings = {
	// logging: true,
	// debugging: true,
}
const stack_debug = gallery => {
	if( !gallery ) return false
	if( gallery.name.match(/ultak/) && !gallery.ground_dimensions && 0 ){
		console.log( gallery )
		return true
	}
	return false
}
const stack = ( msg, caller, gallery ) => {
	if( stack_settings.logging ){
		console.log( 'stack: ', msg, caller )
	}
	if( stack_settings.debugging ){
		debugger
	}
	if( stack_debug( gallery ) ){
		console.log('debug not set')
		// debugger
	}
}


const overlays = THREEPRESS.overlays = []
const galleries = THREEPRESS.galleries = []

let previewing = false


const tag = ( key , value ) => { 
	const s = key === 'name' ? String( value ).replace(/ /g, '__') : String( value ).replace(/ /g, '')
	return value ? `${ key }=${ s } ` : '' 
}


const shortcode_values = [
	'name',

	'ground_dimensions',
	'ground_resolution',

	'controls',

	'light',
	'intensity',
	'ambience',
	'ambient_color',

	'cam_pos',
	'initial_zoom',
	'allow_zoom',

	'light_pos',
	'has_lensflare',

	'zoom_speed',

	'rotate_scene',
	'rotate_speed',

	'float_height',
	'bg_color',

	'has_bloom',
	'bloom_threshold',
	'bloom_strength',

	'has_snow',
	'has_blizzard',

	'show_hdr',

	'hdr_courtyard',
	'hdr_castle', 
	'hdr_galaxy', 
	'hdr_bridge', 
	'hdr_park', 

	'has_fog',
	'fog_density',
	'fog_color',

	'animations',
]


// window.thisgal = false



export default init => {

	init = init || {}

	// const gallery = THREEPRESS.last_gallery_data = {}
	const gallery = {}

	// window.thisgal = gallery

	// db
	gallery.id = init.id 
	gallery.author_key = init.author_key
	gallery.name = init.name || 'new gallery'
	gallery.shortcode = init.shortcode || ''
	gallery.created = init.created
	gallery.edited = init.edited
	
	// data
	gallery.model = init.model || {}
	gallery.location = init.location
	// setTimeout(() => {
	// 	console.log('THREEPRESS Gallery, location: ', gallery.location)
	// }, 50)

	gallery.hash = init.hash || random_hex(6)
	// console.log('###', gallery.hash , '###')

	// rendering
	gallery.GROUND = init.GROUND // PlaneBuffer
	gallery.ground_map_id = init.ground_map_id
	gallery.ground_map_guid = init.ground_map_guid
	gallery.ground_tex_id = init.ground_tex_id
	gallery.ground_tex_guid = init.ground_tex_guid
	gallery.ground_resolution = init.ground_resolution || 0

	gallery.animations = init.animations || ''

	gallery.form = init.form || gallery.form
	gallery.controls = init.controls
	gallery.allow_zoom = val_boolean( init.allow_zoom, false )
	gallery.has_bloom = val_boolean( init.has_bloom, false )
	gallery.has_snow = val_boolean( init.has_snow, false )
	gallery.has_blizzard = val_boolean( init.has_blizzard, false )

	gallery.has_lensflare = val_boolean( init.has_lensflare, false )
	gallery.bloom_strength = init.bloom_strength || 0
	gallery.bloom_threshold = init.bloom_threshold || 0
	gallery.float_height = init.float_height || 0
	gallery.zoom_speed = init.zoom_speed || 20
	gallery.rotate_scene = val_boolean( init.rotate_scene, false )
	gallery.rotate_speed = init.rotate_speed || 5
	gallery.bg_color = init.bg_color  || 'linear-gradient(45deg,white,transparent)'

	gallery.BASE_UNIT = 1

	gallery.initial_zoom = Math.min( 10, Math.max( 0, Number( init.initial_zoom ) || 3 ) )

	gallery.cam_pos = init.cam_pos || gallery.cam_pos
	gallery.cam_coords = process_split( gallery.cam_pos )

	gallery.light_pos = init.light_pos || gallery.light_pos
	gallery.light_coords = process_split( gallery.light_pos )

	gallery.hdr_courtyard = val_boolean( init.hdr_courtyard, false )
	gallery.hdr_castle = val_boolean( init.hdr_castle, false )
	gallery.hdr_galaxy = val_boolean( init.hdr_galaxy, false )
	gallery.hdr_bridge = val_boolean( init.hdr_bridge, false )
	gallery.hdr_park = val_boolean( init.hdr_park, false )
	gallery.show_hdr = val_boolean( init.show_hdr, false )

	gallery.ground_dimensions = init.ground_dimensions || gallery.ground_dimensions
	gallery.ground_coords = process_split( gallery.ground_dimensions )

	gallery.view = init.view  || 30000
	gallery.intensity = init.intensity  || 5
	gallery.light = init.light  || 'directional'
	gallery.ambience = init.ambience || 2
	gallery.ambient_color = init.ambient_color || '#ffffff'
	gallery.overlay = init.overlay
	gallery.aspect_ratio = init.aspect_ratio  || .7

	gallery.preview_type = init.preview_type
	gallery.model_row = init.model_row // used for model-section previews, not normal galleries

	// calculated
	gallery.res_key = typeof init.res_key === 'number' ? init.res_key : resolutions.length - 1

	// state
	gallery.animating = false

	// threejs eles
	gallery.MODEL = init.MODEL

	// dom
	if( gallery.overlay ){
		gallery.canvas.classList.add('threepress-overlay')
		overlays.push( gallery )
	}






	const start_animation = () => { // single frame updates

		if( gallery.animating ) return 

		gallery.animating = true
		gallery.orbit_controls ? animate_controls() : animate()
	}

	const stop_animation = (e, override) => {

		if( override || !gallery.rotate_scene ){
			gallery.animating = false
		}
	}

	gallery.anim_state = state => { // state

		if( state ){
			start_animation()
		}else{
			stop_animation()
		}
	}

	let now = 0
	let delta = 0
	let then = 0

	const animate = () => { // no controls gallery

		if( !gallery.animating ) return

		// console.log('animate')

		now = performance.now()
		delta = now - then
		then = now

		// bloom
		if( gallery.has_bloom ){
			composer.composeAnimate( gallery.SCENE )
		}else{
			gallery.RENDERER.render( gallery.SCENE, gallery.CAMERA )
		}

		// snow
		if( gallery.has_blizzard ){
			for( const gust of gallery.gusts ) gust.update( delta )
		}else if( gallery.has_snow ){
			for( const flake of gallery.flakes ) flake.update( delta )
		}

		// rotation
		if( gallery.controls !== 'none' && gallery.rotate_scene ){
			gallery.CAMERA.position.x = Math.sin( performance.now() / 20000 * gallery.rotate_speed )
			gallery.CAMERA.position.z = Math.cos( performance.now() / 20000 * gallery.rotate_speed )
		}

		if( gallery.rotate_scene && gallery.subject && gallery.subject.position && gallery.subject.position.isVector3 ){
			gallery.CAMERA.lookAt( gallery.subject.position )
		}

		// animations
		if( gallery.MIXER ) gallery.MIXER.update( delta / 1000 )

		requestAnimationFrame( animate )

	}

	const animate_controls = () => { // scene has orbit_controls

		if( !gallery.animating || !gallery.orbit_controls ){
			// console.log('animate_controls off')
			return
		}

		// console.log('animate c')

		now = performance.now()
		delta = now - then
		then = now

		gallery.orbit_controls.update()

		// bloom
		if( gallery.has_bloom ){
			composer.composeAnimate( gallery.SCENE )
		}else{
			gallery.RENDERER.render( gallery.SCENE, gallery.CAMERA )
		}

		// snow
		if( gallery.has_blizzard ){
			for( const gust of gallery.gusts ) gust.update( delta )
		}else if( gallery.has_snow ){
			for( const flake of gallery.flakes ) flake.update( delta )
		}

		// animations
		if( gallery.MIXER ) gallery.MIXER.update( delta / 1000 )

		// corrections
		if( gallery.ground_tex_guid ){
			// if( gallery.CAMERA.position.y < gallery.cam_bottom ) gallery.CAMERA.position.y = gallery.cam_bottom
		}

		requestAnimationFrame( animate_controls )

	}



	gallery.get_subject = () => {
		return gallery.MODEL
		// for( const model of gallery.MODELS ){
		// 	if( model.userData && model.userData.subject ) return model
		// }
	}


	gallery.scale_model = model => {

		if( typeof model.userData.radius !== 'number' ){
			console.log('model cannot be scaled yet')
			return
		}

		const scale = gallery.BASE_UNIT / model.userData.radius

		model.scale.set( scale, scale, scale )

	}




	gallery.clear_scene = () => {

		if( !gallery.SCENE ){
			gallery.SCENE = new Scene()
			return
		}

		if( gallery.SUN ) gallery.SUN.lensflare.dispose()

		let cap = 0
		while( gallery.SCENE.children.length > 0 && cap < 1999999 ){ 
			if( gallery.SCENE.children[0].material ) gallery.SCENE.children[0].material.dispose()
			if( gallery.SCENE.children[0].geometry ) gallery.SCENE.children[0].geometry.dispose()
		    gallery.SCENE.remove( gallery.SCENE.children[0] )
			console.log('clear scene child')
		    cap++
		}

		// if( gallery.AMBIENT ) gallery.SCENE.remove( gallery.AMBIENT )
		gallery.RENDERER.domElement.style.background = 'transparent'

		delete gallery.MIXER
		delete gallery.LIGHT
		delete gallery.AMBIENT
		delete gallery.SUN
		delete gallery.CAMERA

	}



	gallery.render_animation_boxes = gltf => {

		if( gallery.preview_type === 'model' ) return true

		// hold user choices in anim_split:
		const anim_split = gallery.animations.split(',')
		// console.log('anim_split: ', anim_split )
		// clear empty entries
		for( let i = anim_split.length - 1; i >= 0; i-- ) if( !anim_split[i] ) anim_split.splice( i, 1 )
		// clear for rebuild from 
		gallery.animations = ''
		const clips = gallery.form.querySelector('#anim-clips')
		clips.innerHTML = ''

		// render boxes with checks / no checks
		if( gltf.animations.length ){

			for( const anim of gltf.animations ){

				// make box
				const box = build_option( 'checkbox', anim.name, false,  ( anim.name || 'animation' ).substr( 0, 10 ) + ': ' )
				const input = box.querySelector('input')
				input.classList.add('animation-checkbox')
				input.addEventListener('change', () => {
					gallery.render_shortcode()
				})
				gallery.form.querySelector('#anim-clips').appendChild( box )
				// check boxes
				if( anim_split.includes( anim.name.replace(/ /g, '%%') ) ){
					input.checked = true
				}

			}

		}

		gallery.animations = anim_split.join(',')

		// console.log('anims now: ', gallery.animations)

	}



	gallery.fill_model_from_form = async() => {
		stack('fill_model_from_form', null, gallery )
		gallery.model = gallery.model || {}
		let mc = gallery.form.querySelector('#model-choice .threepress-row')
		if( gallery.preview_type === 'model' ){
			mc = gallery.model_row
		}
		if( mc ){
			gallery.model.guid = mc.querySelector('.url input').value.trim()
			gallery.model.id = mc.getAttribute('data-id')
		}else{
			delete gallery.model.guid
			delete gallery.model.id
		}

		gallery.last_model_fill = gallery.last_model_fill || ''

		if( gallery.model.guid && gallery.model.guid === gallery.last_model_fill ){
			// console.log('already got model; abort fill_model_from_form ')
			return
		}

		// console.log('querying model')

		if( !gallery.model.guid ) return

		const loader = new GLTFLoader()

		const gltf = await new Promise((resolve, reject) => {
			loader.load( gallery.model.guid, ( gltf, err ) => {
				if( err ){
					console.log( err )
					reject( err )
				}else{
					resolve( gltf )
				}
			})
		})

		if( !gltf ){
			console.log('failed to load gltf')
			return
		}
		if( gallery.last_model_fill === gallery.model.guid ){
			console.log('loaded model; already have post-processed though')
			return
		}

		console.log('post-processing model')

		// clear existing
		const clips = gallery.form.querySelector('#anim-clips')
		if( clips ) clips.innerHTML = ''

		// prevent double loads
		gallery.last_model_fill = gallery.model.guid

		if( typeof gallery.animations !== 'string' ){
			console.log('invalid gallery animations')
			return
		}

		gallery.render_animation_boxes( gltf )

		// console.log( gallery.model ) //, loader
	}





	gallery.fill_ground_tex_from_form = () => {
		stack('fill ground tex from form', null, gallery )
		const gt = gallery.form.querySelector('#ground-choice .threepress-row')
		if( gt ){
			gallery.ground_tex_guid = gt.querySelector('.url input').value.trim()
			gallery.ground_tex_id = gt.getAttribute('data-id')
			// gallery.ground_tex_texture = texLoader.load( gallery.ground_tex_guid )
		}else{
			delete gallery.ground_tex_guid
			delete gallery.ground_tex_id
		}

	}

	gallery.fill_ground_map_from_form = () => {
		stack('fill ground map from form', null, gallery )
		const gt = gallery.form.querySelector('#ground-choice-map .threepress-row')
		if( gt ){
			gallery.ground_map_guid = gt.querySelector('.url input').value.trim()
			gallery.ground_map_id = gt.getAttribute('data-id')
			// gallery.ground_map_texture = texLoader.load( gallery.ground_map_guid )
		}else{
			delete gallery.ground_map_guid
			delete gallery.ground_map_id
		}

	}




	gallery.validate = ( pop_errors, log_errors, save ) => {

		const invalidations = []

		// model
		if( !gallery.model ) invalidations.push('missing model')
		if( save ){ // shortcode needs model.id
			if( isNaN( gallery.model.id ) ) invalidations.push('invalid model id')
		}else{ // display needs model.guid
			if( !gallery.model.guid || !gallery.model.guid.match(/\.glb/) ) invalidations.push('invalid model - must be glb format ' + gallery.model.guid )	
		}

		// NaN's
		if( gallery.rotate_scene ){
			if( isNaN( gallery.rotate_speed ) ) invalidations.push('invalid rotation speed')
		}

		if( invalidations.length ){
			for( const msg of invalidations ){
				if( pop_errors ) hal('error', msg, 8000 )
				if( log_errors ) console.log( msg )
			}
			return false
		}

		return true

	}




	gallery.gen_shortcode = async( caller, skip_ajax ) => {
		stack( 'gen_shortcode', caller, gallery )

		let shortcodes = ''
		for( const key of shortcode_values ){
			shortcodes += tag( key, gallery[ key ] )
		}

		if( !skip_ajax ) await gallery.fill_form_assets()

		if( gallery.model.id ) shortcodes += 'model_id=' + gallery.model.id + ' '
		if( gallery.ground_tex_id ) shortcodes += 'ground_tex_id=' + gallery.ground_tex_id + ' '
		if( gallery.ground_map_id ) shortcodes += 'ground_map_id=' + gallery.ground_map_id + ' '

		if( shortcodes ){
			gallery.shortcode = '[threepress ' + shortcodes + ']'
			// console.log('wait what', gallery.shortcode )
			gallery.shortcode = gallery.shortcode.replace(/ \]/g, ']')
			// console.log('wait what', gallery.shortcode )
			return gallery.shortcode
		}

		return ''

	}




	gallery.fill_form_assets = async( caller ) => {
		stack('fill_form_assets', caller, gallery )

		// chosen model
		await gallery.fill_model_from_form()

		// chosen ground_tex
		gallery.fill_ground_tex_from_form()

		// chosen ground_tex
		gallery.fill_ground_map_from_form()

	}


	
	gallery.ingest_form = async( form, caller ) => {
		stack( 'ingest_form', caller, gallery )

		form = form || gallery.form

		// gallery name
		if( gallery.preview_type === 'model' ){
			gallery.name = 'model preview'
		}else{
			gallery.name = form.querySelector('input[name=gallery_name]').value.trim().replace(/ /g, '___')
		}

		// model and ground assets
		await gallery.fill_form_assets('ingest_form') 

		if( gallery.preview_type === 'model' ) return true

		// ground dimensions
		gallery.ground_dimensions = form.querySelector('.ground-dimensions .readout').value
		gallery.ground_coords = process_split( gallery.ground_dimensions )
		if( typeof gallery.ground_coords.x !== 'number' ) console.log('failed to ingest valid ground_pos', gallery.ground_dimensions )

		// float
		gallery.float_height = Number( form.querySelector('input[name=float_height]').value )
		gallery.cam_bottom = -gallery.float_height / 10

		// ground res
		gallery.ground_resolution = Number( form.querySelector('input[name=ground_resolution]').value )

		// radios: controls & light
		const radios = {
			controls: form.querySelectorAll('input[name=options_controls]'),
			light: form.querySelectorAll('input[name=options_light]'),
		}
		for( const opt of radios.controls ) if( opt.checked ) gallery.controls = opt.value
		for( const opt of radios.light ) if( opt.checked ) gallery.light = opt.value
		gallery.intensity = form.querySelector('input[name=intensity]').value

		// cam pos
		gallery.cam_pos = form.querySelector('.cam-position .readout').value
		gallery.cam_coords = process_split( gallery.cam_pos )
		if( typeof gallery.cam_coords.x !== 'number' ) console.log('failed to ingest valid cam_pos')

		// light pos
		gallery.light_pos = form.querySelector('.light-position .readout').value
		gallery.light_coords = process_split( gallery.light_pos )
		if( typeof gallery.light_coords.x !== 'number' ) console.log('failed to ingest valid light_pos')

		// ambient light
		gallery.ambience = form.querySelector('.ambience input[type=range]').value
		gallery.ambient_color = form.querySelector('.ambience input[type=color]').value

		// hdr
		gallery.hdr_courtyard = form.querySelector('input[name=hdr_courtyard]').checked
		gallery.hdr_castle = form.querySelector('input[name=hdr_castle]').checked
		gallery.hdr_galaxy = form.querySelector('input[name=hdr_galaxy]').checked
		gallery.hdr_bridge = form.querySelector('input[name=hdr_bridge]').checked
		gallery.hdr_park = form.querySelector('input[name=hdr_park]').checked

		gallery.show_hdr = form.querySelector('input[name=show_hdr]').checked

		// lensflare
		gallery.has_lensflare = form.querySelector('input[name=has_lensflare]').checked


		// bg color
		gallery.bg_color = form.querySelector('input[name=bg_color]').value.replace(/ /g, '')

		// allow_zoom 
		gallery.allow_zoom = form.querySelector('input[name=allow_zoom]').checked
		// zoom speed
		gallery.zoom_speed = form.querySelector('input[name=zoom_speed]').value
		// initial_zoom
		gallery.initial_zoom = form.querySelector('input[name=initial_zoom]').value

		// camera

		// rotation
		gallery.rotate_scene = form.querySelector('input[name=rotate_scene]').checked
		if( gallery.rotate_scene ){
			gallery.rotate_speed = form.querySelector('input[name=rotate_speed]').value
		}else{
			gallery.rotate_speed = undefined
		}

		// bloom
		gallery.has_bloom = form.querySelector('input[name=has_bloom]').checked
		gallery.bloom_threshold = form.querySelector('input[name=bloom_threshold]').value
		gallery.bloom_strength = form.querySelector('input[name=bloom_strength]').value

		// snow
		gallery.has_snow = form.querySelector('input[name=has_snow]').checked

		// blizzard
		gallery.has_blizzard = form.querySelector('input[name=has_blizzard').checked

		// fog
		gallery.has_fog = form.querySelector('input[name=has_fog]').checked
		gallery.fog_density = form.querySelector('input[name=fog_density]').value
		gallery.fog_color = form.querySelector('input[name=fog_color]').value

		// animations
		gallery.animations = ''
		const clips = form.querySelector('#anim-clips')
		const inputs = clips.querySelectorAll('input[type=checkbox]')
		const anims = []
		for( const input of inputs ){
			if( input.checked ){
				anims.push( input.name.replace(/ /g, '%%') )
			}
		}
		if( anims.length ) gallery.animations = anims.join(',')

	} // ingest_form





	// gallery.convert_arraykeys_to_shortcode = arraykeys => {
	// }





	gallery.ingest_shortcode = ( shortcode, caller ) => {
		stack( 'ingest_shortcode', caller, gallery )

		const dims = {
			'cam_pos': 'cam_coords',
			'light_pos': 'light_coords',
			'ground_dimensions': 'ground_coords',
		}

		const arr = shortcode.replace(']', '').split(' ')

		if( !arr[0].match(/\[ ?threepress/) ){
			console.log( 'invalid: ' , shortcode )
			hal('error', 'invalid shortcode', 4000 )
			return false
		}

		arr.splice(0, 1) // "[threepress"

		const escrow = {}

		let invalid = false
		let split
		for( const val of arr ){
			if( val && !val.match(/.*=.*/) ){
				invalid = true
				continue
			}
			split = val.split('=')
			if( split[0] === 'model_id' ){
				gallery.model.id = split[1]
			}else if( split[0] === 'ground_tex_id'){
				gallery.ground_tex_id = split[1]
			}else if( split[0] === 'ground_map_id'){
				gallery.ground_map_id = split[1]
			}else if( !shortcode_values.includes( split[0] )){
				if( split[0] ){
					console.log('invalid shortcode value', split[0], arr )
				}
			}else if( Object.keys( dims ).includes( split[0] ) ){
				const key = split[0]
				const value = split[1]
				const result = process_split( value )
				// console.log('processing', key, value, result )
				escrow[ key ] = value
				escrow[ dims[ key ] ] = result
				// if( split[0] === 'ground_dimensions' && gallery.name.match(/ult/) ) {
				// 	console.log('hallelujan praise the lord', escrow.ground_coords, gallery.ground_dimensions, shortcode, key, value )
				// }
				// console.log('processed', escrow[ dims[ key ]] )

			}else{
				escrow[ split[0] ] = split[1].replace(/___/g, ' ').replace(/%%/g, ' ')
			}
			// console.log('arr val: ', val )
		}

		if( invalid ){
			for( const val of arr ){
				if( val && !val.match(/.*=.*/) ){
					hal('error', 'invalid shortcode value found: ' + val, 5000 )
				}
			}
		}

		for( const key in escrow ){
			// console.log('ingest shortcode: ', key, escrow[ key ])
			gallery[ key ] = escrow[ key ]
		}

		// if( gallery.name.match(/ult/) ) console.log('wtfff', gallery.ground_coords, gallery.ground_dimensions )

		// console.log( escrow.initial_zoom, gallery.initial_zoom )

		if( !gallery.rotate_scene ) delete gallery.orbit_controls

		gallery.shortcode = shortcode

		return arr

	}



	gallery.render_shortcode = async( caller, data_only ) => {

		stack('render shortcode', caller, gallery )

		if( !data_only ) await gallery.ingest_form( null, 'render_shortcode' )

		await gallery.gen_shortcode('render_shortcode' )

		gallery.form.querySelector('#shortcode').value = gallery.shortcode

		return gallery.shortcode

	}




	gallery.ingest_data = data => { // used for threepress-woo
		stack( 'ingest_data', 'ingest_data', gallery )

		// if( data.post_id ) gallery.model.id = Number( data.post_id )
		if( data.post_id ) gallery.model.id = Number( data.ID )
		if( data.guid ) gallery.model.guid = data.guid

	}




	gallery.hydrate_form = async( form, shortcode, shortcode_id, caller ) => {
		stack( 'hydrate_form', caller, gallery )

		const is_new = !shortcode_id 

		// validate
		if( shortcode ){
			gallery.ingest_shortcode( shortcode, 'hydrate' )
		}

		// name
		const name = gallery.name.replace(/%/g, ' ')
		form.querySelector('input[name=gallery_name]').value = name

		// hydrate model
		const model_choice = ( form || gallery.form ).querySelector('#model-choice')
		model_choice.innerHTML = ''			

		if( !is_new ){

			const res = await fetch_wrap( ajaxurl, 'post', {
				action: 'threepress_get_model',
				id: gallery.model.id,
			})
			if( !res || !res.success ){
				// console.log( 'get model res: ', res )
			}else{
				const model = res.model
				const new_model = new ModelRow( model )
				new_model.form = form || gallery.form

				model_choice.appendChild( new_model.gen_row() )

				await new Promise(( resolve, reject ) => {

					const loader = new GLTFLoader()
					loader.load( model.guid, ( gltf, err ) => {
						if( err ){
							console.log( err )
							reject()
						}else{
							gallery.render_animation_boxes( gltf )
							resolve()
						}
					})

				})

				// need to render inital checkboxes here too

			}

		}

		// hydrate ground texture
		const ground_tex_ele = ( form || gallery.form ).querySelector('#ground-choice')
		ground_tex_ele.innerHTML = ''
		if( !is_new ){
			const res = await fetch_wrap( ajaxurl, 'post', {
				action: 'threepress_get_image',
				id: gallery.ground_tex_id,
			})
			if( !res || !res.success ){
				// console.log( 'get ground res: ', res  )
			}else{
				const image = res.image
				const new_image = new ImageRow( image )

				// new_image.form = form || gallery.form
				ground_tex_ele.appendChild( new_image.gen_row() )				
			}
		}

		// hydrate ground map
		const ground_tex_map = ( form || gallery.form ).querySelector('#ground-choice-map')
		ground_tex_map.innerHTML = ''
		if( !is_new ){
			const res = await fetch_wrap( ajaxurl, 'post', {
				action: 'threepress_get_image',
				id: gallery.ground_map_id,
			})
			if( !res || !res.success ){
				// console.log( 'get tex map: ', res )
			}else{
				const image = res.image
				const new_image = new ImageRow( image )
				// new_image.form = form || gallery.form

				ground_tex_map.appendChild( new_image.gen_row() )				
			}
		}

		// controls
		for( const option of form.querySelectorAll('input[name=options_controls]')){
			if( option.value === gallery.controls ) option.checked = true
		}

		// require_length( gallery.cam_pos )
		// require_length( gallery.light_pos )
		// require_length( gallery.ground_dimensions )

		// camera position
		form.querySelector('.cam-position input[name=x]').value = validate_number( gallery.cam_coords.x, 1 )
		form.querySelector('.cam-position input[name=y]').value = validate_number( gallery.cam_coords.y, 1 )
		form.querySelector('.cam-position input[name=z]').value = validate_number( gallery.cam_coords.z, 1 )
		form.querySelector('.cam-position .readout').value = gallery.cam_pos || ''
		
		// light position 
		form.querySelector('.light-position input[name=x]').value = validate_number( gallery.light_coords.x, 1 )
		form.querySelector('.light-position input[name=y]').value = validate_number( gallery.light_coords.y, 1 )
		form.querySelector('.light-position input[name=z]').value = validate_number( gallery.light_coords.z, 1 )
		form.querySelector('.light-position .readout').value = gallery.light_pos || ''

		// ground dimensions
		form.querySelector('.ground-dimensions input[name=x]').value = validate_number( gallery.ground_coords.x, 1 )
		form.querySelector('.ground-dimensions input[name=y]').value = validate_number( gallery.ground_coords.y, 1 )
		form.querySelector('.ground-dimensions input[name=z]').value = validate_number( gallery.ground_coords.z, 1 )
		form.querySelector('.ground-dimensions .readout').value = gallery.ground_dimensions || ''

		// allow zoom
		const allow_zoom = form.querySelector('input[name=allow_zoom]')
		allow_zoom.checked = gallery.allow_zoom ? true : false

		// ground resolution
		const ground_res_input = form.querySelector('input[name=ground_resolution]')
		ground_res_input.value = gallery.ground_resolution

		// zoom speed
		const zoom_speed = form.querySelector('input[name=zoom_speed]')
		zoom_speed.value = gallery.zoom_speed

		const initial_zoom = form.querySelector('input[name=initial_zoom]')
		initial_zoom.value = gallery.initial_zoom

		// light
		for( const option of form.querySelectorAll('input[name=options_light]')){
			if( option.value === gallery.light ) option.checked = true
		}
		// light intensity
		form.querySelector('input[name=intensity]').value = gallery.intensity

		// ambient intensity
		form.querySelector('.ambience input[type=range]').value = gallery.ambience
		form.querySelector('.ambience input[type=color]').value = gallery.ambient_color

		// hdr
		const hdr_courtyard = form.querySelector('input[name=hdr_courtyard]')
		hdr_courtyard.checked = gallery.hdr_courtyard
		const hdr_castle = form.querySelector('input[name=hdr_castle]')
		hdr_castle.checked = gallery.hdr_castle
		const hdr_galaxy = form.querySelector('input[name=hdr_galaxy]')
		hdr_galaxy.checked = gallery.hdr_galaxy
		const hdr_bridge = form.querySelector('input[name=hdr_bridge]')
		hdr_bridge.checked = gallery.hdr_bridge
		const hdr_park = form.querySelector('input[name=hdr_park]')
		hdr_park.checked = gallery.hdr_park

		const show_hdr = form.querySelector('input[name=show_hdr]')
		show_hdr.checked = gallery.show_hdr

		// bg color
		// readout
		form.querySelector('input[name=bg_color]').value = gallery.bg_color
		// color picker
		if( typeof gallery.bg_color === 'string' && gallery.bg_color.match(/^#/) ){
			form.querySelector('input[name=bg_color_selector]').value = gallery.bg_color
		}

		// rotation on / speed / axes
		const rotate_scene = form.querySelector('input[name=rotate_scene]')
		rotate_scene.checked = gallery.rotate_scene
		form.querySelector('input[name=rotate_speed]').value = gallery.rotate_speed
		const rot_contingents = rotate_scene.parentElement.parentElement.querySelectorAll('.contingent')
		set_contingents( rot_contingents, rotate_scene.checked )

		// bloom
		const bloom = form.querySelector('input[name=has_bloom]')
		bloom.checked = gallery.has_bloom

		// snow
		const snow = form.querySelector('input[name=has_snow]')
		snow.checked = gallery.has_snow

		// blizzard
		const blizzard = form.querySelector('input[name=has_blizzard]')
		blizzard.checked = gallery.has_blizzard

		// lensflare
		const lensflare = form.querySelector('input[name=has_lensflare]')
		lensflare.checked = gallery.has_lensflare

		// float dist
		const float_height = form.querySelector('input[name=float_height]')
		float_height.value = gallery.float_height

		// fog
		const fog = form.querySelector('input[name=has_fog]')
		fog.checked = gallery.has_fog
		if( gallery.fog_color ){
			const fog_color = form.querySelector('input[name=fog_color]')
			fog_color.value = gallery.fog_color
		}
		if( gallery.fog_density ){
			const fog_density = form.querySelector('input[name=fog_density]')
			fog_density.value = gallery.fog_density
		}

		// animations
		const clips = form.querySelectorAll('#anim-clips input[type=checkbox]')
		const active_clips = typeof gallery.animations === 'string' ? gallery.animations.split(',') : []
		for( const clip of clips ){
			if( active_clips.includes( clip.name ) ){
				clip.checked = true
			}
		}

		// finish
		form.style.display = 'inline-block'
		if( !is_new ){
			form.setAttribute('data-shortcode-id', shortcode_id )
			form.classList.add('editing')		
		}else{
			form.removeAttribute('data-shortcode-id')
			form.classList.remove('editing')		
		}

		gallery.render_shortcode() // this 

		gallery.set_tooltips()

		gallery.render_position_strings()

		window.scroll({
			top: window.pageYOffset + form.getBoundingClientRect().top - 50,
			behavior: 'smooth',
		})

		hal('success', 'editing ' + ( name ? '"' + name + '"' : '' ), 3000 )

	} // hydrate_form




	gallery.set_tooltips = () => {

		// bloom / ground map
		const bloomtip = gallery.form.querySelector('input[name=has_bloom]').parentElement.parentElement.querySelector('.tip')
		const floattip = gallery.form.querySelector('input[name=float_height]').parentElement.parentElement.querySelector('.tip')
		const bg_tip = gallery.form.querySelector('input[name=bg_color_selector]').parentElement.parentElement.querySelector('.tip')

		const has_map = gallery.form.querySelector('#ground-choice-map .threepress-row')
		if( has_map ){
			bloomtip.classList.add('active')
			floattip.classList.add('active')
		}else{
			bloomtip.classList.remove('active')
			floattip.classList.remove('active')
		}

		setTimeout(() => {
			if( gallery.has_bloom ){
				bg_tip.classList.add('active')
			}else{
				bg_tip.classList.remove('active')
			}
		}, 200 )

	}



	gallery.get_hdr = () => {
		for( const key of Object.keys( gallery ) ){
			if( key.match(/^hdr_/) && gallery[ key ] ) return key
		}
	}




	gallery.gen_row = () => {
		stack('gen_row', null, gallery )

		const row = document.createElement('div')
		row.classList.add('row', 'threepress-row', 'threepress-gallery-row')
		row.setAttribute('data-id', gallery.id )
		const name = document.createElement('div')
		name.classList.add('column', 'column-3')
		name.title = 'name'
		name.innerText = gallery.name
		row.appendChild( name )
		const thumb = document.createElement('div')
		thumb.classList.add('threepress-row-icon')
		const thumb_img = document.createElement('img')
		thumb_img.src = THREEPRESS.plugin_url + '/assets/icon_original.png'
		thumb.appendChild( thumb_img )
		name.prepend( thumb )
		const edited = document.createElement('div')
		edited.classList.add('column', 'column-3')
		edited.title = 'edited'
		edited.innerText = new Date( gallery.edited ).toDateString()
		row.appendChild( edited )
		const id = document.createElement('div')
		id.classList.add('column', 'column-3')
		id.title = 'id'
		id.innerHTML = gallery.id
		row.appendChild( id )

		const content = document.createElement('div')
		content.classList.add('column')
		content.title = 'shortcode'
		const shortcode = document.createElement('input')
		shortcode.name = 'threepress_shortcode'
		shortcode.setAttribute('readonly', true )// = true
		shortcode.value = gallery.shortcode || ''
		content.appendChild( shortcode )
		row.appendChild( content )

		const deleteRow = document.createElement('div')
		deleteRow.classList.add('delete')
		deleteRow.innerHTML = '&times;'
		row.appendChild( deleteRow )

		row.addEventListener('click', e => {

			const toggle = document.querySelector('#threepress-product-options .inside>.button')

			if( e.target.classList.contains('delete')){

				if( gallery.location === 'product'){
					row.remove()
					if( toggle ){
						toggle.innerHTML = '+'
						toggle.style.display = 'inline-block'
					}

				}else{
					if( confirm('delete gallery? (models will not be deleted)') ){
						fetch_wrap( ajaxurl, 'post', {
							action: 'threepress_delete_gallery',
							id: gallery.id,
						}, false)
						.then( res => {
							if( res.success ){
								row.remove()
							}else{
								hal('error', res.msg || 'error deleting row', 5000 )
							}
						})	
						.catch( err => {
							console.log( err )
							hal('error', err.msg || 'error deleting row', 5000 )
						})
					}
				}

			}else if( e.target.getAttribute('readonly') || e.target.title === 'shortcode' ){

				//

			}else{

				gallery.hydrate_form( gallery.form, shortcode.value.trim(), gallery.id, 'row click' )
				.catch( err => {
					console.log( err )
				})

				if( gallery.location === 'product' ){
					row.remove()
					if( toggle ) toggle.style.display = 'none'
				}

			}
		})

		return row

	}// gen row



	gallery.scale_intensity = () => {
		
		const scaled = gallery.intensity / 3

		return scaled
	}



	gallery.render_change = ( target_ele, form, model_choice, ground_choice, ground_map, shortcode ) => {

		// stack_settings.debugging = true

		stack('render_change ' + ( target_ele.id || target_ele.name || 'no target' ), null, gallery )

		// console.log('render change', target_ele )

		if( !target_ele ){
			console.log('missing', model_choice )
			return 
		}

		let contingents

		if( target_ele.id === 'choose-ground'){

			media_selector('image', ( id, ground_row ) => {
				ground_choice.innerHTML = ''
				ground_choice.appendChild( ground_row.gen_row() )

				shortcode.value = gallery.render_shortcode('media image') //  form 

			})
			// console.log('12')

		}else if( target_ele.id === 'choose-ground-map'){

			media_selector('image', ( id, ground_row ) => {
				ground_map.innerHTML = ''
				ground_map.appendChild( ground_row.gen_row() )

				shortcode.value = gallery.render_shortcode('media image 2') //  form 

			})
			// console.log('11')

		}else if( target_ele.id === 'choose-model'){

			media_selector('model', ( id, model_row ) => {
				model_choice.innerHTML = ''
				model_row.form = form
				model_choice.appendChild( model_row.gen_row() )
				shortcode.value = gallery.render_shortcode('media model') //  form 
			})
			// console.log('10')

		}else if( target_ele.name === 'rotate_scene'){

			contingents = target_ele.parentElement.parentElement.querySelectorAll('.contingent')

			set_contingents( contingents, target_ele.checked )
			// console.log('9')

		}else if( target_ele.name === 'allow_zoom' ){

			contingents = target_ele.parentElement.parentElement.querySelectorAll('.contingent')

			set_contingents( contingents, target_ele.checked )
			// console.log('8')

		}else if( target_ele.name === 'has_bloom'){

			contingents = target_ele.parentElement.parentElement.querySelectorAll('.contingent')

			set_contingents( contingents, target_ele.checked )

			// const color = form.querySelector('input[name=bg_color_selector]').parentElement.parentElement
			// if( target_ele.checked ){
			// 	color.classList.add('threepress-disabled')
			// }else{
			// 	color.classList.remove('threepress-disabled')
			// }
			// console.log('7')

		}else if( target_ele.name === 'has_fog'){

			contingents = target_ele.parentElement.parentElement.querySelectorAll('.contingent')

			set_contingents( contingents, target_ele.checked )
			// console.log('6')


		}else if( target_ele.name === 'options_light'){

			contingents = target_ele.parentElement.parentElement.querySelectorAll('.contingent')

			set_contingents( contingents, target_ele.parentElement.parentElement.querySelector('input[value=sun]').checked )
			// console.log('5')

		}else if( target_ele.name === 'options_controls' ){ // no orbit controls

			//
			// console.log('4')

		}else if( target_ele.name === 'has_snow' || target_ele.name === 'has_blizzard' ){

			const snow = form.querySelector('input[name=has_snow]')
			const blizzard = form.querySelector('input[name=has_blizzard]')
			if( target_ele.name === 'has_snow' && blizzard.checked ){
				blizzard.checked = false
			}else if( target_ele.name === 'has_blizzard' && snow.checked ){
				snow.checked = false
			}

			// console.log('3')
		}else if( target_ele.querySelector('.coord-range') ){

			let has_val
			for( const range of target_ele.querySelectorAll('.coord-range') ){
				if( range.value != 0 ) has_val = true
			}
			if( !has_val  ){ // && !is_ground_dims
				console.log('setting val for ', target_ele )
				// hal('error', 'cannot set all values to zero', 7000 )
				target_ele.querySelector('.coord-range').value = 1
			}

			// console.log('2')
		}else if( target_ele.classList.contains('animation-checkbox') ){

			// gallery.render_shortcode()
			gallery.update_animation_shortcode()

			// console.log('1')

		}else if( target_ele.name && target_ele.name.match(/^hdr_/) ){

			for( const input of target_ele.parentElement.parentElement.querySelectorAll('input') ){
				if( input.name.match(/^hdr_/) && input.name !== target_ele.name ) input.checked = false
			}

		}

	}




	gallery.update_animation_shortcode = async() => {

		if( !gallery.shortcode ) await gallery.gen_shortcode( 'update_animation_shortcode', 'skip ajax' )

		const clips = gallery.form.querySelector('#anim-clips')
		if( !clips ) return

		const active = []
		for( const clip of clips.querySelectorAll('input[type=checkbox]') ){
			if( clip.checked ) active.push( clip.name.replace(/ /g, '%%') )
		}
		if( active.length ){
			const arraypairs = gallery.shortcode.replace(/ ?\]/, '').split(' ')
			// let invalid = false
			// let split
			// splice out previous animations
			for( let i = arraypairs.length - 1; i >= 0; i-- ){
				// if( val && !val.match(/.*=.*/) ){
				// 	invalid = true
				// 	continue
				// }
				// split = val.split('=')
				if( arraypairs[i].match(/^animations/) ){
					arraypairs.splice( i, 1 )
				}

			}

			// splice in new animations
			arraypairs.push('animations=' + active.join(',') )

			gallery.shortcode = '[threepress ' + arraypairs.join(' ') + ' ]'

		}

		// console.log('update_animation_shortcode:', gallery.animations, 'to : \n\n', gallery.shortcode )

	}



	// gallery.render_positions = () => {
	// 	stack('render_positions', null, gallery )
	// 	let iter = 0
	// 	for( const input of gallery.form.querySelectorAll('.cam-position input.coord-range') ){
	// 		input.value = gallery.cam_coords[ input.getAttribute('name') ] || 1
	// 		iter++
	// 	}
	// 	iter = 0
	// 	for( const input of gallery.form.querySelectorAll('.light-position input.coord-range') ){
	// 		input.value = gallery.light_coords[ input.getAttribute('name') ] || 1
	// 		iter++
	// 	}
	// 	// for( const input of gallery.form.querySelectorAll('.ground-dimensions input.coord-range') ){
	// 	// 	console.log( input.getAttribute('name'), gallery.ground_dimensions[ input.getAttribute('name') ], input.value )
	// 	// }
	// }


	gallery.render_position_strings = () => {
		stack('render_position_strings', null, gallery )
		for( const input of gallery.form.querySelectorAll('.readout')){
			input.value = ''
		}
		let iter = 0
		let readout = gallery.form.querySelector('.cam-position input.readout')
		for( const input of gallery.form.querySelectorAll('.cam-position input.coord-range') ){
			readout.value += input.value
			if( iter < 2 ) readout.value += ','
			iter++
		}
		iter = 0
		readout = gallery.form.querySelector('.light-position input.readout')
		for( const input of gallery.form.querySelectorAll('.light-position input.coord-range') ){
			readout.value += input.value
			if( iter < 2 ) readout.value += ','
			iter++
		}
		iter = 0
		readout = gallery.form.querySelector('.ground-dimensions input.readout')
		for( const input of gallery.form.querySelectorAll('.ground-dimensions input.coord-range') ){
			readout.value += input.value
			if( iter < 2 ) readout.value += ','
			iter++
		}
	}





	gallery.applyEnvMap = ( envMap, model ) => {
		model.traverse( child => {
			if( child.material ){
				child.material.envMap = envMap 
				// child.material.reflectivity = 3
				// child.material.combine = MixOperation // Multiply / AddOperation
				// child.material.shininess = 300
			}
		})
	}


	gallery.align = () => { // for image overlays
		stack('align', null, gallery )

		if( !gallery.overlay ){
			console.log('invalid align called', this )
			return
		}
		const bounds = gallery.overlay.getBoundingClientRect()
		gallery.canvas.style.top = bounds.top + 'px'
		gallery.canvas.style.left = bounds.left + 'px'
		gallery.canvas.style.width = bounds.width + 'px'
		gallery.canvas.style.height = bounds.height + 'px'

	}

	gallery.make_visible = target => {
		stack('make_visible', null, gallery )

		if( target ){
			gallery.canvas.style.opacity = 0
			gallery.overlay.style.opacity = 1
		}else{
			gallery.canvas.style.opacity = 1
			gallery.overlay.style.opacity = 0
		}

	}

	gallery.set_renderer = () => {

		const bound = gallery.canvas.getBoundingClientRect()

		gallery.CAMERA.aspect = bound.width / bound.height
		gallery.CAMERA.updateProjectionMatrix()

		gallery.RENDERER.setSize( 
			bound.width / resolutions[ gallery.res_key ],
			bound.height / resolutions[ gallery.res_key ],
			false 
		)
	}

	gallery.contains_event = e => {
		const gallery_bound = gallery.canvas.getBoundingClientRect()
		// console.log('a')
		if( e.clientX > gallery_bound.left && e.clientX < gallery_bound.left + gallery_bound.width ){
			// console.log('b')
			if( e.clientY > gallery_bound.top && e.clientY < gallery_bound.top + gallery_bound.height ){
				return true
			}
		}
		return false
	}

	gallery.display = viewer => {	
		stack('display', null, gallery )

		init_scene( gallery )
		.then( success => {

			if( success ){

				viewer.appendChild( gallery.canvas )

				// the problem is
				// composer doesnt work with orbit controls - vice versa
				// is it perhaps the scene/renderer/camera get disassociated ?
				// does composer not update the renderer ??
				// walk it back - what is requried to make it work again

				if( gallery.has_bloom ){
					composer.init( gallery.RENDERER, gallery.SCENE, gallery.CAMERA, {
						threshold: gallery.bloom_threshold,
						strength: gallery.bloom_strength,
					} )
				}

				if( gallery.controls && gallery.controls !== 'none' ){ 
					// ignored by pointer-events in woo:
					// gallery.canvas.parentElement.addEventListener('pointerdown', start_animation )
					// gallery.canvas.parentElement.addEventListener('pointerup', stop_animation )
				}
				
				gallery.set_renderer()

				gallery.anim_state( true )
				if( !gallery.is_continuous() ) gallery.anim_state( false )					

				if( !galleries.includes( gallery )) galleries.push( gallery )

				// gallery.SCENE.traverse( obj => {
				// 	if( obj.type === 'Lensflare'){
				// 		obj.traverse( o => {
				// 			console.log( o )
				// 		})
				// 		// obj.position.x += 10000
				// 	}
				// 	// if( obj.material ) console.log( obj.type + ': ', obj.material )
				// })

				gallery.canvas.parentElement.addEventListener('pointerdown', gallery.handle_click )

			}else{
				console.log('gallery display fail')
			}
		})
		.catch( err => {
			console.log( err )
		})	
	}



	gallery.is_continuous = () => {

		return gallery.rotate_scene || gallery.has_snow || gallery.has_blizzard || gallery.animations.length

	}



	gallery.preview = async() => {

		spinner.show()

		stack('preview', null, gallery )

		console.log('preview: ', gallery.hash )

		// if( !gallery.validate( true, true, false ) ) return // in scene

		gallery.clear_scene()

		await gallery.ingest_form( null, 'preview' )

		const success = await init_scene( gallery )

		spinner.hide()

		if( !success ){
			console.log( success )
			hal('error', 'failed to init preview', 5 * 1000)
			return
		}

		if( previewing ) return 
		previewing = true

		const modal = new Modal({
			type: 'gallery-preview'
		})
		
		const viewer = document.createElement('div')
		viewer.classList.add('threepress-gallery')
		viewer.appendChild( gallery.canvas )
		modal.content.appendChild( viewer )

		modal.close.addEventListener('click', () => {
			gallery.animating = false
			previewing = false
			galleries.splice( gallery, 1 )
		})

		document.querySelector('.threepress').appendChild( modal.ele )

		gallery.set_renderer()

		const type = document.createElement('div')
		type.classList.add('threepress-gallery-type')
		type.innerText = ( gallery.preview_type || 'gallery' ) + ' preview'
		gallery.canvas.parentElement.appendChild( type )

		if( !galleries.includes( gallery )) galleries.push( gallery )

		if( gallery.has_bloom ){
			composer.init( gallery.RENDERER, gallery.SCENE, gallery.CAMERA, {
				threshold: gallery.bloom_threshold,
				strength: gallery.bloom_strength,
			} )

			// composer.composeAnimate( gallery.SCENE )

		}

		gallery.anim_state( true )

			// hal('error', 'failed to init preview', 4000 )

		// }

		// })
		// .catch( err => { 

		// 	spinner.hide()

		// 	if( err && err.currentTarget && err.currentTarget.status === 404 && gallery.model.guid.match(/woocommerce_uploads/) ){
		// 		hal('error', 'error initializing model - it may be a protected woocommerce download', 10 * 1000 )
		// 	}

		// 	console.log( err ) 

		// } )

	}




	gallery.handle_click = e => {

		if(!e.preventDefault ) return
		e.preventDefault();

		const bounds = gallery.RENDERER.domElement.getBoundingClientRect()

		const gallX = e.clientX - bounds.x
		const gallY = e.clientY - bounds.y

		const x = ( gallX / gallery.RENDERER.domElement.clientWidth ) * 2 - 1
		const y =  - ( gallY / gallery.RENDERER.domElement.clientHeight ) * 2 + 1

		gallery.RAYCASTER.setFromCamera({
			x: x, 
			y: y
		}, gallery.CAMERA )

		const intersects = gallery.RAYCASTER.intersectObjects( gallery.SCENE.children, true ) // [ objects ], recursive (children) (ok to turn on if needed)

		if( intersects.length <= 1 ){ // 1 == skybox
			// console.log( 'skybox')
			return false
		}	

		if( intersects[0].distance < 10000 ){
			// addBloom( intersects[0].object )
			// const clicked = scour_clickable( intersects[0].object )
			// console.log( 'click: ,', intersects[0] )
		}

	}


	return gallery

}






let resizing = false
window.addEventListener('resize', () => {
	if( !resizing ){
		resizing = setTimeout(() => {  // be nice to overloaded WP sites
			for( const overlay of overlays ) overlay.align()
			for( const gallery of galleries ) gallery.set_renderer()		
			clearTimeout( resizing )
			resizing = false
		}, 1000 )
	}
})



