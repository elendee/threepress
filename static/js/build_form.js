// import { DynamicBufferAttribute } from '../inc/three.module.js'
// import Gallery from './Gallery.js'
import {
	model_selector,
	set_contingents,
	hal,
	fetch_wrap,
	get_row,
	insertAfter,
	build_option,
} from './lib.js'




const build_section = ( name ) => {
	const section = document.createElement('div')
	section.classList.add('gallery-section')
	const header = document.createElement('h4')
	header.innerHTML = name
	section.appendChild( header )
	return section
}

const build_category = name => {
	const category = document.createElement('div')
	category.classList.add('threepress-options-category')
	const header = document.createElement('h4')
	header.innerHTML = name
	category.appendChild( header )
	return category
}






export default ( gallery, output_container ) => {

	//////////////////////////////////////////////// build

	const form = document.createElement('div')
	form.id = 'gallery-form'
	// form.action = 'create-gallery.php'
	form.method = 'post'

	gallery.form = form

	// preview toggle
	const preview = document.createElement('div')
	preview.id = 'gallery-preview'
	preview.classList.add('threepress-button')
	preview.title = 'gallery preview'
	const preview_img = document.createElement('img')
	preview_img.src = THREEPRESS.plugin_url + '/assets/eye-viz.png'
	preview.appendChild( preview_img )
	form.appendChild( preview )

	// gallery name
	const name = build_section('gallery name')
	const input_name = document.createElement('input')
	input_name.name = 'gallery_name'
	input_name.type = 'text'
	input_name.placeholder = 'gallery name (not displayed publicly)'
	name.appendChild( input_name )
	const clar_name = document.createElement('div')
	clar_name.classList.add('clarification')
	clar_name.innerHTML = 'This will also append an <code>id</code> to the gallery element of form <code>#threepress-gallery-[name]</code>'
	name.appendChild( clar_name )
	form.appendChild( name )

	// gallery model choose
	const model = build_section('gallery model (required)')
	const p_model = document.createElement('p')
	const model_choice = document.createElement('div')
	model_choice.id = 'model-choice'
	p_model.appendChild( model_choice )
	model.appendChild( p_model )
	const choose = document.createElement('div')
	choose.id = 'choose-model'
	choose.classList.add('button', 'button-primary')
	choose.innerHTML = 'choose a model'
	model.appendChild( choose )
	form.appendChild( model )

	// gallery options
	const options = build_section('gallery options')
	const options_content = document.createElement('div')
	options_content.id = 'gallery-options'
	options.appendChild( options_content )

	// option - controls
	const controls = build_category('controls')
	options_content.append( controls )
	const controls_options = ['none', 'orbit', 'first', 'flight']
	const disabled_opt = ['first', 'flight']
	let opt
	for( let i = 0; i < controls_options.length; i++ ){
		opt = build_option( 'radio', 'options_controls', controls_options[i], controls_options[i], false, false, {}, i === 0 )
		if( disabled_opt.includes( controls_options[i] ) ) opt.classList.add('threepress-disabled')
		controls.appendChild( opt )
	}

	// option - bg
	const bg = build_category('background')
	const options_picker = build_option('color', 'bg_color_selector', false, ' ' )
	const options_bg = build_option('text', 'bg_color', false, 'use picker or any valid css' )
	bg.appendChild( options_picker )
	bg.appendChild( options_bg )
	options_content.appendChild( bg )

	// option - light
	const light = build_category('light')
	const light_options = ['directional', 'sun', 'hemispherical']
	const disabled_light = ['hemispherical', 'sun']
	let light_opt
	for( let i = 0; i < light_options.length; i++ ){
		opt = build_option('radio', 'options_light', light_options[i], light_options[i], false, false, {}, i === 0 )
		if( disabled_light.includes( light_options[i] ) ) opt.classList.add('threepress-disabled')
		light.appendChild( opt )
	}
	const intensity = build_option('range', 'intensity', 5, false, false, false, {
		min: 1,
		max: 15,
	})
	light.appendChild( intensity )
	options_content.appendChild( light )

	// option - camera
	const camera = build_category('camera')
	// allow zoom, zoom speed, initial zoom
	const zoom = build_option('checkbox', 'allow_zoom', false, 'allow zoom', false, false )
	const zoom_speed = build_option('range', 'zoom_speed', false, false, false, { min: 1, max: 12, })
	const initial_zoom = build_option('range', 'camera_dist', 10, 'initial zoom', false, false, { min: 1, max: 20 })
	camera.appendChild( zoom )
	camera.appendChild( zoom_speed )
	camera.appendChild( initial_zoom )
	options_content.appendChild( camera )
									

	// option - rotation
	const rotation = build_category('rotation')
	const auto = build_option('checkbox', 'rotate_scene', false, 'auto rotate', false, false)
	rotation.appendChild( auto )
	const rotate_speed = build_option('range', 'rotate_speed', 20, 'rotation speed', false, true, { min: 1, max: 50 })
	rotation.appendChild( rotate_speed )
	const rot_x = build_option('checkbox', 'rotate_x', false, false, false, true)
	const rot_y = build_option('checkbox', 'rotate_y', false, false, false, true)
	const rot_z = build_option('checkbox', 'rotate_z', false, false, false, true)
	rotation.appendChild( rot_x )
	rotation.appendChild( rot_y )
	rotation.appendChild( rot_z )
	options_content.appendChild( rotation )

	form.appendChild( options )

	// gallery shortcode
	const shortcode = build_section('gallery shortcode')
	const p_code = document.createElement('p')
	shortcode.appendChild( p_code )
	const text = document.createElement('textarea')
	text.id = 'shortcode'
	text.placeholder = 'generated shortcode will appear here'
	text.readonly = true
	p_code.appendChild( text )
	shortcode.appendChild( p_code )
	form.appendChild( shortcode )

	// gallery save / close
	const manage = document.createElement('p')
	const save = document.createElement('div')
	save.innerText = gallery.location === 'product' ? 'set' : 'save'
	save.id = 'create-gallery'
	save.classList.add('button', 'button-primary')

	const close = document.createElement('div')
	close.id = 'close-gallery'
	close.innerText = 'close'
	close.classList.add('button', 'button-primary')

	const menu_clar = document.createElement('div')
	menu_clar.innerHTML = 'you do not have to save a shortcode to use it - saving is just for reference'
	menu_clar.classList.add('clarification')
	manage.appendChild( save )
	manage.appendChild( close )
	manage.appendChild( menu_clar )
	form.appendChild( manage )




	//////////////////////////////////////////////// bind


	// general updates

	form.addEventListener('click', e => {

		// console.log( e.target.id, e.target.name )

		let contingents

		if( e.target.id === 'choose-model'){

			model_selector(( id, model_row ) => {
				model_choice.innerHTML = ''
				model_row.form = form
				model_choice.appendChild( model_row.gen_row() )
				shortcode.value = gallery.render_shortcode() //  form 
			})

		}else if( e.target.name === 'rotate_scene'){

			contingents = e.target.parentElement.parentElement.querySelectorAll('.contingent')

			set_contingents( contingents, e.target.checked )

		}else if( e.target.name === 'allow_zoom' ){

			contingents = [form.querySelector('input[name=zoom_speed]')]

			set_contingents( contingents, e.target.checked )

		}
		// else if( e.target.name === 'options_controls'){

		// 	contingents = form.querySelectorAll('')

		// }

	})


	for( const input of form.querySelectorAll('input') ){
		input.addEventListener('change', e => {
			shortcode.value = gallery.render_shortcode() // gallery.form
		})
	}


	// custom updates

	const label_selections = form.querySelectorAll('.threepress-options-category .selection label')
	for( const label of label_selections ){
		label.addEventListener('click', () => {
			const input = label.parentElement.querySelector('input')
			if( input.type === 'radio' || input.type === 'checkbox') input.click()
		})
	}

	form.querySelector('input[name=bg_color]').addEventListener('keyup', e => {
		e.target.value = e.target.value.replace(/ /g, '')
	})

	const color_picker = form.querySelector("#gallery-options input[type=color]")
	const bg_color = form.querySelector('input[name=bg_color]')
	color_picker.addEventListener('change', e => {
		bg_color.value = color_picker.value
	})


	// form preview

	form.querySelector('#gallery-preview').addEventListener('click', () => {

		gallery.ingest_form( form )

		gallery.preview()

	})


	// saving

	save.addEventListener('click', e => {

		e.preventDefault()

		gallery.ingest_form()

		if( !gallery.validate( true, true, true )) return

		const editing = gallery.form.getAttribute('data-shortcode-id') ? true : false

		const shortcode_id = gallery.form.getAttribute('data-shortcode-id')
		console.log('saving:', shortcode_id )

		if( gallery.location === 'product' ){
			const metabox = output_container.parentElement.parentElement // document.querySelector('#threepress-product-options')
			output_container.innerHTML = ''
			const new_row = gallery.gen_row()
			output_container.appendChild( new_row )
			gallery.form.style.display = 'none'
			window.scroll({
				top: window.pageYOffset + metabox.getBoundingClientRect().top - 120,
				behavior: 'smooth',
			})
			const toggle = document.querySelector('#threepress-product-options .inside>.button')
			if( toggle ) toggle.innerHTML = '+'
			return
		}

		fetch_wrap( ajaxurl, 'post', {
			action: 'save_shortcode',
			shortcode_id: shortcode_id,
			name: gallery.form.querySelector('input[name=gallery_name]').value.trim(),
			shortcode: shortcode.value.trim(),
		}, false)
		.then( res => {

			if( res.success ){

				gallery.ingest_shortcode( res.gallery.shortcode )
				gallery.edited = res.gallery.edited
				gallery.created = res.gallery.created
				gallery.id = res.gallery.id 
				gallery.form.classList.add('editing')
				gallery.form.setAttribute('data-shortcode-id', res.gallery.id )
				if( output_container ){
					const new_row = gallery.gen_row()
					if( !output_container.getAttribute('data-stackable') ){ // product pages
						output_container.innerHTML = ''
						output_container.prepend( new_row )
						gallery.form.style.display = 'none'
					}else{ // admin pages
						const old_row = get_row( document.querySelector('#model-galleries .content'), res.gallery.id )
						if( editing ){
							insertAfter( new_row, old_row )
							old_row.remove()
						}else{
							output_container.prepend( new_row )
						}

					}

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


	// closing
	close.addEventListener('click', e => {
		e.preventDefault()
		const target = gallery.form.parentElement
		gallery.form.style.display = 'none'
		const toggle = document.querySelector('#threepress-product-options .inside>.button')
		if( toggle ){
			toggle.innerHTML = '+'
			toggle.style.display = 'inline-block'
		}
		setTimeout( () => {
			const top = window.pageYOffset + target.getBoundingClientRect().top - 150
			window.scroll({
				top: top,
				behavior: 'smooth',
			})
		}, 100)
	})

	return form

}



