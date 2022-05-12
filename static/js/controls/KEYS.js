import BINDS from './BINDS.js?v=140'
import BROKER from '../world/WorldBroker.js?v=140'
import STATE from '../world/STATE.js?v=140'
// import RENDERER from '../world/RENDERER.js?v=140'
import PLAYER from '../world/PLAYER.js?v=140'





let global_handled = false

let state

let unknown = {
	keyup: 0,
	keydown: 0,
}





const handle_keydown = ( e ) => {

	// console.log( e.keyCode )

	// only in game / frame keystrokes:
	if( !STATE.active ) return 


	// on with the keys:
	global_handled = false

	switch( e.keyCode ){
		// case 17: // ctrl
		// 	STATE.ctrl_down = true
		// 	break;
		// case 16: // shift
		// 	STATE.shift_down = true
		// 	break;
		// any global handlers here
		default: break;
	}

	state = STATE.get()

	if( !global_handled ){

		if( !state ){ // world

			switch( e.keyCode ){

			case BINDS.world.run.forward: 
			case BINDS.world.run2.forward: 
				BROKER.publish('MOVE_KEY', {
					type: e.shiftKey ? 'walking' : 'running',
					state: 1,
					e: e,
				})
				break;

			case BINDS.world.run.back:
			case BINDS.world.run2.back:
				BROKER.publish('MOVE_KEY', {
					type: e.shiftKey ? 'walking' : 'running',
					state: -1,
					e: e,
				})
				break;

			case BINDS.world.turn.port: 
				BROKER.publish('MOVE_KEY', {
					type: 'turning',
					state: 1,
					e: e,
				})
				break;

			case BINDS.world.turn.starboard: 
				BROKER.publish('MOVE_KEY', {
					type: 'turning',
					state: -1,
					e: e,
				})
				break;

			case BINDS.world.turn2.port: 
				BROKER.publish('MOVE_KEY', {
					type: 'turning',
					state: 1,
					e: e,
				})
				break;

			case BINDS.world.turn2.starboard: 
				BROKER.publish('MOVE_KEY', {
					type: 'turning',
					state: -1,
					e: e,
				})
				break;

			case BINDS.world.strafe.port: 
				BROKER.publish('MOVE_KEY', {
					type: 'strafing',
					state: -1,
					e: e,
				})
				break;

			case BINDS.world.strafe.starboard: 
				BROKER.publish('MOVE_KEY', {
					type: 'strafing',
					state: 1,
					e: e,
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
			BROKER.publish('STEP_CLOSE', { esc: true, e: e })
			global_handled = true
			break;
		// case 17: // ctrl
		// 	STATE.ctrl_down = false
		// 	break;
		// case 16: // shift
		// 	STATE.shift_down = false
		// 	break;
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
			case BINDS.world.run.forward:
			case BINDS.world.run2.forward:
				BROKER.publish('MOVE_KEY', {
					type: 'walking',
					state: 0,
					e: e,
				})
				BROKER.publish('MOVE_KEY', {
					type: 'running',
					state: 0,
					e: e,
				})
				break

			case BINDS.world.run.back:
			case BINDS.world.run2.back:
				BROKER.publish('MOVE_KEY', {
					type: 'walking',
					state: 0,
					e: e,
				})
				BROKER.publish('MOVE_KEY', {
					type: 'running',
					state: 0,
					e: e,
				})
				break

			// turn
			case BINDS.world.turn.port:
				BROKER.publish('MOVE_KEY', {
					type: 'turning',
					state: 0,
					e: e,
				})
				break

			case BINDS.world.turn.starboard:
				BROKER.publish('MOVE_KEY', {
					type: 'turning',
					state: 0,
					e: e,
				})
				break

			case BINDS.world.turn2.port:
				BROKER.publish('MOVE_KEY', {
					type: 'turning',
					state: 0,
					e: e,
				})
				break

			case BINDS.world.turn2.starboard:
				BROKER.publish('MOVE_KEY', {
					type: 'turning',
					state: 0,
					e: e,
				})
				break

			// strafe
			case BINDS.world.strafe.port: 
				BROKER.publish('MOVE_KEY', {
					type: 'strafing',
					state: 0,
					e: e,
				})
				break;

			case BINDS.world.strafe.starboard: 
				BROKER.publish('MOVE_KEY', {
					type: 'strafing',
					state: 0,
					e: e,
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

			// case BINDS.world.targeting.find: 
			// 	BROKER.publish('TARGET_CLOSEST', { find: true })
			// 	break;

			// case BINDS.world.targeting.ships:
			// 	BROKER.publish('TARGET_CLOSEST', { ship: true })
			// 	break;

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



const world = document.getElementById('threepress-world')
let worldbound

const handle_mouseout = event => {

	const { e } = event
	// console.log( '>>', e.target )
	if( e.target.id === 'threepress-world'){
		worldbound = world.getBoundingClientRect()
		if( e.clientY > worldbound.top || 
			e.clientY < worldbound.bottom || 
			e.clientX > worldbound.right || 
			e.clientX < worldbound.left ){
				BROKER.publish('WORLD_UNFOCUS')
		}
	}
	// if( e.target.id == 'threepress-world-canvas') PLAYER.rest()
}






const keys = {
	init: () => {
		// RENDERER.domElement
		document.addEventListener('keyup', handle_keyup )
		// RENDERER.domElement
		document.addEventListener('keydown', handle_keydown )		
		document.addEventListener('mouseout', e => {
			BROKER.publish('MOUSEOUT', {
				e: e,
			})
		})
	}
}










const handle_move_key = event => {
	/*
		passes through here just to be proper..
	*/
	const { type, state, e } = event

	PLAYER.set_move_state( type, state, e )

}






BROKER.subscribe('MOVE_KEY', handle_move_key )
BROKER.subscribe('MOUSEOUT', handle_mouseout )


export default keys
