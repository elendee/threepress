import {
	hal,
	render,
	// log,
} from './lib.js'

import Canvas from './Canvas.js'


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

	const canvas = Canvas( scene )
	canvas.init()

	// console.log( canvas)

	set.appendChild( canvas.ele )
	// console.log( scene )
}	


})();

