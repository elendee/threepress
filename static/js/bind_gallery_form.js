import Gallery from './Gallery.js'

import {
	hal,
	fetch_wrap,
	model_selector,
	set_contingents,
	insertAfter,
} from './lib.js'




// value DOM holders
let model_choice, shortcode, color_picker, bg_color






// const render_shortcode = gallery_form => {

// 	const gallery = Gallery({
// 		form: gallery_form,
// 	})
// 	gallery.ingest_form()

// 	gallery.gen_shortcode()

// 	return gallery.shortcode
	
// }












export default ( gallery_form, gallery_content ) => {

	// const attributes = gallery_form.querySelectorAll('input')

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

		if( !gallery.validate( true, true, true )) return

		const editing = gallery_form.getAttribute('data-shortcode-id') ? true : false

		fetch_wrap( ajaxurl, 'post', {
			action: 'save_shortcode',
			shortcode_id: gallery_form.getAttribute('data-shortcode-id'),
			name: gallery_form.querySelector('input[name=gallery_name]').value.trim(),
			shortcode: shortcode.value.trim(),
		}, false)
		.then( res => {
			if( res.success ){
				const gallery = Gallery( res.gallery )
				gallery.ingest_shortcode( res.gallery.shortcode )
				gallery_form.classList.add('editing')
				gallery_form.setAttribute('data-shortcode-id', res.gallery.id )
				const new_row = gallery.gen_row()
				const old_row = get_row( document.querySelector('#model-galleries .content'), res.gallery.id )
				if( !editing ){
					gallery_content.prepend( new_row )
				}else{
					insertAfter( new_row, old_row )
					old_row.remove()
				}
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
	// gallery_form.addEventListener('click', e => {

	// 	if( e.target.id === 'choose-model'){

	// 		model_selector(( id, row ) => {
	// 			model_choice.innerHTML = ''
	// 			model_choice.appendChild( row )
	// 			shortcode.value = render_shortcode( gallery_form )
	// 		})

	// 	}else if( e.target.name === 'rotate_scene'){

	// 		set_contingents( e.target.parentElement.parentElement.querySelectorAll('.contingent'), e.target.checked )

	// 	}else if( e.target.name === 'allow_zoom' ){

	// 		set_contingents( [gallery_form.querySelector('input[name=zoom_speed]')], e.target.checked )

	// 	}

	// })

	gallery_form.querySelector('input[name=bg_color]').addEventListener('keyup', e => {
		e.target.value = e.target.value.replace(/ /g, '')
	})

	color_picker.addEventListener('change', e => {
		bg_color.value = color_picker.value
	})


	// editing
	// for( const input of attributes ){
	// 	input.addEventListener('change', e => {
	// 		shortcode.value = render_shortcode( gallery_form )
	// 	})
	// }


}



