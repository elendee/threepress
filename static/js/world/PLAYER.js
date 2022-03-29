import Player from './Player.js?v=121'
import BROKER from './WorldBroker.js?v=121'
import STATE from './STATE.js?v=121'

const player = new Player()

player.need_stream = false
player.standard_actions = [
	'walking',
	'strafing',
	'turning',
	'idle',
	'running',
	'jump',
	'attack',
]

player.animation_map = { 
	/*
		game actions -> the embedded animation names for that modeltype
	*/
	quaternius_low: {
		'walking': 'Walk',
		'strafing': 'Walk',
		'turning': 'Walk',
		'idle': 'Idle',
	},

}

THREEPRESS.PLAYER1 = player

let p
player.build_packet = () => {
	p = {
		type: 'core',
		p: {
			x: trim( player.GROUP.position.x, 1 ),
			y: trim( player.GROUP.position.y, 1 ),
			z: trim( player.GROUP.position.z, 1 ),
		},
		q: {
			x: trim( player.GROUP.quaternion._x, 1 ),
			y: trim( player.GROUP.quaternion._y, 1 ),
			z: trim( player.GROUP.quaternion._z, 1 ),
			w: trim( player.GROUP.quaternion._w, 1 ),
		},
		s: {
			w: player.state.walking,						
			s: player.state.strafing,						
		}		
	}
	// for( const v in p.p ) p.p[v] = p.p[v].toFixed()
	// for( const v in p.q ) p.q[v] = p.q[v].toFixed()
	return p
}


player.begin_pulse = () => {
	if( !player.player1 || player.core_pulse ){
		return
	}
	player.core_pulse = setInterval(() => {
		if( !player.need_stream ) return
		player.send_update()
	}, 500)
}

player.send_update = () => {
	BROKER.publish('SOCKET_SEND', player.build_packet() )
	// console.log( player.state )
	player.need_stream = false
}





let previously_strafing = false //
let previously_walking = false //
const send_immediate = event => {
	/* 
		check for movement "ends" (keyUPS, when previously keyDOWN ) 
		send END packet immediately to stop rubber banding
	*/
	if( event.type === 'walking' ){
		if( event.state ){
			previously_walking = true
			return false
		}
		if( previously_walking ){ // ( not walking now and was before )
			previously_walking = false
			return true
		}
	}else if( event.type === 'strafing' ){
		if( event.state ){
			previously_strafing = true
			return false
		}
		if( previously_strafing ){ // ( not walking now and was before )
			previously_strafing = false
			return true
		}
	}

	// ( can skip turning check )

	return false

}


const last_states = {}
let diffed
const handle_key = event => {
	/*
		main handler
	*/
	const { type, state } = event

	diffed = last_states[ type ] !== state

	// set state
	player.state[ type ] = last_states[ type ] = state

	// check for keyUPS (end immediate)
	if( send_immediate( event )){
		player.send_update()
	// normal moves:
	}else{
		if( diffed ) player.need_stream = true
	}

	// set animate
	if( diffed ) player.animate( type, state !== 0 , 1000 )

}




const trim = ( flo, n ) => {
	return Number( flo.toFixed( n ) )
}



BROKER.subscribe('MOVE_KEY', handle_key )

export default player