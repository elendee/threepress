import Gallery from './Gallery.js'
// import BROKER from './helpers/EventBroker.js'

// import model_selector from './model_selector.js'

import {
	hal,
	fetch_wrap,
	model_selector,
	// GalleryRow,
	// ModelRow,
	set_contingents,
} from './lib.js'




// value DOM holders
let model_choice, shortcode, color_picker, bg_color

const gallery_form = document.querySelector('#gallery-form')
// const add_gallery = document.querySelector('#create-toggle')

// value names
// let values = {
// 	model_id: undefined, 
// 	name: undefined, 
// 	controls: undefined, 
// 	light: undefined, 
// 	// camera_user_zoom: undefined, 
// 	// camera_user_rotate: undefined, 
// 	camera_dist: undefined, 
// 	rotate_scene: undefined, 
// 	rotate_speed: undefined,
// 	rotate_x: undefined,
// 	rotate_y: undefined,
// 	rotate_z: undefined,
// 	bg_color: undefined,
// }













const render_shortcode = () => {

	const gallery = Gallery()
	gallery.ingest_form( gallery_form )

	gallery.gen_shortcode()

	return gallery.shortcode
	
}















export default ( gallery_content ) => {

	model_choice = gallery_form.querySelector('#model-choice')
	shortcode = gallery_form.querySelector('#shortcode')
	color_picker = gallery_form.querySelector("#gallery-options input[type=color]")
	bg_color = gallery_form.querySelector('input[name=bg_color]')


	const label_selections = gallery_form.querySelectorAll('.threepress-options-category .selection label')

	for( const label of label_selections ){
		label.addEventListener('click', () => {
			const input = label.parentElement.querySelector('input')
			if( input.type === 'radio' || input.type === 'checkbox') input.click()
		})
	}




	// preview gallery
	gallery_form.querySelector('#gallery-preview').addEventListener('click', () => {

		const gallery = Gallery()
		gallery.ingest_form( gallery_form )

		gallery.preview()

	})




	// save gallery
	gallery_form.addEventListener('submit', e => {
		e.preventDefault()

		const gallery = Gallery()
		gallery.ingest_form( gallery_form )

		gallery.fill_model_guid()

		if( !gallery.validate( true )) return

		fetch_wrap( ajaxurl, 'post', {
			action: 'save_shortcode',
			name: gallery_form.querySelector('input[name=gallery_name]').value.trim(),
			shortcode: shortcode.value.trim(),
		}, false)
		.then( res => {
			if( res.success ){
				const gallery = Gallery( res.gallery )
				gallery_content.prepend( gallery.gen_row() )
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


	// close gallery
	gallery_form.querySelector('#close-gallery').addEventListener('click', () => {

		gallery_form.style.display = 'none'
		
	})


	// custom form behaviors
	gallery_form.addEventListener('click', e => {

		if( e.target.id === 'choose-model'){

			model_selector(( id, row ) => {
				model_choice.innerHTML = ''
				model_choice.appendChild( row )
				shortcode.value = render_shortcode()
			})

		}else if( e.target.name === 'rotate_scene'){

			set_contingents( e.target.parentElement.parentElement.querySelectorAll('.contingent'), e.target.checked )

		}

		shortcode.value = render_shortcode()

	})



	gallery_form.querySelector('input[name=bg_color]').addEventListener('keyup', e => {

		e.target.value = e.target.value.replace(/ /g, '')

		shortcode.value = render_shortcode()

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

	// 	const gallery = gallery( init )

	// 	gallery.preview()

	// })

}
















// BROKER.subscribe('THREEPRESS_HYDRATE_EDITOR', hydrate_editor )