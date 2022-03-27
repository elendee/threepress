import BINDS from './BINDS.js?v=121'
import BROKER from '../world/WorldBroker.js?v=121'
import STATE from '../world/STATE.js?v=121'
import RENDERER from '../world/RENDERER.js?v=121'
import PLAYER from '../world/PLAYER.js?v=121'





let global_handled = false

let state

let unknown = {
	keyup: 0,
	keydown: 0,
}





const handle_keydown = ( e ) => {

	// only in game / frame keystrokes:
	if( !STATE.active ) return 


	// on with the keys:
	global_handled = false

	switch( e.keyCode ){
		case 17: // ctrl
			STATE.ctrl_down = true
			break;
		case 16: // shift
			STATE.shift_down = true
			break;
		// any global handlers here
		default: break;
	}

	state = STATE.get()

	if( !global_handled ){

		if( !state ){ // world

			switch( e.keyCode ){

			case BINDS.world.walk.forward: 
			case BINDS.world.walk2.forward: 
				BROKER.publish('MOVE_KEY', {
					type: 'walking',
					state: 1,
				})
				// up / down arrow keys - not good in a browser
				if( e.keyCode === 38 || e.keyCode === 40 ) e.preventDefault()
				break;

			case BINDS.world.walk.back:
			case BINDS.world.walk2.back:
				BROKER.publish('MOVE_KEY', {
					type: 'walking',
					state: -1,
				})
				break;

			case BINDS.world.turn.port: 
				BROKER.publish('MOVE_KEY', {
					type: 'turning',
					state: -1,
				})
				break;

			case BINDS.world.turn.starboard: 
				BROKER.publish('MOVE_KEY', {
					type: 'turning',
					state: 1,
				})
				break;

			case BINDS.world.turn2.port: 
				BROKER.publish('MOVE_KEY', {
					type: 'turning',
					state: -1,
				})
				break;

			case BINDS.world.turn2.starboard: 
				BROKER.publish('MOVE_KEY', {
					type: 'turning',
					state: 1,
				})
				break;

			case BINDS.world.strafe.port: 
				BROKER.publish('MOVE_KEY', {
					type: 'strafing',
					state: -1,
				})
				break;

			case BINDS.world.strafe.starboard: 
				BROKER.publish('MOVE_KEY', {
					type: 'strafing',
					state: 1,
				})
				break;

			case BINDS.global.chat:
				BROKER.publish('CHAT_FOCUS')
				break;

			case BINDS.chat.hail:
				BROKER.publish('TARGET_HAIL')
				// BROKER.publish('SET_HORN', true )
				break;

			default: 

				break

			}//switch

		}else if( state === 'chat' ){

			switch( e.keyCode ){

				case BINDS.chat.send:
					BROKER.publish('CHAT_SEND')
					global_handled = true
					break;

				default: break;
			}

		}else if( state === 'modal' ){

			// 

		}else if( state == 'taxi' ){

			// nada

		}else{ 

			unknown.keydown++
			if( unknown.keydown % 10 === 0 ) console.log('unknown keydown state: ', state )

		}

	}

}









const handle_keyup = ( e ) => {

	// only in game / frame keystrokes:
	if( !STATE.active ) return 



	global_handled = false

	state = STATE.get()

	// console.log( 'keyup: ', state, e.keyCode ) // keylog

	switch( e.keyCode ){
		case BINDS.global.close:
			BROKER.publish('STEP_CLOSE', { esc: true })
			global_handled = true
			break;
		case 17: // ctrl
			STATE.ctrl_down = false
			break;
		case 16: // shift
			STATE.shift_down = false
			break;
		// any global handlers here

		default: break;
	}

	if( !global_handled ){

		if( !state ){

			switch(e.keyCode){
			/*
				NOTHING GOES ABOVE MOVE_KEYs because they fall through, on purpose
			*/

			// walk
			case BINDS.world.walk.forward:
			case BINDS.world.walk2.forward:
				BROKER.publish('MOVE_KEY', { // all the cosmetics
					type: 'walking',
					state: 0,
				})
				break

			case BINDS.world.walk.back:
			case BINDS.world.walk2.back:
				BROKER.publish('MOVE_KEY', {
					type: 'walking',
					state: 0,
				})
				break

			// turn
			case BINDS.world.turn.port:
				BROKER.publish('MOVE_KEY', {
					type: 'turning',
					state: 0,
				})
				break

			case BINDS.world.turn.starboard:
				BROKER.publish('MOVE_KEY', {
					type: 'turning',
					state: 0,
				})
				break

			case BINDS.world.turn2.port:
				BROKER.publish('MOVE_KEY', {
					type: 'turning',
					state: 0,
				})
				break

			case BINDS.world.turn2.starboard:
				BROKER.publish('MOVE_KEY', {
					type: 'turning',
					state: 0,
				})
				break

			// strafe
			case BINDS.world.strafe.port: 
				BROKER.publish('MOVE_KEY', {
					type: 'strafing',
					state: 0,
				})
				break;

			case BINDS.world.strafe.starboard: 
				BROKER.publish('MOVE_KEY', {
					type: 'strafing',
					state: 0,
				})
				break;

			// it fires after chat send / blur if here, put keydown
			// case BINDS.global.chat:
			// 	BROKER.publish('CHAT_FOCUS')
			// 	break;

			case BINDS.global.chat_alt:
				BROKER.publish('CHAT_FOCUS_ALT')
				break;

			case BINDS.world.actions.one:
				BROKER.publish('ACTION_BAR', {
					index: 0,
					// state: 0,
				})
				break;

			case BINDS.world.actions.two:
				BROKER.publish('ACTION_BAR', {
					index: 1,
					// state: 0,
				})
				break;

			case BINDS.world.actions.three:
				BROKER.publish('ACTION_BAR', {
					index: 2,
					// state: 0,
				})
				break;

			case BINDS.world.actions.four:
				BROKER.publish('ACTION_BAR', {
					index: 3,
					// state: 0,
				})
				break;

			case BINDS.world.reset_camera:
				BROKER.publish('MOUSE_UNPAN')
				break;

			case BINDS.world.targeting.find: 
				BROKER.publish('TARGET_CLOSEST', { find: true })
				break;

			case BINDS.world.targeting.ships:
				BROKER.publish('TARGET_CLOSEST', { ship: true })
				break;

			case BINDS.world.hyperjump:
				BROKER.publish('SYSTEM_REQUEST_JUMP')
				break;

			case BINDS.world.interact:
				BROKER.publish('SYSTEM_REQUEST_INTERACT')
				break;

			case BINDS.chat.hail:
				BROKER.publish('TARGET_HAIL')
				// BROKER.publish('SET_HORN', false)
				break;

			case BINDS.chat.party:
				BROKER.publish('TARGET_PARTY')
				break;

			default: 
				break
			}

		}else if( state === 'chat' ){

			//

		}else if( state == 'taxi' ){

			// nada

		}else if( state === 'modal' ){

			switch( e.keyCode ){

			case BINDS.global.chat:
				BROKER.publish('CHAT_FOCUS')
				break;

			case BINDS.world.hotkeys.navigation:
				BROKER.publish('MODAL_CLOSE_NAV')
				break;

			default: break;

			}

			// 

		}else{

			unknown.keyup++
			if( unknown.keyup % 10 === 0 ) console.log('unknown keyup state: ', state )

		}

	}
	
}



const handle_mouseout = e => {
	for( const action in PLAYER.animation_map ){
		BROKER.publish('MOVE_KEY', {
			type: action,
			state: 0,
		})
	}
}




const keys = {
	init: () => {
		// RENDERER.domElement
		document.addEventListener('keyup', handle_keyup )
		// RENDERER.domElement
		document.addEventListener('keydown', handle_keydown )		
		document.addEventListener('mouseout', handle_mouseout )
	}
}






export default keys
