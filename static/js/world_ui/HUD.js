import RENDERER from '../world/RENDERER.js?v=121'
import BROKER from '../world/WorldBroker.js?v=121'
import { Modal } from '../helpers/Modal.js?v=121'
import BINDS from '../controls/BINDS.js?v=121'
import { 
	fetch_wrap,
	hal,
} from '../lib.js?v=121'


let wrapper

const toggle = document.createElement('div')
toggle.id = 'threepress-admin-toggle'
toggle.innerHTML = 'menu'
toggle.addEventListener('click', () => {
	BROKER.publish('ADMIN_TOGGLE')
})

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

	const wrapper = document.createElement('div')
	wrapper.classList.add('threepress-toon-listing')
	// wrapper.setAttribute('data-slug', filename )
	const namediv = document.createElement('div')
	namediv.innerHTML = filename.replace(/_/g, ' ').replace(/.gltf/i, '').replace(/.glb/i, '').replace(/.fbx/i, '')
	const img = document.createElement('img')
	img.src = THREEPRESS.ARCADE.URLS.https + '/resource/world-model-img/' + filename + '.jpg'
	wrapper.appendChild( namediv )
	wrapper.appendChild( img )
	wrapper.addEventListener('click', () => {
		if( !confirm('set this to be your new toon?') ) return
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





const init = () => {

	wrapper = RENDERER.domElement.parentElement
	wrapper.appendChild( toggle )

	BROKER.subscribe('ADMIN_TOGGLE', toggle_admin )

}

export default {
	init,
}