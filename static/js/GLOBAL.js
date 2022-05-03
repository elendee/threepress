import {
	fetch_wrap,
} from './lib.js?v=130'

const g = THREEPRESS.GLOBAL = {}

const init = async() => {
	const res = await fetch_wrap( THREEPRESS.ARCADE.URLS.https + '/init_global', 'get' )
	if( res?.success ){
		for( const key in res.g ){
			g[ key ] = res.g[ key ]
		}
	}else{
		console.log('err threepress init: ', res )
	}
}

export default {
	init,
}