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

let raw, scene
for( const viewer of viewers ){
	raw = viewer.querySelector('.threepress-gallery-data')
	try{
		scene = JSON.parse( raw.innerHTML )
	}catch( e ){
		console.log( e )
	}

	// console.log( scene )
	const gallery = Gallery( scene )
	// console.log( gallery, gallery.allow_zoom )
	gallery.display( viewer )

}	


})();

