import Canvas from './Canvas.js'

import model_selector from './model_selector.js'

import {
	hal,
	fetch_wrap,
} from './lib.js'


const tag = ( key , value ) => {
	return value ? `${ key }=${ value } ` : ''
}

const values = {
	model_id: undefined, 
	name: undefined, 
	controls: undefined, 
	light: undefined, 
	camera_user_zoom: undefined, 
	camera_user_rotate: undefined, 
	camera_dist: undefined, 
	rotate_scene: undefined, 
	rotate_speed: undefined,
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
	values.camera_user_zoom = gallery_form.querySelector('input[name=camera_user_zoom]').checked
	values.camera_user_rotate = gallery_form.querySelector('input[name=camera_user_rotate]').checked
	values.camera_dist = gallery_form.querySelector('input[name=camera_dist').value

	// misc
	values.rotate_scene = gallery_form.querySelector('input[name=rotate_scene]').checked
	if( values.rotate_scene ){
		values.rotate_speed = gallery_form.querySelector('input[name=rotate_speed]').value
	}else{
		values.rotate_speed = undefined
	}

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






export default ( wrap, gallery_form ) => {

	const model_choice = wrap.querySelector('#model-choice')
	const shortcode = wrap.querySelector('#shortcode')
	const choose_model = wrap.querySelector('#choose-model')
	const preview = wrap.querySelector('#gallery-preview')

	const label_selections = wrap.querySelectorAll('.threepress-options-category .selection label')

	for( const label of label_selections ){
		label.addEventListener('click', () => {
			const input = label.parentElement.querySelector('input')
			if( input.type === 'radio' || input.type === 'checkbox') input.click()
		})
	}

	choose_model.addEventListener('click', () => {
		model_selector(( id, row ) => {
			model_choice.innerHTML = ''
			model_choice.appendChild( row )
			shortcode.value = render_shortcode( gallery_form )
		})
	})

	gallery_form.addEventListener('submit', e => {
		e.preventDefault()
		fetch_wrap( ajaxurl, 'post', {
			action: 'save_shortcode',
			name: gallery_form.querySelector('input[name=gallery_name]').value.trim(),
			content: shortcode.value.trim(),
		}, false)
		.then( res => {
			if( res.success ){
				const g = new GalleryRow( res.gallery )
				gallery_content.prepend( g.gen_row() )
			}
			console.log( res )
		})
		.catch( err => {
			console.log( err )
		})
	})

	gallery_form.addEventListener('keyup', e => {
		if( e.keyCode === 27 ) return
		shortcode.value = render_shortcode( gallery_form )
	})

	gallery_form.addEventListener('click', () => {
		shortcode.value = render_shortcode( gallery_form )

	})

	preview.addEventListener('click', async() => {

		const model_choice = document.querySelector('#model-choice .column.url input')
		if( !model_choice ){
			hal('error', 'no model chosen', 4000 )
			return
		}

		const init = Object.assign( {}, values )
		// delete init.model_id
		init.model = {
			guid: document.querySelector("#model-choice .url input").value.trim()
		}

		const canvas = Canvas( init )

		canvas.preview()

	})

}