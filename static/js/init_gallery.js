import Canvas from './Canvas.js'

import model_selector from './model_selector.js'

import {
	hal,
} from './lib.js'



const render_shortcode = gallery_form => {
	if( !shortcode ) return
	let model_id
	const model = gallery_form.querySelector('.threepress-row')
	if( model ){
		model_id = model.getAttribute('data-id')
	}
	const name = gallery_form.querySelector('input[name=gallery_name]').value.trim()
	if( model_id || name ){
		return `[threepress ${ name ? 'name=' + name + ' ' : '' }${ model_id ? 'model_id=' + model_id + ' ' : '' }]`.replace(' ]', ']')
	}
	return ''
}



// const generate_gallery_row = gallery => {
// 	const row = document.createElement('div')
// 	row.classList.add('row')
// 	const title = document.createElement('div')
// 	title.classList.add('column', 'column-3')
// 	title.title = 'gallery title'
// 	title.innerText = gallery.title
// 	//
// 	//
// 	//
// 	return row 
// }





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

	// let parent
	// for( const cat of options ){
	// 	cat.addEventListener('click', () => {
	// 		parent = cat.parentElement
	// 		if( parent.classList.contains('dropped')){
	// 			parent.classList.remove('dropped')
	// 		}else{
	// 			parent.classList.add('dropped')
	// 		}
	// 	})
	// }


	choose_model.addEventListener('click', () => {
		model_selector(( id, row ) => {
			model_choice.innerHTML = ''
			model_choice.appendChild( row )
			shortcode.value = render_shortcode( gallery_form )
		})
	})

	gallery_form.addEventListener('submit', e => {
		e.preventDefault()
		// const model_row = gallery_form.querySelector('.threepress-row')
		fetch_wrap( ajaxurl, 'post', {
			action: 'save_shortcode',
			name: gallery_form.querySelector('input[name=gallery_name]').value.trim(),
			content: shortcode.value.trim(),
			// model_id: model_row ? model_row.getAttribute('data-id') : undefined,
			// model_url: model_row ? model_row.querySelector('.column.url').innerHTML : undefined,
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

	preview.addEventListener('click', async() => {

		const model_choice = document.querySelector('#model-choice .column.url input')
		if( !model_choice ){
			hal('error', 'no model chosen', 4000 )
			return
		}

		shortcode.value = render_shortcode( gallery_form )

		const canvas = Canvas({
			model: {
				guid: model_choice.value.trim()
			},
			name: document.querySelector('input[name=gallery_name]').value.trim()
		})

		canvas.preview()

	})

}