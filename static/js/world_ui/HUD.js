import RENDERER from '../world/RENDERER.js?v=130'
import BROKER from '../world/WorldBroker.js?v=130'
import { Modal } from '../helpers/Modal.js?v=130'
import BINDS from '../controls/BINDS.js?v=130'
import STATE from '../world/STATE.js?v=130'
import { 
	fetch_wrap,
	hal,
	random_hex,
	spinner,
} from '../lib.js?v=130'






const build_action = ( type ) => {

	let ele =document.createElement('div')

	switch( type ){
		case 'install':
			ele.classList.add('world-action-button', 'button')
			ele.innerHTML = type
			ele.addEventListener('click', () => {
				BROKER.publish('ACTION', {
					type: type,
				})
			})
			break;

		default: 	
			console.log('unknown action', type)
			break;
	}

	return ele

}









let wrapper

const toggle = document.createElement('div')
toggle.id = 'threepress-admin-toggle'
toggle.innerHTML = 'menu'
toggle.addEventListener('click', () => {
	BROKER.publish('ADMIN_TOGGLE')
})

const actions = document.createElement('div')
actions.id = 'threepress-actions'
const install = build_action('install')
actions.appendChild( install )

// actions.innerHTML = 'actions'
// actions.addEventListener('click', () => {
// 	BROKER.publish('ACTIONS_TOGGLE')
// })




const toggle_admin = event => {
	const modal = new Modal({
		type: 'admin'
	})

	const menu = document.createElement('div')
	menu.id = 'threepress-admin-world-nav'

	add_section( 'toon', modal.content, menu )
	add_section( 'settings', modal.content, menu )
	add_section( 'keys', modal.content, menu )

	modal.content.appendChild( menu )

	wrapper.appendChild( modal.ele )

	modal.content.querySelector('.threepress-admin-tab').click()

}

// const toggle_actions = event => {
// 	const modal = new Modal({
// 		type: 'actions'
// 	})

// 	const menu = document.createElement('div')
// 	menu.id = 'threepress-actions-world-nav'

// 	add_section( 'actions', modal.content, menu )

// 	modal.content.appendChild( menu )

// 	wrapper.appendChild( modal.ele )

// 	modal.content.querySelector('.threepress-admin-tab').click()

// }

const add_section = ( type, container, menu ) => {

	add_tab( type, container, menu )

	let section = document.createElement('div')
	section.classList.add('threepress-admin-section')
	section.setAttribute('data-type', type )

	switch( type ){
		case 'keys':
			const guide = BINDS._generate_guide()
			section.appendChild( guide )
			// section.innerHTML = 'settings content...'
			break;

		case 'settings':
			section.innerHTML = 'in development...'
			break;

		case 'toon':
			const toonlist = document.createElement('div')
			const toonfetch = document.createElement('div')
			toonfetch.classList.add('threepress-button')
			toonfetch.innerHTML = 'view available toons'
			toonfetch.addEventListener('click', () => {
				fetch_wrap( THREEPRESS.ARCADE.URLS.https + '/toon_listing', 'get')
				.then( res => {
					if( res && res.success ){
						toonlist.innerHTML = ''
						for( const toon of res.toons ){
							toonlist.appendChild( build_toon_listing( toon ) )
						}
						if( !res.toons.length ) hal('error', 'no more toons were found available', 5000 )
					}else{
						hal('error', res ? ( res.msg || 'error retrieving toons' ) : 'error fetching toons', 5000 )
					}
					console.log( res )
				})
				.catch(err => {
					console.log( err )
					hal('error', 'error fetching toons', 5000)
				})
			})
			section.appendChild( toonfetch )
			section.appendChild( toonlist )
			break;


		// case 'actions':
		// 	const install = document.createElement('div')
		// 	install.classList.add("threepress-button")
		// 	install.innerHTML = 'install'
		// 	install.addEventListener('click', () => {
		// 		// const close = container.parentElement.querySelector('.threepress-modal-close')
		// 		// if( close ) close.click()
		// 		const hash = random_hex( 6 )
		// 		BROKER.publish('SOCKET_SEND', {
		// 			type: 'ping_admin_domain',
		// 			hash: hash,
		// 		})
		// 		container.parentElement.setAttribute('data-await-hash', hash )
		// 		setTimeout(() => {
		// 			if( container.parentElement.getAttribute('data-await-hash') ){
		// 			// 	// a valid response will remove hash so this doesn't happen
		// 				hal('error', 'install request was blocked', 3000 )
		// 				container.parentElement.removeAttribute('data-await-hash')
		// 			}
		// 		}, 3000)
		// 	})
		// 	section.appendChild( install )
		// 	break;

		default: 
			console.log('admin section not configured yet: ', type )
			break;
	}

	container.appendChild( section )

}

const add_tab = ( type, container, menu ) => {
	const tab = document.createElement('div')
	tab.innerHTML = type
	tab.classList.add('threepress-admin-tab', 'threepress-button')
	tab.addEventListener('click', () => {
		console.log('clicked', type )
		for( const tab of menu.querySelectorAll('.threepress-admin-tab')) tab.classList.remove('selected')
		tab.classList.add('selected')
		for( const section of container.querySelectorAll('.threepress-admin-section')) section.classList.remove('selected')
		container.querySelector('.threepress-admin-section[data-type="'+type+'"]').classList.add('selected')
	})
	menu.appendChild( tab )
}


const build_toon_listing = res => {

	const { filename, modeltype } = res

	const formatted = filename.replace(/_/g, ' ')
	.replace(/.gltf/i, '')
	.replace(/.glb/i, '')
	.replace(/.fbx/i, '')

	const wrapper = document.createElement('div')
	wrapper.classList.add('threepress-toon-listing')
	// wrapper.setAttribute('data-slug', filename )
	const namediv = document.createElement('div')
	namediv.innerHTML = formatted
	wrapper.appendChild( namediv )
	// const img = document.createElement('img')
	// img.src = THREEPRESS.ARCADE.URLS.https + '/resource/world-model-img/' + filename + '.jpg'
	// wrapper.appendChild( img )
	wrapper.addEventListener('click', () => {
		// if( !confirm('set ' + formatted + ' to be your new toon?') ) return
		const close = document.querySelector('.threepress-modal-close')
		if( close ) close.click()
		BROKER.publish('SOCKET_SEND', {
			type: 'update_toon_model',
			modeltype: modeltype,
			filename: filename,
		})
	})

	return wrapper

}


















const create_install_form = modal => {

	const form = document.createElement('div')
	form.classList.add('threepress-install-form')
	const expl = document.createElement('div')
	expl.innerHTML = 'paste the URL of an image (png / jpg / jpeg) or 3d model (glb / gltf)'
	form.appendChild( expl )
	const input = document.createElement('input')
	input.type = 'text'
	input.placeholder = 'paste URL here'
	input.addEventListener('keyup', e => {
		if( e.keyCode === 13 ){
			submit_install( input.value.trim(), submit )
		}
	})
	if( THREEPRESS.home_url.match(/localhost/i) ){
		setTimeout(()=>{
			input.value = THREEPRESS.ARCADE.URLS.https + '/resource/image/quaternius-chat.jpg'
		}, 500 )
	}
	form.appendChild( input )
	const submit = document.createElement('div')
	submit.classList.add('threepress-button')
	submit.innerHTML = 'submit'
	submit.addEventListener('click', () => {
		submit_install( input.value.trim(), submit )
	})
	form.appendChild( submit )
	setTimeout(() => {
		input.focus()
	}, 100 )

	return form

}



const allow_upload = event => {

	const { hash, is_admin } = event

	// const modal = document.querySelector('.threepress-modal[data-await-hash="' + hash + '"]')
	// if( !modal ){
	// 	console.log('got admin for non-existent modal', is_admin )
	// 	return
	// }

	// for( const button of modal.querySelectorAll('.threepress-button')){
	// 	if( button.innerText.match(/install/i)){
	// 		button.remove()
	// 	}
	// }

	// modal.removeAttribute('data-await-hash')

	console.log('  event', event )

	const current_hash = RENDERER.domElement.getAttribute('data-await-hash')

	if( current_hash !== hash ){
		console.log('got upload permissions for non existent request', hash, current_hash )
		return 
	}

	const modal = new Modal({
		type: 'create_install'
	})

	// const section = modal.querySelector('.threepress-admin-section')

	const form = create_install_form( modal )

	modal.content.appendChild( form )

	wrapper.appendChild( modal.ele )

	// section.appendChild( form )

}



const submit_install = ( value, submit ) => {

	if( typeof value !== 'string' ) return

	BROKER.publish('SOCKET_SEND', {
		type: 'begin_install',
		url: value,
	})

	submit.style['pointer-events'] = 'none'
	hal('standard', 'querying resource....', 4000 )

	spinner.show()

}




const handle_hold = event => {
	/*
		initiate a hold from server
	*/

	const { 
		url, 
		state, 
		msg, 
		resource_type 
	} = event

	spinner.hide()

	const modal = document.querySelector('.threepress-modal')	

	if( !state ){
		modal?.querySelectorAll('.threepress-button').forEach( ele => {
			ele.style['pointer-events'] = 'initial'
		})
		hal('error', msg, 5000)
		BROKER.publish('CLEAR_HOLD')
		return
	}

	modal?.querySelector('.threepress-modal-close')?.click()

	BROKER.publish('RENDER_HOLD', {
		type: resource_type,
		url: url,
	})

}



const handle_action = event => {

	const { type } = event

	switch( type ){

		case 'install':

			const hash = random_hex( 6 )

			BROKER.publish('SOCKET_SEND', {
				type: 'ping_admin_domain',
				hash: hash,
			})

			RENDERER.domElement.setAttribute('data-await-hash', hash )
			// container.parentElement.setAttribute('data-await-hash', hash )

			// setTimeout(() => {
			// 	if( container.parentElement.getAttribute('data-await-hash') ){
			// 	// 	// a valid response will remove hash so this doesn't happen
			// 		hal('error', 'install request was blocked', 3000 )
			// 		container.parentElement.removeAttribute('data-await-hash')
			// 	}
			// }, 3000)

			break;

		default: 
			console.log('unknown action: ', type )
			break;

	}

}





const init = () => {

	wrapper = RENDERER.domElement.parentElement
	wrapper.appendChild( toggle )
	wrapper.appendChild( actions )

	BROKER.subscribe('ADMIN_TOGGLE', toggle_admin )
	// BROKER.subscribe('ACTIONS_TOGGLE', toggle_actions )
	BROKER.subscribe('WORLD_PONG_ADMIN', allow_upload )
	BROKER.subscribe('WORLD_BEGIN_INSTALL', handle_hold )
	BROKER.subscribe('ACTION', handle_action )


}

export default {
	init,
}