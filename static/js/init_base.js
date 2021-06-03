import {
// 	hal,
	tstack,
} from './lib.js?v=0.3.5'

tstack('init_base')

import ThreepressGallery from './ThreepressGallery.js?v=0.3.5'


// ------------------------------------------------------------ declarations

const viewers = document.querySelectorAll('.threepress-gallery')



// ------------------------------------------------------------ init

;(()=>{

if( !THREEPRESS ){
	console.log('no initial data found' )
	return
}

let raw, scene //, shortcode
for( const viewer of viewers ){
	raw = viewer.querySelector('.threepress-gallery-data')
	// shortcode = viewer.querySelector('.threepress-gallery-data').innerHTML
	// console.log( raw )
	try{
		scene = JSON.parse( raw.innerHTML )
	}catch( e ){
		console.log( e )
	}

	// console.log( scene )
	const gallery_front = ThreepressGallery( scene )
	// const gallery = Gallery()
	// gallery.ingest_shortcode( shortcode )
	// console.log( gallery, gallery.allow_zoom )
	gallery_front.display( viewer )

}	


})();

