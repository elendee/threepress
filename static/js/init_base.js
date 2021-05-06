import {
	hal,
	render,
	// log,
} from './lib.js'


// ------------------------------------------------------------ declarations

const data = document.getElementById('threepress-data')











// ------------------------------------------------------------ init

;(()=>{


if( !data || !THREEPRESS ){
	console.log('no initial data found')
	return
}

try{
	THREEPRESS.data = JSON.parse( data.innerHTML )
}catch( e ){
	console.log( e )
}

if( THREEPRESS.data.display_choice ){

	switch( THREEPRESS.data.display_choice ){

		case 'ftd_model':
			render( 'ftd_model', THREEPRESS.model_choice )
			break;

		default: break;

	}
}

})();

