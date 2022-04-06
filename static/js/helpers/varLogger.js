import BROKER from '../world/WorldBroker.js?v=130'

const ele = document.createElement('div')
ele.id = 'threepress-varlogger'
document.body.appendChild( ele )

let LOG_ELES = {}
let INTERVAL = false

let PARENT_OBJ

const varlog = event => {
	const { parent_obj, keys, callback } = event

	PARENT_OBJ = parent_obj

	LOG_ELES ={}
	ele.innerHTML = ''

	for( const key of keys ){
		const logdiv = document.createElement('div')
		logdiv.classList.add('threepress-logdiv')
		const name = document.createElement('span')
		const value = document.createElement('span')
		logdiv.appendChild( name )
		logdiv.appendChild( value )
		ele.appendChild( logdiv )
		LOG_ELES[ key] = {
			name: name,
			value: value,
			callback: callback,
		}
	}

}

const print = () => {
	let value
	for( const key in LOG_ELES ){
		LOG_ELES[ key ].name.innerHTML = key + ': '
		value = PARENT_OBJ[ key ]
		LOG_ELES[ key ].value.innerHTML = LOG_ELES[ key ].callback( value )
	}
}

const log_state = event => {
	const { state, ms } = event
	if( !ms ){
		console.log('invalid ms')
		return
	}
	if( state ){
		INTERVAL = setInterval(() => {
			print()
		}, ms )
	}else{
		clearInterval( INTERVAL )
	}
}

BROKER.subscribe('LOGGER_STATE', log_state )
BROKER.subscribe('LOGGER_LOG', varlog )

export default ele