// import {
// 	hal,
// 	render,
// 	// log,
// } from './lib.js'

import Gallery from './Gallery.js'


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
	console.log( raw )
	try{
		scene = JSON.parse( raw.innerHTML )
	}catch( e ){
		console.log( e )
	}

	// console.log( scene )
	const gallery = Gallery( scene )
	// const gallery = Gallery()
	// gallery.ingest_shortcode( shortcode )
	// console.log( gallery, gallery.allow_zoom )
	gallery.display( viewer )

}	


})();

