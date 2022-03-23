import {
	tstack,
} from './lib.js?v=121'

tstack('init_base')

import ThreepressGallery from './ThreepressGallery.js?v=121'


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
	// console.log( raw.innerHTML )
	try{
		scene = JSON.parse( raw.innerText )
	}catch( e ){
		console.log( e )
	}

	// console.log( raw.innerText, scene )

	const gallery_front = ThreepressGallery( scene )

	gallery_front.display( viewer )

}	

})();

