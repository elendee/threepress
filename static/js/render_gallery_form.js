import Canvas from './Canvas.js'

import model_selector from './model_selector.js'

import {
	hal,
	fetch_wrap,
	GalleryRow,
} from './lib.js'




// value DOM holders
let model_choice, model_input, shortcode, color_picker, bg_color

// value names
const values = {
	model_id: undefined, 
	name: undefined, 
	controls: undefined, 
	light: undefined, 
	// camera_user_zoom: undefined, 
	// camera_user_rotate: undefined, 
	camera_dist: undefined, 
	rotate_scene: undefined, 
	rotate_speed: undefined,
	rotate_x: undefined,
	rotate_y: undefined,
	rotate_z: undefined,
	bg_color: undefined,
}

const tag = ( key , value ) => {
	return value ? `${ key }=${ value } ` : ''
}






const validate = ( gallery_form, pop_errors ) => {

	const invalidations = []

	model_input = model_choice.querySelector('.url input')

	if( !model_input || !model_input.value || !model_input.value.match(/\.glb$/)) invalidations.push('invalid or missing model - must be glb format')

	if( invalidations.length ){
		if( pop_errors ){
			for( const msg of invalidations ) hal('error', msg, 5000 )
		}
		return false
	}

	return true

}








const render_shortcode = gallery_form => {

	for( const key in values ) values[ key ] = undefined

	// chosen model
	const model = gallery_form.querySelector('.threepress-row')
	if( model ){
		values.model_id = model.getAttribute('data-id')
	}
	// gallery name
	values.name = gallery_form.querySelector('input[name=gallery_name]').value.trim()

	// controls & light
	const radios = {
		controls: gallery_form.querySelectorAll('input[name=options_controls]'),
		light: gallery_form.querySelectorAll('input[name=options_light]'),
	}
	for( const opt of radios.controls ) if( opt.checked ) values.controls = opt.value
	for( const opt of radios.light ) if( opt.checked ) values.light = opt.value
	values.intensity = gallery_form.querySelector('input[name=intensity]').value

	// camera
	values.camera_dist = gallery_form.querySelector('input[name=camera_dist').value

	// rotation
	values.rotate_scene = gallery_form.querySelector('input[name=rotate_scene]').checked
	if( values.rotate_scene ){
		values.rotate_speed = gallery_form.querySelector('input[name=rotate_speed]').value
	}else{
		values.rotate_speed = undefined
	}
	values.rotate_x = gallery_form.querySelector('input[name=rotate_x]').checked
	values.rotate_y = gallery_form.querySelector('input[name=rotate_y]').checked
	values.rotate_z = gallery_form.querySelector('input[name=rotate_z]').checked

	// bg color
	values.bg_color = gallery_form.querySelector('input[name=bg_color]').value.trim()

	let shortcodes = ''
	for( const key in values ){
		if( values[ key ] ){
			shortcodes += tag( key, values[ key ] )
		}
	}
	if( shortcodes ){
		return `[threepress ${ shortcodes }]`.replace(' ]', ']')
	}
	return ''
}















export default ( gallery_form, gallery_content ) => {

	model_choice = gallery_form.querySelector('#model-choice')
	shortcode = gallery_form.querySelector('#shortcode')
	color_picker = gallery_form.querySelector("#gallery-options input[type=color]")
	bg_color = gallery_form.querySelector('input[name=bg_color]')

	// const choose_model = gallery_form.querySelector('#choose-model')
	// const preview = gallery_form.querySelector('#gallery-preview')

	const label_selections = gallery_form.querySelectorAll('.threepress-options-category .selection label')

	for( const label of label_selections ){
		label.addEventListener('click', () => {
			const input = label.parentElement.querySelector('input')
			if( input.type === 'radio' || input.type === 'checkbox') input.click()
		})
	}

	gallery_form.addEventListener('keyup', e => {
		if( e.keyCode === 27 ) return
		shortcode.value = render_shortcode( gallery_form )
	})

	gallery_form.addEventListener('click', e => {

		if( e.target.id === 'choose-model'){
			model_selector(( id, row ) => {
				model_choice.innerHTML = ''
				model_choice.appendChild( row )
				shortcode.value = render_shortcode( gallery_form )
			})

		}else if( e.target.parentElement.id === 'gallery-preview' ){

			if( !validate( gallery_form, true ) ) return

			const init = Object.assign( {}, values )
			// delete init.model_id
			init.model = {
				guid: document.querySelector("#model-choice .url input").value.trim()
			}

			const canvas = Canvas( init )

			canvas.preview()

		}else if( e.target.name === 'rotate_scene'){

			const contings = e.target.parentElement.parentElement.querySelectorAll('.contingent')
			for( const ele of contings ){
				e.target.checked ? ele.classList.remove('threepress-disabled') : ele.classList.add('threepress-disabled')
			}

		}

		shortcode.value = render_shortcode( gallery_form )

	})

	gallery_form.addEventListener('submit', e => {
		e.preventDefault()

		if( !validate( gallery_form, true ) ) return

		fetch_wrap( ajaxurl, 'post', {
			action: 'save_shortcode',
			name: gallery_form.querySelector('input[name=gallery_name]').value.trim(),
			content: shortcode.value.trim(),
		}, false)
		.then( res => {
			if( res.success ){
				const g = new GalleryRow( res.gallery )
				gallery_content.prepend( g.gen_row() )
				hal('success', 'success', 5000 )
			}else{
				hal('error', res.msg || 'error saving', 5000 )
				console.log( res )
			}
		})
		.catch( err => {
			hal('error', err.msg || 'error saving', 5000 )
			console.log( err )
		})
	})

	color_picker.addEventListener('change', e => {
		bg_color.value = color_picker.value
	})

	// preview.addEventListener('click', async() => {

	// 	const model_choice = document.querySelector('#model-choice .column.url input')
	// 	if( !model_choice ){
	// 		hal('error', 'no model chosen', 4000 )
	// 		return
	// 	}

	// 	const init = Object.assign( {}, values )
	// 	// delete init.model_id
	// 	init.model = {
	// 		guid: document.querySelector("#model-choice .url input").value.trim()
	// 	}

	// 	const canvas = Canvas( init )

	// 	canvas.preview()

	// })

}