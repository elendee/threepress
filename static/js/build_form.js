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

const build_option = ( type, name, label, placeholder, contingent, attrs, checked ) => {
	const selection = document.createElement('div')
	selection.classList.add('selection')
	const label_ele = document.createElement('label')
	label_ele.innerHTML = label || name.replace(/_/g, ' ')
	const input = document.createElement('input')
	input.type = type
	input.name = name
	for( const key in attrs ){
		input[ key ] = attrs[ key ]
	}
	if( type === 'checkbox' || type === 'radio') if( checked ) input.checked = true
	selection.appendChild( label_ele )
	selection.appendChild( input )
	return selection
}



export default ( gallery ) => {

	const form = document.createElement('div')
	form.id = 'gallery-form'
	// form.action = 'create-gallery.php'
	form.method = 'post'

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
	const choice = document.createElement('div')
	choice.id = 'model-choice'
	p_model.appendChild( choice )
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
	for( let i = 0; i < controls_options.length; i++ ){
		controls.appendChild( build_option( 'radio', controls_options[i], false, false, {}, i === 0 ) )
	}

	// option - bg
	const bg = build_category('background')
	const options_picker = build_option('color', 'bg_color_selector' )
	const options_bg = build_option('text', 'bg_color', 'use picker or any valid css' )
	bg.appendChild( options_picker )
	bg.appendChild( options_bg )
	options_content.appendChild( bg )

	// option - light
	const light = build_category('light')
	const light_options = ['directional', 'sun', 'hemispherical']
	for( let i = 0; i < light_options.length; i++ ){
		light.appendChild( build_option('radio', light_options[i], false, false, {}, i === 0 ) )
	}
	const intensity = build_option('range', 'intensity', false, false, false, {
		min: 1,
		max: 15,
	})
	light.appendChild( intensity )
	options_content.appendChild( light )

	// option - camera
	const camera = build_category('camera')
	// allow zoom, zoom speed, initial zoom
	const zoom = build_option('checkbox', 'allow_zoom', 'allow zoom', false, false )
	const zoom_speed = build_option('range', 'zoom_speed', false, false, { min: 1, max: 12, })
	const initial_zoom = build_option('range', 'camera_dist', 'initial zoom', false, false, { min: 1, max: 20 })
	camera.appendChild( zoom )
	camera.appendChild( zoom_speed )
	camera.appendChild( initial_zoom )
	options_content.appendChild( camera )
									

	// option - rotation
	const rotation = build_category('rotation')
	const auto = build_option('checkbox', 'rotate_scene', 'auto rotate', false, false)
	rotation.appendChild( auto )
	const rotate_speed = build_option('range', 'rotate_speed', 'rotation speed', false, true, { min: 1, max: 50 })
	rotation.appendChild( rotate_speed )
	const rot_x = build_option('checkbox', 'rotate_x')
	const rot_y = build_option('checkbox', 'rotate_y')
	const rot_z = build_option('checkbox', 'rotate_z')
	rotation.appendChild( rot_x )
	rotation.appendChild( rot_y )
	rotation.appendChild( rot_z )
	options_content.appendChild( rotation )

	form.appendChild( options )

	// gallery shortcode
	const code = build_section('gallery shortcode')
	const p_code = document.createElement('p')
	code.appendChild( p_code )
	const text = document.createElement('textarea')
	text.id = 'shortcode'
	text.placeholder = 'generated shortcode will appear here'
	text.readonly = true
	p_code.appendChild( text )
	code.appendChild( p_code )
	options_content.appendChild( code )

	// gallery save / close
	// type, value, label, placeholder, contingent, attrs, checked
	const manage = document.createElement('p')
	const save = build_option('submit', 'save')
	save.id = 'create-gallery'
	save.classList.add('button', 'button-primary')
	const close = build_option('button', 'close')
	close.id = 'close-gallery'
	close.classList.add('button', 'button-primary')
	const menu_clar = document.createElement('div')
	menu_clar.innerHTML = 'you do not have to save a shortcode to use it - saving is just for reference'
	menu_clar.classList.add('clarification')
	manage.appendChild( save )
	manage.appendChild( close )
	manage.appendChild( menu_clar )
	options_content.appendChild( manage )

	return form

}