import * as lib from './lib.js?v=130'







const build_section = ( name ) => {
	const section = document.createElement('div')
	section.classList.add('gallery-section')
	const header = document.createElement('h3')
	header.innerHTML = name
	if( name !== 'section-toggle' ){
		header.classList.add('section-toggle')
		let hidden = false
		header.addEventListener('click', () => {
			section.classList.toggle('threepress-section-hidden')
		})
	}

	section.appendChild( header )
	return section
}




const build_category = ( name, addClass ) => {
	const category = document.createElement('div')
	category.classList.add('threepress-options-category')
	if( addClass ){
		category.classList.add( addClass )
	}
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
	preview.classList.add('threepress-button', 'form-action')
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
	const model = build_section('model (required)')
	const p_model = document.createElement('p')
	const model_choice = document.createElement('div')
	model_choice.id = 'model-choice'
	p_model.appendChild( model_choice )
	model.appendChild( p_model )
	const choose = document.createElement('div')
	choose.id = 'choose-model'
	choose.classList.add('button', 'button-primary')
	choose.innerHTML = 'choose model'
	const clips = document.createElement('div')
	clips.id = 'anim-clips'
	const clip_label = document.createElement('div')
	clip_label.innerHTML = '<h4>found animation clips:</h4>'
	model.appendChild( choose )
	model.appendChild( clip_label )
	model.appendChild( clips )
	form.appendChild( model )


	// gallery ground (texture)
	const ground = build_section('ground (optional)')
	const g_img = document.createElement('p')
	const ground_choice = document.createElement('div')
	ground_choice.id = 'ground-choice'
	g_img.appendChild( ground_choice )
	ground.appendChild( g_img )
	const choose_img = document.createElement('div')
	choose_img.id = 'choose-ground'
	choose_img.classList.add('button', 'button-primary')
	choose_img.innerHTML = 'choose ground image'
	ground.appendChild( choose_img )
	const clear_ground = document.createElement('div')
	clear_ground.innerHTML = '&times;'
	clear_ground.classList.add('button', 'button-primary', 'clear')
	ground.appendChild( clear_ground )
	clear_ground.addEventListener('click', () => {
		const selected = ground_choice.querySelector('.threepress-row')
		if( selected ) selected.remove()
		const tex_selected = ground_choice_map.querySelector('.threepress-row')
		if( tex_selected ) tex_selected.remove()
		gallery.render_shortcode()
	})
	ground.appendChild( clear_ground )
	form.appendChild( ground )

	const model_float = build_category( 'model float', 'model-float')
	const float_height = lib.build_option('number', 'float_height', 0, 'model distance from ground', false, true, { 
		min: -1000, max: 1000,
	})
	model_float.appendChild( float_height )
	const float_tip = document.createElement('div')
	float_tip.classList.add('tip', 'active')
	float_tip.innerHTML = 'tip: float does not take into account heightmaps - adjust accordingly'
	model_float.appendChild( float_tip )
	ground.appendChild( model_float )

	// gallery ground size
	const ground_dimensions = build_category('ground dimensions', 'ground-dimensions')
	const ground_dims = lib.build_positioner('ground-dimensions', gallery, 'ground' )
	ground_dimensions.appendChild( ground_dims )
	ground.appendChild( ground_dimensions )

	const ground_res = build_category( 'ground resolution', 'ground-resolution')
	const res_input = lib.build_option('range', 'ground_resolution', 1, 'ground heightmap resolution', false, true, { 
		min: 0, max: 2,
	})
	ground_res.appendChild( res_input )
	ground.appendChild( ground_res )

	// gallery ground map
	// const ground_map = build_section('ground image map (optional)')
	const g_img_map = document.createElement('p')
	const ground_choice_map = document.createElement('div')
	ground_choice_map.id = 'ground-choice-map'
	g_img_map.appendChild( ground_choice_map )
	ground.appendChild( g_img_map )

	const choose_img_map = document.createElement('div')
	choose_img_map.id = 'choose-ground-map'
	choose_img_map.classList.add('button', 'button-primary')
	choose_img_map.innerHTML = 'choose heightmap'
	ground.appendChild( choose_img_map )

	const clear_choice = document.createElement('div')
	clear_choice.innerHTML = '&times;'
	clear_choice.classList.add('button', 'button-primary', 'clear')
	ground.appendChild( clear_choice )
	clear_choice.addEventListener('click', () => {
		const selected = ground_choice_map.querySelector('.threepress-row')
		if( selected ) selected.remove()
		gallery.render_shortcode()
		gallery.set_tooltips()
	})

	const map_explain = document.createElement('div')
	map_explain.innerHTML = 'This image will be used as a <a href="https://en.wikipedia.org/wiki/Heightmap" target="_blank">heightmap</a> for the ground'
	ground.appendChild( map_explain )
	form.appendChild( ground )

	// option - controls
	const control_section = build_section('controls')
	const controls = build_category('controls')
	// options_content.append( controls )
	const controls_options = ['none', 'orbit'] // , 'first', 'flight'
	const disabled_opt = ['first', 'flight']
	let opt
	for( let i = 0; i < controls_options.length; i++ ){
		opt = lib.build_option( 'radio', 'options_controls', controls_options[i], controls_options[i], false, false, {}, i === 0 )
		if( disabled_opt.includes( controls_options[i] ) ) opt.classList.add('threepress-disabled')
		controls.appendChild( opt )
	}
	control_section.appendChild( controls )
	form.appendChild( control_section )

	// option - camera
	const camera_section = build_section('camera')
	const camera = build_category('camera')
	const zoom = lib.build_option('checkbox', 'allow_zoom', false, 'allow zoom', false, false )
	const zoom_speed = lib.build_option('range', 'zoom_speed', false, false, false, true, { min: 1, max: 50, })
	const initial_zoom = lib.build_option('range', 'initial_zoom', 5, 'initial zoom', false, false, { min: 1, max: 10 } )
	camera.appendChild( zoom )
	camera.appendChild( zoom_speed )
	camera.appendChild( initial_zoom )
	camera.appendChild( document.createElement('br') )
	// option - rotation
	const rotation = build_category('rotation')
	const auto = lib.build_option('checkbox', 'rotate_scene', false, 'auto rotate', false, false)
	rotation.appendChild( auto )
	const rotate_speed = lib.build_option('range', 'rotate_speed', 20, 'rotation speed', false, true, { min: 1, max: 50 })
	rotation.appendChild( rotate_speed )
	// options_content.appendChild( rotation )
	camera_section.appendChild( camera )
	camera_section.appendChild( rotation )
	// options_content.appendChild( camera )

	// option - no controls cam setting
	const cam_pos = build_category('camera angle', 'cam-position')
	const cam_setting = lib.build_positioner('cam-position', gallery )
	cam_pos.appendChild( cam_setting )
	camera_section.appendChild( cam_pos )
	form.appendChild( camera_section )
	// options_content.appendChild( cam_pos )

	// option - light
	const light_section = build_section('light')
	const light = build_category('light')
	const light_options = ['directional', 'sun', 'hemispherical']
	const disabled_light = ['hemispherical']
	for( let i = 0; i < light_options.length; i++ ){
		opt = lib.build_option('radio', 'options_light', light_options[i], light_options[i], false, false, {}, i === 0 )
		if( disabled_light.includes( light_options[i] ) ) opt.classList.add('threepress-disabled')
		light.appendChild( opt )
	}
	const lensflare = lib.build_option('checkbox', 'has_lensflare', true, 'lensflare', false, true )
	const intensity = lib.build_option('range', 'intensity', 5, false, false, false, {
		min: 0,
		max: 15,
	})

	light.appendChild( intensity )
	light.appendChild( lensflare )
	light_section.appendChild( light )
	// options_content.appendChild( light )

	// option - no controls light setting
	const light_pos = build_category('light angle', 'light-position')
	const light_setting = lib.build_positioner('light-position', gallery )
	light_pos.appendChild( light_setting )
	// options_content.appendChild( light_pos )
	light_section.appendChild( light_pos )


	const amb_section = build_category('ambience', 'ambience')
	const ambience = lib.build_option('range', 'ambience', 1, 'ambient light', false, true, {
		min: 0,
		max: 10,
	})
	amb_section.appendChild( ambience )
	const amb_color = lib.build_option('color', 'ambient_color', false, ' ')
	amb_section.appendChild( amb_color )
	light.appendChild( amb_section )

	// hdr
	const hdr = build_category('hdr')

	const hdr_courtyard = lib.build_option('checkbox', 'hdr_courtyard', false, 'courtyard', false, false )
	hdr.appendChild( hdr_courtyard )
	const hdr_galaxy = lib.build_option('checkbox', 'hdr_galaxy', false, 'galaxy', false, false )
	hdr.appendChild( hdr_galaxy )
	const hdr_bridge = lib.build_option('checkbox', 'hdr_bridge', false, 'bridge', false, false )
	hdr.appendChild( hdr_bridge )
	const hdr_park = lib.build_option('checkbox', 'hdr_park', false, 'park', false, false )
	hdr.appendChild( hdr_park )
	const hdr_castle = lib.build_option('checkbox', 'hdr_castle', false, 'castle', false, false )
	hdr.appendChild( hdr_castle )

	hdr.appendChild( document.createElement('br') )
	const show_hdr = lib.build_option('checkbox', 'show_hdr', false, 'show HDR image as background', false, false )
	hdr.appendChild( show_hdr )
	light_section.appendChild( hdr )

	// bloom
	const bloom = build_category('bloom')
	const bloom_on = lib.build_option('checkbox', 'has_bloom', false, 'bloom effect', false, false )
	bloom.appendChild( bloom_on )
	const threshold = lib.build_option('range', 'bloom_threshold', 5, 'threshold', false, true, {
		min: 0,
		max: 10,
	})
	bloom.appendChild( threshold )
	const strength = lib.build_option('range', 'bloom_strength', 5, 'strength', false, true, {
		min: 0,
		max: 10,
	})
	bloom.appendChild( strength )
	const bloom_expl = document.createElement('div')
	bloom_expl.classList.add('tip', 'active')
	bloom_expl.innerHTML = 'tip: currently, the bloom shader does not play well with heightmaps; the heightmap will appear to be semi-transparent'
	bloom.appendChild( bloom_expl )
	light_section.appendChild( bloom )
	// options_content.appendChild( bloom )

	form.appendChild( light_section)

	// environment
	const env_section = build_section('environment')

	// option - css bg
	const bg = build_category('css background')
	const color_picker = lib.build_option('color', 'bg_color_selector', false, ' ' )
	const bg_color_text = lib.build_option('text', 'bg_color', false, 'use picker or any valid css (like "background-image")')
	const bg_tip = document.createElement('div')
	bg_tip.classList.add('tip')
	bg_tip.innerHTML = 'tip: having bloom filter enabled defaults the background to black'
	bg.appendChild( bg_tip )
	bg.appendChild( color_picker )
	bg.appendChild( bg_color_text )
	// color_picker.addEventListener('change', e => {
	// 	bg_color_text.querySelector('input').value = color_picker.querySelector('input').value
	// 	gallery.render_shortcode('build_form')
	// })
	env_section.appendChild( bg )

	// fog
	const fog = build_category('fog')
	const fog_on = lib.build_option('checkbox', 'has_fog', false, 'use fog', false, false )
	fog.appendChild( fog_on )
	const fog_picker = lib.build_option('color', 'fog_color', false, ' ' )
	fog_picker.classList.add('contingent')
	fog.appendChild( fog_picker )
	const density = lib.build_option('range', 'fog_density', 5, 'density', false, true, {
		min: 0,
		max: 10,
	})
	fog.appendChild( density )
	const expl = document.createElement('div')
	expl.classList.add('tip', 'active')
	expl.innerHTML = 'tip: match your background color to fog color for realism'
	fog.appendChild( expl )
	// options.appendChild( fog )
	env_section.appendChild( fog )

	// snow
	const snow = build_category('snow')
	const snow_on = lib.build_option('checkbox', 'has_snow', false, 'gentle snow', false, false )
	snow.appendChild( snow_on )
	const blizzard = lib.build_option('checkbox', 'has_blizzard', false, 'blizzard', false, false )
	snow.appendChild( blizzard )
	env_section.appendChild( snow )

	form.appendChild( env_section )

	// end options
	// form.appendChild( options )




	// gallery shortcode
	const shortcode = build_section('shortcode')
	const p_code = document.createElement('p')
	shortcode.appendChild( p_code )
	const text = document.createElement('textarea')
	text.id = 'shortcode'
	text.placeholder = 'generated shortcode will appear here'
	text.setAttribute('readonly', true )
	p_code.appendChild( text )
	shortcode.appendChild( p_code )
	form.appendChild( shortcode )

	// gallery save / close
	const manage = document.createElement('p')
	manage.classList.add('threepress-form-controls')
	const save = document.createElement('div')
	save.classList.add('button', 'form-action')// 'button-primary'
	save.innerText = gallery.location === 'product' ? 'set' : 'save'
	save.id = 'create-gallery'

	const close = document.createElement('div')
	close.id = 'close-gallery'
	close.classList.add('threepress-cancel', 'form-action')
	close.innerText = gallery.location === 'product' ? 'cancel' : 'close'
	close.classList.add('button', 'button-primary')

	const menu_clar = document.createElement('div')
	menu_clar.innerHTML = 'you do not have to save a shortcode to use it - saving is just for reference'
	menu_clar.classList.add('clarification')
	manage.appendChild( close )
	manage.appendChild( save )
	manage.appendChild( menu_clar )
	form.appendChild( manage )




	//////////////////////////////////////////////// bind


	// general updates

	form.addEventListener('click', e => {

		gallery.render_change( e.target, form, model_choice, ground_choice, ground_choice_map, shortcode )

		gallery.set_tooltips()

	})


	for( const input of form.querySelectorAll('input') ){
		input.addEventListener('change', e => {
			shortcode.value = gallery.render_shortcode() // gallery.form
		})
	}


	// custom updates

	// bg
	form.querySelector('input[name=bg_color]').addEventListener('keyup', e => {
		e.target.value = e.target.value.replace(/ /g, '')
	})
	const bg_picker = form.querySelector(".gallery-section input[name=bg_color_selector]")
	const bg_color = form.querySelector('input[name=bg_color]')
	bg_picker.addEventListener('change', e => {
		bg_color.value = bg_picker.value
		shortcode.value = gallery.render_shortcode() // gallery.form
	})

	// fog
	fog_picker.addEventListener('change', e => {
		shortcode.value = gallery.render_shortcode() // gallery.form
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

		console.log('saving: ', gallery.ground_dimensions, gallery.ground_coords )

		if( !gallery.validate( true, true, true )) return

		const shortcode_id = gallery.form.getAttribute('data-shortcode-id')

		const editing = shortcode_id ? true : false

		console.log('saving:', shortcode_id, shortcode )

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

		// console.log( shortcode )

		lib.fetch_wrap( ajaxurl, 'post', {
			action: 'threepress_save_shortcode',
			shortcode_id: shortcode_id,
			name: gallery.form.querySelector('input[name=gallery_name]').value.trim(),
			shortcode: shortcode.querySelector('textarea').value.trim(),
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
						const old_row = lib.get_row( document.querySelector('#model-galleries .content'), res.gallery.id )
						if( editing ){
							lib.insertAfter( new_row, old_row )
							old_row.remove()
						}else{
							output_container.prepend( new_row )
						}

					}

				}

				lib.hal('success', 'success', 5000 )

			}else{
				lib.hal('error', res.msg || 'error saving', 5000 )
				console.log( res )
			}
		})
		.catch( err => {
			lib.hal('error', err.msg || 'error saving', 5000 )
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
		const anim_clips = form.querySelectorAll('#anim-clips .selection')
		for( const clip of anim_clips ) clip.remove()
		setTimeout( () => {
			const top = window.pageYOffset + target.getBoundingClientRect().top - 150
			window.scroll({
				top: top,
				behavior: 'smooth',
			})
		}, 100)
	})
	

	// ranges
	for( const input of gallery.form.querySelectorAll('input[type=range]') ){
		const tip = document.createElement('div')
		tip.classList.add('range-tip')
		tip.style.display = 'none'
		input.parentElement.appendChild( tip )
		let active = false
		input.addEventListener('mousedown', () => {
			tip.style.display = 'initial'
			active = true
		})
		input.addEventListener('mouseup', () => {
			tip.style.display = 'none'
			active = false
		})
		input.addEventListener('mouseout', () => {
			tip.style.display = 'none'
			active = false
		})
		input.addEventListener('mousemove', e => {
			if( !active ) return
			tip.style.top = ( e.clientY - 50 ) + 'px'
			tip.style.left = ( e.clientX + 10 ) + 'px'
			tip.innerHTML = input.value
		})
	}

	const skip_hide = [ /shortcode/i, /model/i, /name/i ]
	let regex, title, skip
	for( const section of gallery.form.querySelectorAll('.gallery-section') ){
		title = section.querySelector('h3').innerHTML
		skip = false
		for ( const r of skip_hide ){
			regex = new RegExp( r )
			if( title.match( regex ) ){
				skip  = true
			}
		}

		if( skip ) continue

		section.classList.add('threepress-section-hidden')

	}

	return form

}











