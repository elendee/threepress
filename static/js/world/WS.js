import PLAYER from './PLAYER.js?v=121'
import {
	// random_hex,
	hal,
	spinner,
} from '../lib.js?v=121'
import BROKER from './WorldBroker.js?v=121'


let bound = 0
let packet, SOCKET 





const init = ele => {

	spinner.show( ele )

	SOCKET = new WebSocket( THREEPRESS.ARCADE.URLS.websocket )

	SOCKET.onmessage = function( msg ){

		packet = false

		try{
			packet = JSON.parse( msg.data )
		}catch( e ){
			return bad_message( SOCKET, e )
		}

		if( bound !== 1 && packet.type !== 'init_entry' ) return handle_unbound( bound, packet )

		switch( packet.type ){

			case 'init_entry':
				BROKER.publish('WORLD_INIT', packet )
				bound = 1
				break;

			case 'core':
				BROKER.publish('TOON_CORE', packet )
				break;

			case 'walk':
				console.log("deprecated ws packet: ", packet )
				// BROKER.publish('TOON_WALK', packet )
				break;

			case 'turn':
				console.log("deprecated ws packet: ", packet )
				// BROKER.publish('TOON_TURN', packet )
				break;

			case 'strafe':
				console.log("deprecated ws packet: ", packet )
				// BROKER.publish('TOON_STRAFE', packet )
				break;

			case 'pong_toon':
				BROKER.publish('TOON_INIT', packet)
				break;

			case 'chat':
				BROKER.publish('CHAT_ADD', packet )
				break;

			case 'update_toon_model':
				BROKER.publish('TOON_UPDATE_MODEL', packet )
				break;

			case 'hal':
				hal( packet.msg_type || 'standard', packet.msg || '(unknown server message)', packet.time || 5000 )
				break;

			default: 
				console.log( 'unknown server packet: ', packet )
				break
		}

	}


	SOCKET.onopen = function( event ){

		spinner.hide()

		console.log('connected ws' )

	}


	SOCKET.onerror = function( data ){
		console.log('WS error', data)
		hal('error', 'server error')
	}



	SOCKET.onclose = function( event ){
		hal('error', 'connection closed')
	}


}





const handle_unbound = ( bound, packet ) => {
	if( bound === 0 ){
		bound = 'limbo'
		if( packet.msg && packet.msg.match(/failed to find/)){
			hal('error', packet.msg, 5000)
		}
		if( packet.type === 'hal' ){
			hal( packet.msg_type, packet.msg, packet.time )
		}
		console.log('user not yet intialized.. packet: ', packet )
	}else{
		// limbo, nothing
	}
	return false
}


const bad_message = ( SOCKET, e ) => {
	SOCKET.bad_messages++
	if( SOCKET.bad_messages > 100 ) {
		console.log('100+ faulty socket messages', msg )
		SOCKET.bad_messages = 0
	}
	console.log('failed to parse server msg: ', msg )
	return false
}





let send_packet

const send = event => {

	send_packet = event 

	// if( send_packet.type === 'turn' ){
	// 	console.log('sending rotation:', PLAYER.GROUP.rotation.y )
	// }

	if( SOCKET.readyState !== 1 ){
		console.log('socket not ready to send', event )
		return
	}
	
	SOCKET.send( JSON.stringify( send_packet ))

}







BROKER.subscribe('SOCKET_SEND', send )


export default {
	init: init,
}

