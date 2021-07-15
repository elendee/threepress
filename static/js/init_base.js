import {
// 	hal,
	tstack,
} from './lib.js?v=0.4.0'

tstack('init_base')

import ThreepressGallery from './ThreepressGallery.js?v=0.4.0'


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

	const gallery_front = ThreepressGallery( scene )

	gallery_front.display( viewer )

}	


})();

