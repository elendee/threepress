import {
	Vector3,
} from '../../inc/three.module.js?v=130'

import {
	random_hex,
} from '../lib.js?v=130'

import STATE from '../world/STATE.js?v=130'
import BROKER from '../world/WorldBroker.js?v=130'
import TOONS from '../world/TOONS.js?v=130'
import PLAYER from '../world/PLAYER.js?v=130'
import CAMERA from '../world/CAMERA.js?v=130'
import RENDERER from '../world/RENDERER.js?v=130'

import BUBBLES from './BUBBLES.js?v=130'





const ele = document.createElement('div')
ele.id = 'threepress-chat'
ele.addEventListener('mousedown', () => {
	BROKER.publish('WORLD_SET_ACTIVE', { state: true })
})
const content = document.createElement('div')
content.id = 'threepress-chat-content'
const input = document.createElement('input')
input.id = 'threepress-chat-input'
input.placeholder = 'type \'/h\' for help'
input.autocomplete = 'off'



const slider = document.createElement('div')
slider.innerHTML = '-'
slider.classList.add('flex-wrapper', 'slider', 'no-select')
slider.addEventListener('mousedown', () => {
	document.addEventListener('mousemove', track_slider )
})
document.addEventListener('mouseup', () => {
	document.removeEventListener('mousemove', track_slider )
})

let rBound, relativeMouseHeight
const track_slider = e => {
	rBound = RENDERER.domElement.parentElement.getBoundingClientRect()
	relativeMouseHeight = e.clientY - rBound.top
	ele.style.height = Math.min( rBound.height - 10, Math.max( rBound.height - relativeMouseHeight, 40 ) ) + 'px'
	// console.log( e, ele.style.height )
}


ele.appendChild( content )
ele.appendChild( input )
ele.appendChild( slider )

const copy_vector = new Vector3()
const bubble_offset = new Vector3( 20, 100, 0 )



class Chat {

	constructor( init ){

		init = init || {}
		this.sender = init.sender || '(anonymous)'
		this.sender_uuid = init.sender_uuid || ''
		this.msg = init.msg || ''

		if( !init.type ) init.type = 'say' 

		this.ele = document.createElement('div')
		this.ele.classList.add('chat-msg', init.type)
		this.sender = document.createElement('div')
		this.sender.classList.add('chat-msg-sender' )
		if( init.self ){
			this.sender.classList.add('self')
		}else{
			this.sender.style.color = '#' + init.color
		}
		this.sender.setAttribute('data-uuid', init.uuid )

		this.sender.innerHTML = init.sender
		this.msg = document.createElement('div')
		this.msg.classList.add('chat-msg-content')
		this.msg.innerText = init.msg

		this.ele.appendChild( this.sender )
		this.ele.appendChild( this.msg )

	}

}






class Bubble {

	constructor( init ){

		init = init || {}

		this.type = init.type
		this.hash = random_hex( 6 )
		this.type = init.type
		this.sender_uuid = init.sender_uuid
		// this.sender = init.sender
		this.msg = init.msg
		this.color = init.color

		this.self = init.self

		this.ele = document.createElement('div')
		this.ele.classList.add('chat-bubble', this.type )
		// this.ele.style.color = '#' + this.color
		this.ele.style.border = '1px solid #' + this.color
		this.ele.innerHTML = `${ this.msg }`

		this.bound = false

		this.posX = 0
		this.posY = 0

		// console.log( this )
		// this.overhang_b = 0
		// this.overhang_l = 0

	}

	update_position(){

		const object = TOONS[ this.sender_uuid ]
		if( !object ){
			console.log('no chat bubble')
			return
		}

		copy_vector.copy( object.GROUP.position )

		// map to normalized device coordinate (NDC) space
		copy_vector.project( CAMERA )

		this.wrapper_bound = RENDERER.domElement.getBoundingClientRect()
		// map to 2D screen space
		// copy_vector.x = Math.round( (   copy_vector.x + 1 ) * this.wrapper_bound.width * STATE.blur_divisor / 2 )  
		// copy_vector.y = Math.round( ( - copy_vector.y + 1 ) * this.wrapper_bound.height * STATE.blur_divisor / 2 ) 
		copy_vector.x = Math.round( (   copy_vector.x + 1 ) * this.wrapper_bound.width / 2 )  
		copy_vector.y = Math.round( ( - copy_vector.y + 1 ) * this.wrapper_bound.height / 2 ) 
		// copy_vector.z = Math.round( ( - copy_vector.y + 1 ) * canvas.height / 2 )
		copy_vector.z = 0;
		// copy_vector.y = 0;

		// console.log( copy_vector.x, copy_vector.y )
		// console.log( this.wrapper_bound.width )

		this.posX = copy_vector.x + bubble_offset.x // window.blaX || 50
		this.posY = copy_vector.y - bubble_offset.y // window.blaY || 0

		if( this.self ){

			this.ele.style.top = Math.min( this.posY, this.wrapper_bound.height / 2 ) + 'px'
			this.ele.style.left = this.wrapper_bound.width / 2 + 30 + 'px'

		}else{

			this.bound = this.ele.getBoundingClientRect()

			if( this.posX + this.bound.width > this.wrapper_bound.width ){
				this.ele.style.left = 'auto'
				this.ele.style.right = '0px'
			}else{
				this.ele.style.left = this.posX + 'px'
				this.ele.style.right = 'auto'
			}

			if( this.posY + this.bound.height > this.wrapper_bound.height ){
				this.ele.style.top = 'auto'
				this.ele.style.bottom = '0px'
			}else{
				this.ele.style.top = this.posY + 'px'
				this.ele.style.bottom = 'auto'
			}
		}

	}

}










const publish_chat = ( type, msg, receiver_uuid ) => { // receiver_handle

	msg = msg.replace(/^\/[a-z]* /, '')

	BROKER.publish('SOCKET_SEND', {
		type: 'chat',
		chat_type: type,
		msg: msg,
		receiver_uuid: receiver_uuid,
		// receiver_handle: receiver_handle,
	})

}





let match

const parse_command = () => {

	match = input.value.match(/^\/[a-z]{1,3}/)

	if( match ){

		switch( match[0] ){
			case '/h':
				input.classList.add('has-command')
				input.setAttribute('data-type', 'help')
				break;

			case '/s':
				input.classList.add('has-command')
				input.setAttribute('data-type', 'say')
				break;

			// case '/t':
			// 	if( STATE.target_uuid && TOONS[ STATE.target_uuid ] ){
			// 		input.setAttribute('data-receiver_uuid', STATE.target_uuid )
			// 		input.value = 'tell ' + TOONS[ STATE.target_uuid ].handle
			// 	}else{
			// 		input.value = 'tell '
			// 	}
			// 	input.setAttribute('data-type', 'tell')
			// 	break;

			case '/y': 
				input.classList.add('has-command')
				input.setAttribute('data-type', 'yell')
				break;

			default: 

				// input.classList.remove('has-command')
				break;

		}

	}else{

		input.setAttribute('data-type', '')
		input.classList.remove('has-command')

	}

}



const clear_chat = () => {
	input.value = ''
	// input.blur()
	input.classList.remove('has-command')
	input.setAttribute('data-type', '')
	return false			
}



let chat_msg

const chat_send = event => {

	chat_msg = input.value.trim()

	if( chat_msg.length > 300 ){
		hal('error', '300 char max (' + chat_msg.length + ' current)', 3000)
		return false
	}

	if( !chat_msg.length )  return clear_chat()

	if( input.getAttribute('data-type') ){
		switch( input.getAttribute('data-type')){
			case 'help':
				print_help()
				return clear_chat()
			case 'say':
				publish_chat('say', chat_msg, false, false )
				return clear_chat()
			case 'yell':
				publish_chat('yell', chat_msg, false, false )
				return clear_chat()
			default: 
				return clear_chat()
				break;
		}
	}

	// if( input.value.match(/^[a-z]*\: *$/) ){ // parsed command with no argument
	// 	input.value = ''
	// 	input.blur()
	// 	return false
	// }

	publish_chat( input.getAttribute('data-type'), chat_msg, input.getAttribute('data-receiver_uuid') )

	clear_chat()

}







const print_help = () => {

	const help = new Chat({
		sender: 'system',
		uuid: '',
		type: 'system',
// "/t " for Tell (only your target will receive it)
		msg: `
commands:
"/s " for Say (or leave empty - it's default)
"/y " for Yell (everyone in gallery will hear it)
`
// Click the hammer to view available spots to post your art

	})

	content.appendChild( help.ele )

}


const chat_focus = event => {
	input.focus()
}
const chat_focus_alt = event => {
	chat_focus()
	input.value = '/'
}
const chat_blur = event => {
	input.blur()
}

input.addEventListener('focus', () => {
	STATE.set('chat')
})
input.addEventListener('blur', () => {
	STATE.splice('chat')
})

content.addEventListener('click', chat_focus )

input.addEventListener('keyup', e => {
	parse_command()
})





const append_chat = ele => {

	// console.log('append_chat ', ele )

	const chats = document.getElementsByClassName('chat-msg')
	const diff = chats.length - 50
	for( let i = 0; i < diff; i++ ){
		chats[ 0 ].remove()
	}

	content.appendChild( ele )

	content.scroll( 0, 9999 )

}






const add_chat = event => {

	const { sender_uuid, chat_type, msg, color } = event

	const player1 = sender_uuid === PLAYER.uuid

	if( chat_type == 'system'){

		const chat = new Chat({
			sender: 'system',
			color: color,
			uuid: sender_uuid,
			type: chat_type,
			msg: msg,
		})

		append_chat( chat.ele )

	}else{

		const sender = TOONS[ sender_uuid ]
		if( !sender ){
			console.log('invalid chat: ', event )
			return false
		}
		const handle = sender.handle

		const chat = new Chat({
			sender: handle,
			color: color,
			uuid: sender_uuid,
			type: chat_type,
			msg: msg,
			self: player1,
		})

		append_chat( chat.ele )

		if( player1 && STATE.first_person ){

			// no bubble

		}else{

			const bubble = new Bubble({
				sender: handle,
				sender_uuid: sender_uuid,
				type: chat_type,
				msg: msg,
				color: sender.color,
				self: player1,
			})
			RENDERER.domElement.parentElement.appendChild( bubble.ele )
			bubble.update_position()
			BUBBLES[ bubble.hash ] = bubble

			setTimeout(function(){
				bubble.ele.remove()
				delete BUBBLES[ bubble.hash ]
			}, 6000 )

			begin_bubbles()

		}

	}



}








let update_bubbles = false

const begin_bubbles = () => {

	if( !update_bubbles ){
		update_bubbles = setInterval(() => {
			if( Object.keys( BUBBLES ).length ){
				for( const hash in BUBBLES ){
					BUBBLES[ hash ].update_position()
				}
			}else{
				end_bubbles()
			}
		}, 200)
	}

}

const end_bubbles = () => {
	clearInterval( update_bubbles )
	update_bubbles = false
}




const init = () => {
	BROKER.subscribe('CHAT_FOCUS', chat_focus )
	BROKER.subscribe('CHAT_FOCUS_ALT', chat_focus_alt )
	BROKER.subscribe('CHAT_SEND', chat_send )
	BROKER.subscribe('CHAT_BLUR', chat_blur )
	BROKER.subscribe('CHAT_ADD', add_chat )

	const wrapper = document.querySelector('#threepress-ui-wrapper')
	wrapper.appendChild( ele )
	// RENDERER.domElement()

}


export default {
	init,
	ele,
}