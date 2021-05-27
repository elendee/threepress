// import BROKER from './helpers/EventBroker.js'

import {
	// Color,
	DirectionalLight,
	WebGLRenderer,
	Scene,
	PerspectiveCamera,
	Vector3,
} from '../inc/three.module.js'

import { GLTFLoader } from '../inc/GLTFLoader.js'
import { OrbitControls } from '../inc/OrbitControls.js'

import {
	fill_dimensions,
	fetch_wrap,
	ModelRow,
	set_contingents,
	hal,
	val_boolean,
	origin,
} from './lib.js'

import { Modal } from './helpers/Modal.js'


const logging = true
const stack = msg => {
	if( logging ) console.log( 'gallery stack: ', msg )
}


const overlays = THREEPRESS.overlays = []
const galleries = THREEPRESS.galleries = []

const resolutions = [4, 2, 1.5, 1]

const loader = new GLTFLoader()

let previewing = false
let bound_wheel = false
let gallery_bound, gallery_top


const tag = ( key , value ) => { return value ? `${ key }=${ value } ` : '' }


const shortcode_values = [
	'name',

	'controls',

	'light',
	'intensity',

	'camera_dist',
	'allow_zoom',
	'zoom_speed',
	'rotate_x',
	'rotate_y',
	'rotate_z',

	'bg_color',
]




const defaults = { // form values, not scaled values
	name: 'new gallery',
	light: 'directional',
	intensity: 5,
	camera_dist: 5,
	aspect_ratio: .7,
	rotate_speed: 1,
	zoom_speed: 5,
	bg_color: 'linear-gradient(45deg,white,transparent)',
	shortcode: '',
}


const set_scalars = gallery => {
	gallery.scaled_intensity = gallery.intensity / 3
	gallery.scaled_rotate = gallery.rotate_speed / 1000
	gallery.scaled_zoom = gallery.zoom_speed ? gallery.zoom_speed : defaults.zoom_speed
}



export default init => {

	init = init || {}

	const gallery = THREEPRESS.last_gallery = {}
	// db
	gallery.id = init.id || defaults.id
	gallery.author_key = init.author_key || defaults.author_key
	gallery.name = init.name || defaults.name
	gallery.shortcode = init.shortcode || defaults.shortcode
	gallery.created = init.created  || defaults.created
	gallery.edited = init.edited || defaults.edited
	// data
	gallery.model = init.model || {}
	gallery.location = init.location
	setTimeout(()=>{
		console.log('new Gallery: ', gallery.location)
	}, 50)
	// rendering
	gallery.form = init.form || gallery.form
	gallery.controls = init.controls || defaults.controls
	gallery.allow_zoom = val_boolean( init.allow_zoom, false )
	gallery.zoom_speed = init.zoom_speed || defaults.zoom_speed
	gallery.rotate_scene = val_boolean( init.rotate_scene, false )
	gallery.rotate_speed = init.rotate_speed || defaults.rotate_speed
	gallery.rotate_x = init.rotate_x || defaults.rotate_x
	gallery.rotate_y = val_boolean( init.rotate_y, true )
	gallery.rotate_z = init.rotate_z || defaults.rotate_z
	gallery.bg_color = init.bg_color  || defaults.bg_color
	gallery.view = init.view  || defaults.view
	gallery.camera_dist = init.camera_dist  || defaults.camera_dist
	gallery.intensity = init.intensity  || defaults.intensity
	gallery.light = init.light  || defaults.light
	gallery.overlay = init.overlay || defaults.overlay
	gallery.aspect_ratio = init.aspect_ratio  || defaults.aspect_ratio

	gallery.preview_type = init.preview_type

	// calculated
	gallery.res_key = typeof init.res_key === 'number' ? init.res_key : resolutions.length - 1


	// state
	gallery.animating = false


	// threejs eles
	gallery.MODELS = []

	// dom
	if( gallery.overlay ){
		gallery.canvas.classList.add('threepress-overlay')
		overlays.push( gallery )
	}













	let now// , delta//, delta_seconds
	// let then = 0

	const start_animation = () => { // single frame updates
		gallery.animating = true
		gallery.orbit_controls ? animate_controls() : animate()
	}

	const stop_animation = () => {
		gallery.animating = false
	}

	const animate = () => { // no controls gallery

		if( !gallery.animating ) return

		now = performance.now()
		// delta = now - then
		// delta_seconds = delta / 1000 
		gallery.RENDERER.render( gallery.SCENE, gallery.CAMERA )

		for( const child of gallery.SCENE.children ){
			if( child.userData.subject && gallery.rotate_scene ){
				if( gallery.rotate_x ) child.rotation.x += gallery.scaled_rotate
				if( gallery.rotate_y ) child.rotation.y += gallery.scaled_rotate
				if( gallery.rotate_z ) child.rotation.z += gallery.scaled_rotate
			}
		}

		requestAnimationFrame( animate )

	}

	const animate_controls = () => { // animation with controls
		if( !gallery.animating ) return
		now = performance.now()
		// delta = now - then
		// delta_seconds = delta / 1000 
		gallery.RENDERER.render( gallery.SCENE, gallery.CAMERA )

		for( const child of gallery.SCENE.children ){
			if( child.userData.subject && gallery.rotate_scene ){
				if( gallery.rotate_x ) child.rotation.x += gallery.scaled_rotate
				if( gallery.rotate_y ) child.rotation.y += gallery.scaled_rotate
				if( gallery.rotate_z ) child.rotation.z += gallery.scaled_rotate
			}
		}
		gallery.orbit_controls.update()
		requestAnimationFrame( animate_controls )

	}


	const camera_step = new Vector3()
	const projection = new Vector3()
	let projected_dist, buffer_radius, too_close, pass_through
	const scroll_canvas = e => {
		for( const gallery of galleries ){
			gallery_bound = gallery.canvas.getBoundingClientRect()
			gallery_top = window.pageYOffset + gallery_bound.top
			if( gallery.orbit_controls && gallery.allow_zoom ){
				if( e.clientX > gallery_bound.left && e.clientX < gallery_bound.left + gallery_bound.width ){
					if( e.clientY > gallery_top && e.clientY < gallery_top + gallery_bound.height ){

						e.preventDefault()

						camera_step.subVectors( gallery.CAMERA.position, origin )
						.normalize()
						.multiplyScalar( gallery.scaled_zoom )
						
						projection.copy( gallery.CAMERA.position )

						if( e.deltaY > 0 ){ // out
							
							projection.add( camera_step )

						}else{ // in

							projection.sub( camera_step )
							projected_dist = projection.distanceTo( gallery.MODELS[0].position )
							buffer_radius = gallery.MODELS[0].userData.radius * 1.5
							too_close = projected_dist < buffer_radius
							pass_through = gallery.CAMERA.position.distanceTo( projection ) >= gallery.CAMERA.position.distanceTo( gallery.MODELS[0].position ) - buffer_radius
							
							if( too_close || pass_through ){
								return
							}else{
								projection.sub( camera_step )
							}
							
						}

						projection.clampLength( gallery.MODELS[0].userData.radius * 1.5, 9999999 )

						gallery.CAMERA.position.copy( projection )

						gallery.RENDERER.render( gallery.SCENE, gallery.CAMERA )
						if( gallery.orbit_controls ) gallery.orbit_controls.update()

					}
				}
			}
		}
	}






	gallery.clear_scene = () => {

		gallery.SCENE = gallery.SCENE || new Scene()

		let cap = 0
		while( gallery.SCENE.children.length > 0 && cap < 1999999 ){ 
			if( gallery.SCENE.children[0].material ) gallery.SCENE.children[0].material.dispose()
			if( gallery.SCENE.children[0].geometry ) gallery.SCENE.children[0].geometry.dispose()
		    gallery.SCENE.remove( gallery.SCENE.children[0] )
		    cap++
		}

	}



	gallery.init_scene = async() => { // lights camera action

		if( !gallery.validate( false, true, false )) return

		/// 

		gallery.SCENE = gallery.SCENE || new Scene()
		gallery.RENDERER = gallery.RENDERER || new WebGLRenderer({ 
			antialias: true,
			alpha: true
		})
		gallery.canvas = gallery.canvas || gallery.RENDERER.domElement
		gallery.canvas.height = gallery.canvas.width * gallery.aspect_ratio

		set_scalars( gallery )

		if( !gallery.LIGHT ){
			if( gallery.light === 'directional' ){
				gallery.LIGHT = new DirectionalLight( 0xffffff, gallery.scaled_intensity )
			}else{
				//
			}
		}
		gallery.CAMERA = gallery.CAMERA || new PerspectiveCamera( 30, window.innerWidth / window.innerHeight, 1, gallery.view )

		gallery.SCENE.add( gallery.LIGHT )
		gallery.SCENE.add( gallery.CAMERA )

		///

		// model
		if( gallery.model ){
			if( location.href.match(/^https/) && gallery.model.guid.match(/^http:/) ){
				gallery.model.guid = gallery.model.guid.replace(/^http:/, 'https:')
			}
			const model = await (()=>{
				return new Promise((resolve, reject ) => {
					loader.load( gallery.model.guid, res => {
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

			gallery.SCENE.add( model )

			gallery.MODELS.push( model )

			const radius = model.userData.radius
			const diam = radius * 2

			gallery.CAMERA.far = radius * 100

			gallery.CAMERA.position.set( 0, radius, radius * gallery.camera_dist )
			gallery.LIGHT.position.set( diam, diam, diam )
			gallery.CAMERA.lookAt( model.position )
			gallery.LIGHT.lookAt( model.position )

		}

		// controls
		if( gallery.controls === 'orbit' ){
			gallery.orbit_controls = new OrbitControls( gallery.CAMERA, gallery.canvas )
			gallery.orbit_controls.enableZoom = false // implement this yourself so it doesn't jack scroll
		}

		if( !bound_wheel ){
			window.addEventListener('wheel', scroll_canvas, { passive: false } ) // mouse
			bound_wheel = true
		}

		// refresh
		set_scalars( gallery )

		gallery.LIGHT.intensity = gallery.scaled_intensity

		if( gallery.bg_color )  gallery.canvas.style.background = gallery.bg_color

		return true

	}




	gallery.fill_model_from_form = () => {
		stack('fill_model_from_form')
		gallery.model = gallery.model || {}
		const mc = gallery.form.querySelector('#model-choice .threepress-row')
		if( mc ){
			gallery.model.guid = mc.querySelector('.url input').value.trim()
			gallery.model.id = mc.getAttribute('data-id')
		}
	}




	gallery.validate = ( pop_errors, log_errors, save ) => {

		const invalidations = []

		// model
		if( !gallery.model ) invalidations.push('missing model')
		if( save ){ // shortcode needs model.id
			if( isNaN( gallery.model.id ) ) invalidations.push('invalid model id')
		}else{ // display needs model.guid
			if( !gallery.model.guid || !gallery.model.guid.match(/\.glb/) ) invalidations.push('invalid model - must be glb format')	
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




	gallery.gen_shortcode = () => {
		stack( 'gen_shortcode')

		let shortcodes = ''
		for( const key of shortcode_values ){
			if( gallery[ key ] ){
				shortcodes += tag( key, gallery[ key ] )
			}
		}

		// --- derived gallery attributes:

		// rotate
		if( gallery.rotate_scene ){
			shortcodes += 'rotate_scene=true '
		}
		
		// model
		gallery.fill_model_from_form()
		if( gallery.model.id ) shortcodes += 'model_id=' + gallery.model.id + ' '

		if( shortcodes ){
			gallery.shortcode = '[threepress ' + shortcodes + ']'.replace(/ \]/, '')
			return gallery.shortcode
		}

		return ''

	}


	
	gallery.ingest_form = form => {
		stack( 'ingest_form')

		// gallery.reset_form( form )

		form = form || gallery.form

		// chosen model
		gallery.fill_model_from_form()

		// gallery name
		gallery.name = form.querySelector('input[name=gallery_name]').value.trim().replace(/ /g, '%%')

		// radios: controls & light
		const radios = {
			controls: form.querySelectorAll('input[name=options_controls]'),
			light: form.querySelectorAll('input[name=options_light]'),
		}
		for( const opt of radios.controls ) if( opt.checked ) gallery.controls = opt.value
		for( const opt of radios.light ) if( opt.checked ) gallery.light = opt.value
		gallery.intensity = form.querySelector('input[name=intensity]').value

		// allow_zoom 
		gallery.allow_zoom = form.querySelector('input[name=allow_zoom]').checked
		// zoom speed
		gallery.zoom_speed = form.querySelector('input[name=zoom_speed]').value

		// camera
		gallery.camera_dist = form.querySelector('input[name=camera_dist').value

		// rotation
		gallery.rotate_scene = form.querySelector('input[name=rotate_scene]').checked
		if( gallery.rotate_scene ){
			gallery.rotate_speed = form.querySelector('input[name=rotate_speed]').value
		}else{
			gallery.rotate_speed = undefined
		}
		gallery.rotate_x = form.querySelector('input[name=rotate_x]').checked
		gallery.rotate_y = form.querySelector('input[name=rotate_y]').checked
		gallery.rotate_z = form.querySelector('input[name=rotate_z]').checked

		// bg color
		gallery.bg_color = form.querySelector('input[name=bg_color]').value.replace(/ /g, '')

		set_scalars( gallery )

	}





	gallery.ingest_shortcode = shortcode => {
		stack( 'ingest_shortcode')

		const arr = shortcode.replace(']', '').split(' ')

		if( !arr[0].match(/\[ ?threepress/) ){
			hal('error', 'invalid shortcode', 4000 )
			return false
		}

		arr.splice(0, 1)

		const escrow = {}

		let invalid = false
		let split
		for( const val of arr ){
			if( val && !val.match(/.*=.*/) ){
				invalid = true
				break;
			}
			split = val.split('=')
			if( split[0] === 'model_id' ){
				gallery.model.id = split[1]
			}else if( !shortcode_values.includes( split[0] )){
				if( split[0] ) console.log('invalid shortcode value', split[0], arr )
				continue
			}
			escrow[ split[0] ] = split[1].replace(/%%/g, ' ')
		}

		if( invalid ){
			hal('error', 'there was an error parsing shortcode', 5000 )
			return 
		}

		for( const key in escrow ) gallery[ key ] = escrow[ key ]

		if( !gallery.rotate_scene ) delete gallery.orbit_controls

		gallery.shortcode = shortcode

		return arr

	}



	gallery.render_shortcode = () => {
		stack('render shortcode')

		gallery.ingest_form()

		gallery.gen_shortcode()

		gallery.form.querySelector('#shortcode').value = gallery.shortcode

		return gallery.shortcode
	}




	gallery.ingest_data = data => {
		stack( 'ingest_data')

		// if( data.post_id ) gallery.model.id = Number( data.post_id )
		if( data.post_id ) gallery.model.id = Number( data.ID )
		if( data.guid ) gallery.model.guid = data.guid

	}




	gallery.hydrate_editor = async( form, shortcode, shortcode_id ) => {
		stack( 'hydrate_editor')

		const is_new = !shortcode_id 

		// validate
		if( shortcode ) gallery.ingest_shortcode( shortcode )

		// hydrate model
		const model_choice = ( form || gallery.form ).querySelector('#model-choice')
		model_choice.innerHTML = ''			

		if( !is_new ){

			const res = await fetch_wrap( ajaxurl, 'post', {
				action: 'get_model',
				id: gallery.model.id,
			})
			if( !res || !res.success ){
				console.log( res )
			}else{
				const model = res.model
				const new_model = new ModelRow( model )
				new_model.form = form || gallery.form

				model_choice.appendChild( new_model.gen_row() )				
			}

		}

		// name
		const name = gallery.name.replace(/%/g, ' ')
		form.querySelector('input[name=gallery_name]').value = name

		// bg color
		form.querySelector('input[name=bg_color]').value = gallery.bg_color
		// controls
		for( const option of form.querySelectorAll('input[name=options_controls]')){
			if( option.value === gallery.controls ) option.checked = true
		}
		// allow zoom
		const allow_zoom = form.querySelector('input[name=allow_zoom]')
		allow_zoom.checked = gallery.allow_zoom ? true : false
		// zoom speed
		const zoom_speed = form.querySelector('input[name=zoom_speed]')
		zoom_speed.value = gallery.zoom_speed
		set_contingents( [zoom_speed], allow_zoom.checked )

		// light
		for( const option of form.querySelectorAll('input[name=options_light]')){
			if( option.value === gallery.controls ) option.checked = true
		}
		// light intensity
		form.querySelector('input[name=intensity]').value = gallery.intensity // scaled_intensity

		// camera zoom
		form.querySelector('input[name=camera_dist]').value = gallery.camera_dist

		// rotation on / speed / axes
		const rotate_scene = document.querySelector('input[name=rotate_scene]')
		rotate_scene.checked = gallery.rotate_scene
		form.querySelector('input[name=rotate_speed]').value = gallery.rotate_speed
		form.querySelector('input[name=rotate_x]').checked = gallery.rotate_x
		form.querySelector('input[name=rotate_y]').checked = gallery.rotate_y
		form.querySelector('input[name=rotate_z]').checked = gallery.rotate_z
		const rot_contingents = rotate_scene.parentElement.parentElement.querySelectorAll('.contingent')
		set_contingents( rot_contingents, rotate_scene.checked )

		// shortcode
		// form.querySelector('#shortcode').value = gallery.shortcode// 

		form.style.display = 'inline-block'
		// add_gallery.querySelector('div').innerText = '-'
		if( !is_new ){
			form.setAttribute('data-shortcode-id', shortcode_id )
			form.classList.add('editing')		
		}else{
			form.removeAttribute('data-shortcode-id')
			form.classList.remove('editing')		
		}

		gallery.render_shortcode()

		window.scroll({
			top: window.pageYOffset + form.getBoundingClientRect().top - 50,
			behavior: 'smooth',
		})

		hal('success', 'editing "' + name + '"', 3000 )

	}







	gallery.gen_row = () => {
		stack('gen_row ')

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
		shortcode.setAttribute('readonly', true )// = true
		shortcode.value = gallery.shortcode || ''
		content.appendChild( shortcode )
		row.appendChild( content )

		const deleteRow = document.createElement('div')
		deleteRow.classList.add('delete')
		deleteRow.innerHTML = '&times;'
		row.appendChild( deleteRow )

		row.addEventListener('click', e => {

			if( e.target.classList.contains('delete')){

				if( confirm('delete gallery? (models will not be deleted)')){
					fetch_wrap( ajaxurl, 'post', {
						action: 'delete_gallery',
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

			}else if( e.target.getAttribute('readonly') || e.target.title === 'shortcode' ){

				//

			}else{

				gallery.hydrate_editor( gallery.form, shortcode.value.trim(), gallery.id )
				.catch( err => {
					console.log( err )
				})

				if( gallery.location === 'product' ){
					row.remove()
				}

			}
		})

		return row

	}








	gallery.align = () => { // for image overlays
		stack('align')

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
		stack('make_visible')

		if( target ){
			gallery.canvas.style.opacity = 0
			gallery.overlay.style.opacity = 1
		}else{
			gallery.canvas.style.opacity = 1
			gallery.overlay.style.opacity = 0
		}

	}

	gallery.set_renderer = () => {

		gallery.CAMERA.aspect = gallery.canvas.getBoundingClientRect().width / gallery.canvas.getBoundingClientRect().height
		gallery.CAMERA.updateProjectionMatrix()

		gallery.RENDERER.setSize( 
			gallery.canvas.getBoundingClientRect().width / resolutions[ gallery.res_key ],
			gallery.canvas.getBoundingClientRect().height / resolutions[ gallery.res_key ],
			false 
		)
	}

	gallery.display = viewer => {
		stack('display')

		gallery.init_scene()
		.then( success => {

			if( success ){

				viewer.appendChild( gallery.canvas )

				gallery.set_renderer()

				if( gallery.rotate_scene ){

					gallery.animating = true
					gallery.orbit_controls ? animate_controls() : animate()

				}else{

					gallery.RENDERER.render( gallery.SCENE, gallery.CAMERA )

					gallery.canvas.parentElement.addEventListener('pointerdown', start_animation )
					gallery.canvas.parentElement.addEventListener('pointerup', stop_animation )

				}

				if( !galleries.includes( gallery )) galleries.push( gallery )

			}else{
				console.log('gallery display fail')
			}
		})
		.catch( err => {
			console.log( err )
		})	
	}

	gallery.preview = () => {
		stack('preview')

		gallery.fill_model_from_form()

		if( !gallery.validate( true, true, false ) ) return

		gallery.clear_scene()

		gallery.init_scene()
		.then( success => {
			if( success ){

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
					THREEPRESS.galleries.splice( gallery, 1 )
				})
				document.querySelector('.threepress').appendChild( modal.ele )			
				gallery.set_renderer()

				if( gallery.rotate_scene ){

					gallery.animating = true
					gallery.orbit_controls ? animate_controls() : animate()

				}else{

					gallery.RENDERER.render( gallery.SCENE, gallery.CAMERA )

					gallery.canvas.parentElement.addEventListener('pointerdown', start_animation )
					gallery.canvas.parentElement.addEventListener('pointerup', stop_animation )

				}

				const type = document.createElement('div')
				type.classList.add('threepress-gallery-type')
				type.innerText = ( gallery.preview_type || 'gallery' ) + ' preview'
				gallery.canvas.parentElement.appendChild( type )

				if( !galleries.includes( gallery )) galleries.push( gallery )

			}else{

				hal('error', 'failed to init preview', 4000 )

			}
		})
		.catch( err => { console.log( err ) } )

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


