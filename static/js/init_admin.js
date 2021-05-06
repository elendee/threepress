import {
	ModelRow,
	hal,
	fetch_wrap,
} from './lib.js'

import model_selector from './model_selector.js'


















//--------------------------------------------------------------- declare vars

const wrap = document.querySelector('.wrap.threepress')

const sections = wrap.querySelectorAll('.threepress .section')
const tabs = wrap.querySelectorAll('.nav-tab')

// toggle action areas
const add_model = wrap.querySelector('#add-toggle')
const upload_types = wrap.querySelector('#threepress-upload-types')
const add_gallery = wrap.querySelector('#create-toggle')
const gallery_form = wrap.querySelector('form#gallery-form')

// action buttons
const model_upload = wrap.querySelector('form#upload-model')
const browse_threepress = wrap.querySelector('form#browse-threepress')
const choose_model = wrap.querySelector('#choose-model')

// content areas
const model_library = wrap.querySelector('#model-library')
const library_content = model_library.querySelector('.content')
const model_galleries = wrap.querySelector('#model-galleries')
const gallery_content = model_galleries.querySelector('.content')

const model_choice = wrap.querySelector('#model-choice')


// main menu .. this script enqueued only when tab is active
const admin_entry = document.querySelector('#toplevel_page_threepress-inc-admin')















//--------------------------------------------------------------- declare functions & classes



const generate_gallery_row = gallery => {
	const row = document.createElement('div')
	row.classList.add('row')
	const title = document.createElement('div')
	title.classList.add('column', 'column-3')
	title.title = 'gallery title'
	title.innerText = gallery.title
	//
	//
	//
	return row 
}



const fill = async( type ) => {

	loaded[ type ] = true

	const res = await fetch_wrap( ajaxurl, 'post', {
		action: 'fill_' + type,
	}, false )

	let object
	try{
		object = JSON.parse( res )
	}catch( e ){
		hal('error', 'error fetching results', 4000 )
		console.log( e, res )
		return 
	}

	switch( type ){

		case 'library':
			if( !object || !object.length ){
				library_content.innerHTML = 'no models uploaded - only glb files supported'
				return
			}
			for( const post of object ){
				const model = new ModelRow( post )
				library_content.appendChild( model.gen_row() )
			}
			break;

		case 'gallery':
			if( !object || !object.length ){
				gallery_content.innerHTML = 'no galleries yet'
				return
			}
			for( const gallery of object ){
				gallery_content.appendChild( generate_gallery_row( gallery ) )
			}
			// gallery_content.innerHTML = res
			break;

		default: 
			console.log('unhandled fill: ', type )
			break;

	}

}























//--------------------------------------------------------------- bindings

const loaded = {
	library: false,
	gallery: false
}

for( const tab of tabs ){
	tab.addEventListener('click', () => {
		for( const section of sections ){
			section.style.display = 'none'
		}
		for( const t of tabs ){
			t.classList.remove('selected')
		}
		tab.classList.add('selected')
		const cat = tab.getAttribute('data-section')
		wrap.querySelector('#' + cat ).style.display = 'initial'
		if( cat.match(/library/) && !loaded.library ){
			fill('library').catch( err => { console.log( err )})
		}else if( cat.match(/galler/) && !loaded.gallery ){
			fill('gallery').catch( err => { console.log( err )})
		}else{
			console.log('non-ajax tab: ', cat )
		}
	})
}

add_model.addEventListener('click', () => {
	if( !upload_types.style.display || upload_types.style.display === 'none' ){
		upload_types.style.display = 'initial'
		add_model.querySelector('div').innerText = '-'
	}else{
		upload_types.style.display = 'none'
		add_model.querySelector('div').innerText = '+'
	}
})


add_gallery.addEventListener('click', () => {
	if( !gallery_form.style.display || gallery_form.style.display === 'none' ){
		gallery_form.style.display = 'inline-block'
		add_gallery.querySelector('div').innerText = '-'
	}else{
		gallery_form.style.display = 'none'
		add_gallery.querySelector('div').innerText = '+'
	}
})

model_upload.addEventListener('submit', e => {
	e.preventDefault()
	window.location.assign( THREEPRESS.home_url + '/wp-admin/media-new.php')
})

choose_model.addEventListener('click', () => {
	model_selector(( id, row ) => {
		model_choice.innerHTML = ''
		model_choice.appendChild( row )
	})
})

gallery_form.addEventListener('submit', e => {
	e.preventDefault()
	const model_row = gallery_form.querySelector('.threepress-row')
	fetch_wrap( ajaxurl, 'post', {
		action: 'create_shortcode',
		name: gallery_form.querySelector('input[name=name]').value.trim(),
		model_id: model_row ? model_row.getAttribute('data-id') : undefined,
		model_url: model_row ? model_row.querySelector('.column.url').innerHTML : undefined,
	}, false)
})

browse_threepress.addEventListener('submit', e => {
	e.preventDefault()
})


























//--------------------------------------------------------------- init
// if( !$ ){
// 	THREEPRESS.hal('error', 'threepress requires that jquery be enabled')
// 	return false
// }

if( admin_entry ){
	admin_entry.querySelector('.wp-menu-image').remove()
	const icon = document.createElement('span')
	icon.innerHTML = '<img src="' + THREEPRESS.plugin_url + 'assets/icon-menu.png">'
	admin_entry.querySelector('.wp-menu-name').prepend( icon )
}


tabs[0].click()



