import * as lib from '../lib.js?v=130'

import PLAYER from './PLAYER.js?v=130'
import FactoryObject from './FactoryObject.js?v=130'
import Install from './Install.js?v=130'
import OBJECTS from './OBJECTS.js?v=130'
import INSTALLS from './INSTALLS.js?v=130'
import BROKER from './WorldBroker.js?v=130'
import SCENE from './SCENE.js?v=130'
import RENDERER from './RENDERER.js?v=130'
import STATE from './STATE.js?v=130'

import MOUSE from '../controls/MOUSE.js?v=130'





const handle_obj = event => {

	const { obj } = event 

	if( OBJECTS[ obj.uuid ]){
		console.log('obj already exists', OBJECTS[ obj.uuid ] )
		return
	}

	const object = FactoryObject( obj )

	if( !object ){
		console.log('failed to construct: ', obj )
		return 
	}

	if( object.isEntity ){ // toons, ... , ?
		// debugger
		object.construct_model()
		.then( res => {
			// debugger
			// console.log( res )
			// console.log( object )
			SCENE.add( object.GROUP )
			object.GROUP.position.set( object.x || 0, object.y || 0, object.z || 0 )

		})		
		.catch( err => {
			console.log( err )
		})

	}else if( object.type === 'pillar' ){ // pillars 

		THREEPRESS.PILLARS = THREEPRESS.PILLARS || {}
		THREEPRESS.PILLARS[ obj.uuid ] = obj

		object.construct_model()
		.then( res => {
			console.log('loaded pillar')
			SCENE.add( object.GROUP )
			object.GROUP.position.x = object.x
			object.GROUP.position.z = object.z
			object.GROUP.position.y = ( object.height / 2 ) + 1
		})

	}else{

		console.log('unhandled construct obj: ', obj )
	}

}





const send_install = event => {

	const { e } = event

	// console.log('installing ', STATE.held_url , ' at ', x, y )

	const bounds = RENDERER.domElement.getBoundingClientRect()

	const { intersection } = MOUSE.detect_object_hovered( e, bounds )
	if( !intersection ){
		console.log('no install location found' )
		return
	}

	const target = intersection.object
	const is_ground = target?.userData?.is_ground
	if( !target?.userData?.clickable && !is_ground ){
		console.log('no install target found')
		return			
	}

	console.log( 'sending install intersection: ', intersection )

	BROKER.publish('SOCKET_SEND', {
		type: 'send_install',
		url: STATE.held_url,
		point: intersection.point,
		mount_uuid: target.userData?.uuid, //  || target.uuid,
		is_ground: is_ground,
	})

}



const handle_install = event => {

	const { install } = event 

	// console.log('handle install', event )

	const type = lib.get_install_type( install.url )

	const installation = new Install( install )

	if( type == 'image' || type === 'model'){

		installation.construct_model()
		.then( res => {
			if( !installation.GROUP ){
				lib.hal('error', 'failed to load image', 5000 )
				return
			}
			SCENE.add( installation.GROUP )
			installation.GROUP.position.set( 
				installation.REF.position.x, 
				installation.REF.position.y, 
				installation.REF.position.z,
			)
			INSTALLS[ installation.uuid ] = installation
		})

	}else{

		console.log('unknown install type', type )

	}

	// switch( type ){

	// 	case 'image':
	// 		installation.construct_model()
	// 		.then( res => {
	// 			if( !installation.GROUP ){
	// 				lib.hal('error', 'failed to load image', 5000 )
	// 				return
	// 			}
	// 			SCENE.add( installation.GROUP )
	// 			installation.GROUP.position.set( 
	// 				installation.REF.position.x, 
	// 				installation.REF.position.y, 
	// 				installation.REF.position.z,
	// 			)
	// 			INSTALLS[ installation.uuid ] = installation
	// 		})
	// 		break;

	// 	case 'model':

	// 		break;

	// 	default: 
	// 		console.log('unknown install type', type )
	// 		return
	// }

}





const update_object = event => {

	const { obj, sender_uuid } = event

	if( sender_uuid === PLAYER.uuid ) return;

	const target = INSTALLS[ obj.uuid ] // || x || y ...
	if( !target ) return;

	target.GROUP.quaternion.set(
		obj._REF.quaternion._x,
		obj._REF.quaternion._y,
		obj._REF.quaternion._z,
		obj._REF.quaternion._w,
	)

	target.GROUP.position.set(
		obj._REF.position.x,
		obj._REF.position.y,
		obj._REF.position.z,
	)

	target.GROUP.scale.set(
		obj._REF.scale.x,
		obj._REF.scale.y,
		obj._REF.scale.z,
	)

	// move to lerp eventually....
	target.REF.quaternion = obj._REF.quaternion 
	target.REF.position = obj._REF.position
	target.REF.scale = obj._REF.scale

}



const remove_object = event => {

	const { uuid } = event
	const obj = INSTALLS[ uuid ]
	if( !obj ){
		console.log('no object to remove')
		return
	}

	obj.set_controls( false )
	
	SCENE.remove( obj.GROUP )

	delete INSTALLS[ uuid ]

	console.log('removed: ', obj )

}







BROKER.subscribe('WORLD_HANDLE_OBJ', handle_obj )
BROKER.subscribe('WORLD_INSTALL', send_install )
BROKER.subscribe('WORLD_PONG_INSTALL', handle_install )
BROKER.subscribe('WORLD_UPDATE_OBJ', update_object )
BROKER.subscribe('WORLD_REMOVE_OBJ', remove_object )


export default {}