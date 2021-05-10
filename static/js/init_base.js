// import {
// 	hal,
// 	render,
// 	// log,
// } from './lib.js'

import Gallery from './Gallery.js'


// ------------------------------------------------------------ declarations

const viewers = document.querySelectorAll('.threepress-viewer')










// ------------------------------------------------------------ init

;(()=>{

if( !THREEPRESS ){
	console.log('no initial data found' )
	return
}

let raw, scene
for( const set of viewers ){
	raw = set.querySelector('.threepress-viewer-data')
	try{
		scene = JSON.parse( raw.innerHTML )
	}catch( e ){
		console.log( e )
	}

	// console.log( scene )

	const gallery = Gallery( scene )
	gallery.init_scene().catch( err => {
		console.log( err )
	})

	set.appendChild( gallery.ele )
	// console.log( scene )
}	


})();

