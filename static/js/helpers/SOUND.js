/*






rewrite
was written for COIL







*/

import BROKER from '../world/WorldBroker.js?v=130'

// init stuff
const slugs = [
	'alert_hal',
	'beep_bright',
]
const sounds = {}
const audio = slug => {
	return new Audio('/resource/sound/' + slug + '.mp3')
}
for( const slug of slugs ){
	sounds[ slug ] = audio( slug )
}
const COIL_SOUNDS = {
	direct_message: sounds.alert_hal,
	chat: sounds.beep_bright,
}

// init settings
const settings = {}
// overwrite saved settings if they exist
const saved = localStorage.getItem('coil-sound-settings')
if( saved ){
	try{
		const parsed = JSON.parse( saved )
		// unfinished.. do what..
	}catch( err ){
		console.log( err )
	}
}




const play = event => {
	const { slug, volume } = event
	if( !COIL_SOUNDS[ slug ]){
		console.log('missing sound', slug)
		return
	}
	if( typeof volume === 'number' ){
		if( ( volume > 1 || volume < 0 )){
			console.log('invalid volume', volume )
		}else{
			COIL_SOUNDS[slug].volume( volume )
		}
	}
	COIL_SOUNDS[ slug ].play()
}



BROKER.subscribe('SOUND_PLAY', play )

export default {
	sounds,
}