// import hal from '../hal.js?v=112'

import ThreepressGallery from './ThreepressGallery.js?v=112'

import {
	ModelRow,
	fetch_wrap,
	tstack,
	hal,
} from './lib.js?v=112'

import build_form from './build_form.js?v=112'


tstack('init_admin')





//--------------------------------------------------------------- declare vars

const wrap = document.querySelector('.wrap.threepress')

const sections = wrap.querySelectorAll('.threepress .section')
const ext_sections = wrap.querySelectorAll('.threepress .ext-section')
const tabs = wrap.querySelectorAll('.nav-tab.main-tab')
const ext_tabs = wrap.querySelectorAll('.ext-nav-tab')

// toggle action areas
const add_model = wrap.querySelector('#add-toggle')
const upload_types = wrap.querySelector('#threepress-upload-types')
const add_gallery = wrap.querySelector('#create-toggle')

// action buttons
const model_upload = wrap.querySelector('form#upload-model')
const browse_threepress = wrap.querySelector('form#browse-threepress')

// content areas
const model_library = wrap.querySelector('#model-library')
const library_content = model_library.querySelector('.content')
const model_galleries = wrap.querySelector('#model-galleries')
const galleries_content = model_galleries.querySelector('.content')

const gallery_container = document.querySelector('#gallery-container')














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
				// console.log('model row: ', post )
				const model = new ModelRow( post )
				model.form = gallery_admin.form
				library_content.appendChild( model.gen_row() )
			}
			break;

		case 'gallery':
			if( !res || !res.length ){
				galleries_content.innerHTML = 'no galleries yet'
				return
			}
			// console.log( res )
			for( const g of res ){
				const gallery = ThreepressGallery( g )
				gallery.form = gallery_admin.form
				gallery.ingest_shortcode( g.shortcode, 'admin' )
				const row = gallery.gen_row()
				galleries_content.appendChild( row )
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



add_model.addEventListener('click', () => {
	if( !upload_types.style.display || upload_types.style.display === 'none' ){
		upload_types.style.display = 'initial'
		add_model.querySelector('div').innerText = '-'
	}else{
		upload_types.style.display = 'none'
		add_model.querySelector('div').innerText = '+'
	}
})

model_upload.addEventListener('submit', e => {
	e.preventDefault()
	window.location.assign( THREEPRESS.home_url + '/wp-admin/media-new.php')
})


browse_threepress.addEventListener('submit', e => {
	e.preventDefault()
})


add_gallery.addEventListener('click', () => {
	if( !gallery_admin.form.style.display || gallery_admin.form.style.display === 'none' ){
		gallery_admin.form.style.display = 'inline-block'
		gallery_admin.hydrate_form( gallery_admin.form, gallery_admin.shortcode, null, 'admin add gallery' )
	}else{
		if( confirm('clear the current form and start anew?')){
			const close = document.querySelector('#close-gallery')
			if( close ) close.click()
			setTimeout(() => {				
				const new_gallery = ThreepressGallery({
					form: gallery_admin.form,
				})
				new_gallery.hydrate_form( gallery_admin.form, 'admin restart gallery' )
			}, 50 )
		}
	}
})




























//--------------------------------------------------------------- init
// if( !$ ){
// 	THREEPRESS.hal('error', 'threepress requires that jquery be enabled')
// 	return false
// }
const gallery_admin = ThreepressGallery()
build_form( gallery_admin, galleries_content )
gallery_container.appendChild( gallery_admin.form )


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
			// console.log('non-ajax tab: ', cat )
		}
	})
}

for( const tab of ext_tabs ){
	tab.addEventListener('click', () => {
		for( const section of ext_sections ){
			section.style.display = 'none'
		}
		for( const t of ext_tabs ){
			t.classList.remove('selected')
		}
		tab.classList.add('selected')
		const cat = tab.getAttribute('data-section')
		wrap.querySelector('#' + cat ).style.display = 'initial'
	})
}
if( ext_tabs[0] ) ext_tabs[0].click()




const load_type = localStorage.getItem('threepress-dev-view')

;(async() => {

	await new Promise((resolve, reject) => {

		switch( load_type ){

			case 'galleries':
				tabs[1].click()
				resolve()
				break;

			case 'new':
				tabs[1].click()
				setTimeout(() => {
					add_gallery.click()	
					resolve()
				}, 50)
				break;

			case 'edit':
				tabs[1].click()
				setTimeout(() => {
					const row = document.querySelector('.threepress-row')
					if( row ) row.click()
					resolve()
				}, 500)
				break;

			case 'preview':
				tabs[1].click()
				setTimeout(() => {
					const row = document.querySelector('.threepress-row')
					if( row ) row.click()
					setTimeout(() => {
						const preview = document.querySelector('#gallery-preview')
						if( preview ) preview.click()
						resolve()
					}, 500)
				}, 500)
				break;

			default: 
				tabs[0].click()
				break;
		}
	})

	if( load_type ) hal('success', 'dev: loading ' + load_type, 1000 )

})();



document.addEventListener('keyup', e => {
	if( e.keyCode === 27 ){
		const close = document.querySelector('.threepress-modal-close')
		if( close ) close.click()
	}
})


