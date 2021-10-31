import {
	tstack,
} from './lib.js?v=112'

tstack('init_base')

import ThreepressGallery from './ThreepressGallery.js?v=112'


// ------------------------------------------------------------ declarations

const viewers = document.querySelectorAll('.threepress-gallery')



// ------------------------------------------------------------ init

;(()=>{

if( !THREEPRESS ){
	console.log('no initial data found' )
	return
}

// single model galleries

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

// games
for( const game of document.querySelectorAll('.threepress-game') ){
	console.log('game time: ', game )
}

// errors
for( const error of document.querySelectorAll('.threepress-init-error') ){
	console.log( 'Threepress error: ', error.getAttribute('data-error') )
}

})();

