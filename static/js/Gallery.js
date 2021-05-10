// import BROKER from './helpers/EventBroker.js'

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
	fetch_wrap,
	ModelRow,
	set_contingents,
	hal,

} from './lib.js'

import { Modal } from './helpers/Modal.js'





const overlays = THREEPRESS.overlays = []
const galleries = THREEPRESS.galleries = []

const resolutions = [4, 2, 1.5, 1]

const loader = new GLTFLoader()

let previewing = false
let bound_wheel = false
let gallery_bound, gallery_top

const gallery_form = document.querySelector('#gallery-form')
// const add_gallery = document.querySelector('#create-toggle')

const tag = ( key , value ) => { return value ? `${ key }=${ value } ` : '' }




const shortcode_values = [
	'model_id',
	'name',
	'light',
	'camera_dist',
	'rotate_x',
	'rotate_y',
	'rotate_z',
	'controls',
	'intensity',
	'bg_color',
]




const defaults = { // form values, not scaled values
	name: 'new gallery',
	light: 'directional',
	intensity: 5,
	camera_dist: 5,
	aspect_ratio: .7,
	rotate_speed: 1,
	bg_color: 'linear-gradient(45deg,white,transparent)',
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
	gallery.model_id = init.model_id || defaults.model_id
	// rendering
	gallery.controls = init.controls || defaults.controls
	gallery.allow_zoom = typeof init.allow_zoom === 'boolean' ? init.allow_zoom : false
	gallery.rotate_scene = typeof init.rotate_scene === 'boolean' ? init.rotate_scene : false
	gallery.rotate_speed = init.rotate_speed || defaults.rotate_speed
	gallery.rotate_x = init.rotate_x || defaults.rotate_x
	gallery.rotate_y = typeof init.rotate_y === 'boolean' ? init.rotate_y : true
	gallery.rotate_z = init.rotate_z || defaults.rotate_z
	gallery.bg_color = init.bg_color  || defaults.bg_color
	gallery.view = init.view  || defaults.view
	gallery.camera_dist = init.camera_dist  || defaults.camera_dist
	gallery.intensity = init.intensity  || defaults.intensity
	gallery.light = init.light  || defaults.light
	gallery.overlay = init.overlay || defaults.overlay
	gallery.aspect_ratio = init.aspect_ratio  || defaults.aspect_ratio

	gallery.preview_type = init.preview_type

	// console.log( Object.keys( init ))
	// console.log( gallery )

	// calculated
	gallery.res_key = typeof init.res_key === 'number' ? init.res_key : resolutions.length - 1


	// state
	gallery.animating = false


	// threejs eles
	gallery.SCENE = new Scene()
	gallery.RENDERER = new WebGLRenderer({ 
		antialias: true,
		alpha: true
	})
	gallery.canvas = gallery.RENDERER.domElement
	gallery.canvas.height = gallery.canvas.width * gallery.aspect_ratio

	// debugger
	// console.log( gallery.canvas.width , gallery.canvas.height )


	if( gallery.light === 'directional' ){
		gallery.LIGHT = new DirectionalLight( 0xffffff, gallery.scaled_intensity )
	}else{
		//
	}
	gallery.CAMERA = new PerspectiveCamera( 30, window.innerWidth / window.innerHeight, 1, gallery.view )

	gallery.SCENE.add( gallery.LIGHT )
	gallery.SCENE.add( gallery.CAMERA )

	// dom
	if( gallery.overlay ){
		gallery.canvas.classList.add('threepress-overlay')
		overlays.push( gallery )
	}


	// console.log('instantiate: ', gallery )










	let now// , delta//, delta_seconds
	// let then = 0

	const start_animation = () => { // single frame updates
		gallery.animating = true
		animate_controls()
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


	const scroll_canvas = e => {
		console.log('ya')
		for( const gallery of galleries ){
			gallery_bound = gallery.canvas.getBoundingClientRect()
			gallery_top = window.pageYOffset + gallery_bound.top
			if( e.clientX > gallery_bound.left && e.clientX < gallery_bound.left + gallery_bound.width ){
				if( e.clientY > gallery_top && e.clientY < gallery_top + gallery_bound.height ){
					gallery.RENDERER.render( gallery.SCENE, gallery.CAMERA )
					if( gallery.orbit_controls ) gallery.orbit_controls.update()
				}
			}
		}
	}










	gallery.init_scene = async() => { // lights camera action

		if( !gallery.validate( true )) return { msg: 'failed to init scene' }

		// model
		let model
		if( gallery.model ){
			const m = gallery.model
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

			gallery.SCENE.add( model )

			const radius = model.userData.radius
			const diam = radius * 2

			gallery.CAMERA.far = radius * 100

			gallery.CAMERA.position.set( 0, radius, radius * gallery.camera_dist )
			gallery.LIGHT.position.set( diam, diam, diam )
			gallery.CAMERA.lookAt( model.position )
			gallery.LIGHT.lookAt( model.position )

		}

		if( gallery.controls === 'orbit' ){
			gallery.orbit_controls = new OrbitControls( gallery.CAMERA, gallery.canvas )
			gallery.orbit_controls.enableZoom = false // implement this yourself so it doesn't jack scroll
		}

		gallery.scale('rotate')
		gallery.scale('intensity')

		if( gallery.bg_color )  gallery.canvas.style.background = gallery.bg_color

		return {
			success: true
		}

	}




	gallery.fill_model_guid = () => {
		gallery.model = gallery.model || {}
		const mc = gallery_form.querySelector('#model-choice .threepress-row')
		if( mc ){
			gallery.model.guid = mc.querySelector('.url input').value.trim()
		}
	}




	gallery.validate = pop_errors => {

		const invalidations = []

		// model guid
		if( !gallery.model.guid || !gallery.model.guid.match(/\.glb/) ) invalidations.push('invalid or missing model - must be glb format')	

		// NaN's
		// console.log( gallery.rotate_scene )
		if( gallery.rotate_scene ){
			if( isNaN( gallery.rotate_speed ) ) invalidations.push('invalid rotation speed')
		}

		if( invalidations.length ){
			if( pop_errors ){
				for( const msg of invalidations ) hal('error', msg, 8000 )
			}
			return false
		}

		return true

	}




	gallery.gen_shortcode = () => {

		let shortcodes = ''
		for( const key of shortcode_values ){
			if( gallery[ key ] ){
				shortcodes += tag( key, gallery[ key ] )
			}
		}

		if( shortcodes ){
			gallery.shortcode = '[threepress ' + shortcodes + ']'.replace(/ \]/, '')
			return gallery.shortcode
		}

		return ''

	}



	gallery.reset_form = ( form ) => {

		for( const key of shortcode_values ) gallery[ key ] = defaults[ key ]

	}


	
	gallery.ingest_form = form => {

		gallery.reset_form( form )

		// chosen model
		const model_row = form.querySelector('.threepress-row')
		if( model_row ){
			gallery.model_id = model_row.getAttribute('data-id')
		}
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


	}






	gallery.ingest_shortcode = shortcode => {

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
			if( !shortcode_values.includes( split[0] )){
				console.log('invalid shortcode value', split[0], arr )
				continue
			}
			escrow[ split[0] ] = split[1].replace(/%%/, ' ')
		}
		if( invalid ){
			hal('error', 'failed to parse shortcode', 5000 )
			return 
		}
		if( typeof Number( gallery.model_id ) !== 'number' ){
			hal('error', 'invalid model id', 5000 )
			return
		}

		for( const key in escrow ) gallery[ key ] = escrow[ key ]

		gallery.shortcode = shortcode

		return arr
	}




	gallery.hydrate_editor = async( form, shortcode, shortcode_id ) => {

		const model_choice = form.querySelector('#model-choice')

		const is_new = !shortcode_id 

		if( !is_new ){
			form.setAttribute('data-shortcode-id', shortcode_id )
			form.classList.add('editing')		
		}else{
			form.removeAttribute('data-shortcode-id')
			form.classList.remove('editing')		
		}

		// validate
		if( shortcode ) gallery.ingest_shortcode( shortcode )

		// name
		const name = gallery.name.replace(/%/g, ' ')
		form.querySelector('input[name=gallery_name]').value = name

		// hydrate model
		model_choice.innerHTML = ''
		if( !is_new ){
			// console.log( gallery.model_id )
			const res = await fetch_wrap( ajaxurl, 'post', {
				action: 'get_model',
				id: gallery.model_id,
			})
			if( !res || !res.success ){
				hal('error', 'failed to retrieve model', 5000)
				console.log( res )
				return
			}
			const model = res.model
			const new_model = new ModelRow( model )
			model_choice.appendChild( new_model.gen_row() )
		}

		// bg color
		form.querySelector('input[name=bg_color]').value = gallery.bg_color
		// controls
		for( const option of form.querySelectorAll('input[name=options_controls]')){
			if( option.value === gallery.controls ) option.checked = true
		}
		// allow zoom
		form.querySelector('input[name=allow_zoom]').checked = gallery.allow_zoom ? true : false

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
		const contingents = rotate_scene.parentElement.parentElement.querySelectorAll('.contingent')
		set_contingents( contingents, rotate_scene.checked )

		// shortcode
		form.querySelector('#shortcode').value = gallery.shortcode// render_shortcode()

		form.style.display = 'inline-block'
		// add_gallery.querySelector('div').innerText = '-'

		window.scroll({
			top: window.pageYOffset + form.getBoundingClientRect().top - 50,
			behavior: 'smooth',
		})

		hal('success', 'editing "' + name + '"', 3000 )

	}





	gallery.scale = type => {
		switch( type ){

			case 'intensity':
				gallery.scaled_intensity = ( gallery.intensity / 10 ) * 3
				break;

			case 'rotate':
				gallery.scaled_rotate = gallery.rotate_speed / 1000
				// console.log('we do attempt though', gallery.rotate_speed )

				break;

			default: break;
		}
	}








	gallery.gen_row = () => {

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
		thumb_img.src = THREEPRESS.plugin_url + 'assets/icon_original.png'
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
		shortcode.value = gallery.shortcode
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
						console.log( res )
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

				gallery.hydrate_editor( gallery_form, shortcode.value.trim(), gallery.id )
				.catch( err => {
					console.log( err )
				})

			}
		})

		return row

	}








	gallery.align = () => { // for image overlays

		if( !gallery.overlay ){
			console.log('threepress: invalid align called', this )
			return
		}
		const bounds = gallery.overlay.getBoundingClientRect()
		gallery.canvas.style.top = bounds.top + 'px'
		gallery.canvas.style.left = bounds.left + 'px'
		gallery.canvas.style.width = bounds.width + 'px'
		gallery.canvas.style.height = bounds.height + 'px'

	}

	gallery.make_visible = target => {

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
		gallery.init_scene()
		.then( res => {

			if( res.success ){

				viewer.appendChild( gallery.canvas )

				gallery.set_renderer()

				if( gallery.rotate_scene ){

					gallery.animating = true
					gallery.orbit_controls ? animate_controls() : animate()

				}else{

					gallery.RENDERER.render( gallery.SCENE, gallery.CAMERA )

					gallery.canvas.parentElement.addEventListener('pointerdown', start_animation )
					gallery.canvas.parentElement.addEventListener('pointerup', stop_animation )
					if( !bound_wheel ){
						window.addEventListener('wheel', scroll_canvas ) // mouse
						bound_wheel = true
					}

				}

				if( !galleries.includes( gallery )) galleries.push( gallery )

			}else{
				console.log('gallery display fail: ', res )
			}
		})
		.catch( err => {
			console.log( err )
		})	
	}

	gallery.preview = () => {

		// gallery.scale('rotate')
		// gallery.scale('intensity')
		gallery.fill_model_guid()

		gallery.init_scene()
		.then( res => {
			if( res.success ){

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

				hal('error', res.msg || 'failed to init', 4000 )

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


