import Gallery from './Gallery.js'
// import BROKER from './helpers/EventBroker.js'

import {
	Box3,
	Vector3,
} from '../inc/three.module.js'


// ------------------------------------------------------------ declarations


const alert_contain = document.createElement('div')
alert_contain.id = 'alert-contain-3p'
document.body.appendChild( alert_contain )








const hal = ( type, msg, time ) => {

	let icon = ''

	const alert_wrapper = document.createElement('div')
	const alert_msg = document.createElement('div')
	const close = document.createElement('div')

	if( !type ) type = 'standard'

	close.innerHTML = '&times;'
	close.classList.add('alert-close-3p')

	icon = '<div></div>'

	alert_msg.innerHTML = `<div class='alert-icon-3p type-${ type }'>${ icon }</div>${ msg }`
	alert_wrapper.classList.add('ui-fader')
	alert_msg.classList.add('alert-msg-3p' ) // , 'hal-' + type
	alert_msg.appendChild( close )
	alert_wrapper.appendChild( alert_msg )

	alert_contain.appendChild( alert_wrapper )


	close.onclick = function(){
		alert_wrapper.style.opacity = 0
		setTimeout(function(){
			alert_wrapper.remove()
		}, 500)
	}

	if( time ){
		setTimeout(function(){
			alert_wrapper.style.opacity = 0
			setTimeout(function(){
				alert_wrapper.remove()
			}, 500)
		}, time)
	}
	
}









let spinning = false

class Spinner{

	constructor( init ){
		init = init || {}
		this.ele = init.ele || document.createElement('div')
		this.ele.classList.add('threepress-spinner')
		this.img = init.img || document.createElement('img')
		this.img.src = this.img.src || init.src
		this.ele.appendChild( this.img )

		document.body.appendChild( this.ele )
	}

	show( ele ){
		if( ele ){
			if( getComputedStyle( ele ).position === 'static' ) ele.style.position = 'relative'
			this.ele.style.position = 'absolute'
			ele.prepend( this.ele )
		}else{
			this.ele.style.position = 'fixed'
			document.body.prepend( this.ele )
		}
		this.ele.style.display = 'flex'
		if( spinning ){
			clearTimeout(spinning)
			spinning = false
		}
		spinning = setTimeout(()=>{
			clearTimeout(spinning)
			spinning = false
		}, 10 * 1000)
	}

	hide(){
		this.ele.remove()
	}

}



const spinner = window.spinner = new Spinner({
	src: THREEPRESS.plugin_url + '/assets/giffer9.gif'
})




class ModelRow {  
	// takes BOTH wp.media return values, AND wp_post attachment values as {init}
	// these are references to the same objects (models) with completely different syntax
	// so this constructor is made with care

	constructor( init ){
		init = init || {}
		this.id = init.ID || init.id
		this.title = init.post_title || init.title
		this.name = init.post_name || init.name
		this.url = init.guid || init.url
		this.date = init.post_date || init.date
		this.name = init.post_name || init.name
		this.thumb_url = init.thumb_img || THREEPRESS.plugin_url + 'assets/helper.png'
	}

	gen_row(){

		const row = document.createElement('div')
		row.classList.add('row', 'threepress-row', 'threepress-model-row')
		row.setAttribute('data-id', this.id )
		const title = document.createElement('div')
		title.classList.add('column', 'column-3')
		title.title = 'title'
		// title.innerText = this.title
		const a = document.createElement('a')
		a.href = THREEPRESS.home_url + '/wp-admin/post.php?post=' + this.id + '&action=edit'
		a.innerText = this.title 
		title.appendChild( a )
		row.appendChild( title )
		const thumb = document.createElement('div')
		thumb.classList.add('threepress-row-icon')
		const thumb_img = document.createElement('img')
		thumb_img.src = this.thumb_url
		thumb.appendChild( thumb_img )
		title.prepend( thumb )
		// const name = document.createElement('div')
		// name.title = 'name'
		// name.classList.add('column', 'column-3')
		// name.innerText = this.name
		// row.appendChild( name )
		const date = document.createElement('div')
		date.title = 'date created'
		date.classList.add('column', 'column-3')
		date.innerText = new Date( this.date ).toLocaleString()
		row.appendChild( date )
		const id = document.createElement('div')
		id.title = 'model id'
		id.classList.add('column', 'column-3')
		id.innerText = this.id
		row.appendChild( id )
		const url = document.createElement('div')
		url.classList.add('column', 'url')
		// url.innerText = this.url
		const input = document.createElement('input')
		// input.type = 'text'
		input.setAttribute('readonly', true )
		input.value = this.url
		url.appendChild( input )
		row.appendChild( url )

		const viz = document.createElement('div')
		viz.classList.add('model-row-preview', 'threepress-button')
		const eye = document.createElement('img')
		eye.src = THREEPRESS.plugin_url + 'assets/eye-viz.png'
		viz.appendChild( eye )
		row.appendChild( viz )
		viz.addEventListener('click', () => {
			const gallery = Gallery({
				preview_type: 'model',
				model: { guid: input.value.trim() },
				name: '',
				rotate_scene: true,
				rotate_y: 1,
				bg_color: 'linear-gradient(45deg, white, transparent)',
				controls: 'orbit',
			})
			gallery.preview()
		})

		return row
	}

}




const fetch_wrap = ( url, method, body, no_spinner ) => {

	return new Promise(( resolve, reject ) => {

		body.threepress_post = true
		body.nonce = THREEPRESS.nonce

		if( !no_spinner ) spinner.show()

		jQuery.ajax({
			url : url,
			data : body,
			method : method,
		})
		.then( res => {

			try{
				const r = JSON.parse( res )
				resolve( r )
			}catch( e ){
				console.log( res )
				reject( e )
			}
			spinner.hide()
		})
		.catch( err => {
			spinner.hide()
			reject( err  )
		})

	})

}








const render = type => {

	switch( type ){

		case 'ftd_model':

			const ftd_img = document.querySelector('.woocommerce-product-gallery figure img')

			if( ftd_img ){
				const model = THREEPRESS.data.model_choice
				if( !model ){
					log('invalid model init')
					return
				}
				const gallery = Gallery({
					overlay: ftd_img,
				})
				gallery.align()
				gallery.animating = true
				gallery.init_scene().catch( err => {
					console.log( err )
				})
				document.body.appendChild( gallery.ele )
			}else{
				log('error', 'no featured image found')
			}
			break;

		default: break;
	}


}






const fill_dimensions = model => {

	model.userData = model.userData || {}
	model.userData.box3 = new Box3().setFromObject( model )
	model.userData.dimensions = new Vector3()
	
	model.userData.box3.getSize( model.userData.dimensions )

	const temp = new Vector3().copy( model.userData.dimensions ).divideScalar( 2 )
	model.userData.radius = Math.max( temp.x, temp.y, temp.z )

}









const origin = new Vector3( 0, 0, 0 )




const set_contingents = ( contingents, enabled ) => {
	for( const ele of contingents ){
		enabled ? ele.classList.remove('threepress-disabled') : ele.classList.add('threepress-disabled')
	}
}



let model_frame = false

const model_selector = ( callback ) => {

	if( model_frame ){
		model_frame.open()
		return
	}

	model_frame = new wp.media.view.MediaFrame.Select({
		title: 'Select model',
		multiple: false,
		library: {
			order: 'ASC',
			orderby: 'title',
			type: 'application/octet-stream',
			search: null,
			uploadedTo: null
		},

		button: {
			text: 'set model'
		}
	})

	model_frame.on( 'select', function() {

		const attachment = model_frame.state().get('selection').first().toJSON()
		console.log('attachment selected: ', attachment)
		const model = new ModelRow( attachment )
		const row = model.gen_row()
		
		callback( attachment.id, row )

	});

	model_frame.open()

}



const val_boolean = ( ...values ) => {
	for( const val of values ){
		if( typeof val === 'boolean' ) return val
		if( val ) return true
	}
	return values[ values.length - 1 ]
}




export {

	// base ui functions
	hal,
	render,
	fetch_wrap,

	// base app classes
	ModelRow,
	Spinner,
	Gallery,

	// helper functions
	fill_dimensions,
	origin,
	set_contingents,
	model_selector,

	// validations
	val_boolean,

}

