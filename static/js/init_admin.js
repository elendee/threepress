import Gallery from './Gallery.js'

import {
	ModelRow,
	fetch_wrap,
} from './lib.js'

import render_gallery_form from './render_gallery_form.js'








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

// content areas
const model_library = wrap.querySelector('#model-library')
const library_content = model_library.querySelector('.content')
const model_galleries = wrap.querySelector('#model-galleries')
const gallery_content = model_galleries.querySelector('.content')

















//--------------------------------------------------------------- declare functions & classes





const fill = async( type, scroll_top ) => {

	loaded[ type ] = true

	const res = await fetch_wrap( ajaxurl, 'post', {
		action: 'fill_' + type,
	}, false )

	switch( type ){

		case 'library':
			if( !res || !res.length ){
				library_content.innerHTML = 'no models uploaded - only glb files supported'
				return
			}
				// console.log( res )
			for( const post of res ){
				const model = new ModelRow( post )
				library_content.appendChild( model.gen_row() )
			}
			break;

		case 'gallery':
			if( !res || !res.length ){
				gallery_content.innerHTML = 'no galleries yet'
				return
			}
			for( const g of res ){
				const gallery = Gallery( g )
				const row = gallery.gen_row()
				gallery_content.appendChild( row )
			}
			break;

		default: 
			console.log('unhandled fill: ', type )
			break;

	}

	if( scroll_top ) window.scroll({ top: 0, behavior: 'smooth' })

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
			fill('library', true ).catch( err => { console.log( err )})
		}else if( cat.match(/galler/) && !loaded.gallery ){
			fill('gallery', true ).catch( err => { console.log( err )})
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
	const gallery = Gallery()
	if( !gallery_form.style.display || gallery_form.style.display === 'none' ){
		gallery_form.style.display = 'inline-block'
		gallery.hydrate_editor( gallery_form )
	}else{
		if( confirm('clear the current form and start anew?')){
			gallery.hydrate_editor( gallery_form )
		}
	}
})

model_upload.addEventListener('submit', e => {
	e.preventDefault()
	window.location.assign( THREEPRESS.home_url + '/wp-admin/media-new.php')
})


browse_threepress.addEventListener('submit', e => {
	e.preventDefault()
})































//--------------------------------------------------------------- init
// if( !$ ){
// 	THREEPRESS.hal('error', 'threepress requires that jquery be enabled')
// 	return false
// }

render_gallery_form( gallery_content )




switch( localStorage.getItem('threepress-dev-view') ){
	case 'galleries':
		tabs[1].click()
		break;
	case 'create':
		tabs[1].click()
		add_gallery.click()
		document.querySelector('#choose-model').click()
		break;
	default: 
		tabs[0].click()
		break;
}


document.addEventListener('keyup', e => {
	if( e.keyCode === 27 ){
		const close = document.querySelector('.threepress-modal-close')
		if( close ) close.click()
	}
})


