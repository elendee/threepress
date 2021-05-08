import Canvas from './Canvas.js'
import BROKER from './helpers/EventBroker.js'

import {
	Box3,
	Vector3,
} from './three.module.js'


// ------------------------------------------------------------ declarations


const alert_contain = document.createElement('div')
alert_contain.id = 'alert-contain-3p'
document.body.appendChild( alert_contain )





// const log = (type, ...msgs) => {

//     const line = new Error().stack.split(/\n/)[2]
// 	if( typeof line !== 'string' ) line = '(invalid log call)'

// 	const call = '...' + line.substr( line.length - 30 )

//     // Define different types of styles
//     const baseStyles = [
//         "color: #fff",
//         "background-color: rgba(0, 0, 0, 0)",
//         "padding: 1px 3px",
//         "border-radius: 2px"
//     ].join(';');

//     const types = {
//     	success: [
// 	        "color: #eee",
// 	        "background-color: green"
// 	    ].join(';'),
// 	    standard: [
// 	    	'color: #eee',
// 	    	'background-color: none',
// 	    ].join(';'),
// 	    warn: [
// 	        "background-color: orange"
// 	    ].join(';'),
// 	    error: [
// 	        "background-color: rgb(100, 0, 0)"
// 	    ].join(';'),
// 	}
    
//     let style = baseStyles + ';';

//     if( type && types[ type ]){
//     	style += types[ type ]
//     }else{
//     	msgs.unshift( type )
//     }

//     if( msgs.length > 1 ){
//     	console.log(`%cthreepress:`, style )
//     	for( const msg of msgs ){	
// 		    console.log(`%c${ msgs }`, baseStyles ); // 'background-color: none'
//     	}
//     }else{
// 	    console.log(`%cthreepress:%c${ msgs }`, style, baseStyles ); // 'background-color: none'
//     }
//     console.log('		' + call )

// }




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
		row.classList.add('row', 'threepress-row', 'model-row')
		row.setAttribute('data-id', this.id )
		const title = document.createElement('div')
		title.classList.add('column', 'column-4')
		title.title = 'title'
		title.innerText = this.title
		row.appendChild( title )
		const thumb = document.createElement('div')
		thumb.classList.add('model-thumb')
		const thumb_img = document.createElement('img')
		thumb_img.src = this.thumb_url
		thumb.appendChild( thumb_img )
		title.prepend( thumb )
		const name = document.createElement('div')
		name.title = 'name'
		name.classList.add('column', 'column-4')
		name.innerText = this.name
		row.appendChild( name )
		const date = document.createElement('div')
		date.title = 'date created'
		date.classList.add('column', 'column-4')
		date.innerText = new Date( this.date ).toLocaleString()
		row.appendChild( date )
		const id = document.createElement('div')
		id.title = 'model id'
		id.classList.add('column', 'column-4')
		id.innerText = this.id
		row.appendChild( id )
		const url = document.createElement('div')
		url.classList.add('column', 'url')
		url.innerText = this.url
		row.appendChild( url )
		return row
	}

}


class GalleryRow {

	constructor( init ){
		init = init || {}
		this.id = init.id || this.id
		this.name = init.name || this.name
		this.created = init.created || this.created
		this.shortcode = init.content || this.shortcode
		this.edited = init.edited || this.edited
		this.model_id = init.model_id || this.model_id 
	}

	gen_row(){

		const gallery = this
		const row = document.createElement('div')
		row.classList.add('row', 'threepress-row')
		row.setAttribute('data-id', this.id )
		const name = document.createElement('div')
		name.classList.add('column', 'column-3')
		name.title = 'name'
		name.innerText = this.name
		row.appendChild( name )
		const edited = document.createElement('div')
		edited.classList.add('column', 'column-3')
		edited.title = 'edited'
		edited.innerText = new Date( this.edited ).toDateString()
		row.appendChild( edited )
		const content = document.createElement('div')
		content.classList.add('column', 'column-3')
		content.title = 'shortcode'
		const shortcode = document.createElement('input')
		shortcode.setAttribute('readonly', true )// = true
		shortcode.value = this.shortcode
		content.appendChild( shortcode )
		row.appendChild( content )

		const deleteRow = document.createElement('div')
		deleteRow.classList.add('delete')
		deleteRow.innerHTML = '&times;'
		deleteRow.addEventListener('click', () => {
			if( confirm('delete?')){
				fetch_wrap( ajaxurl, 'post', {
					action: 'delete_gallery',
					id: gallery.id,
				}, false)
				.then( res => {
					console.log( res )
					if( res.success ){
						row.remove()
					}else{
						hal('error', res.msg || 'error deleting row', 5000 )
					}
				})	
				.catch( err => {
					console.log( err )
					hal('error', err.msg || 'error deleting row', 5000 )
				})
			}
		})
		row.appendChild( deleteRow )

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
				const canvas = Canvas({
					overlay: ftd_img,
				})
				canvas.align()
				canvas.animating = true
				canvas.init().catch( err => {
					log('error', err )
				})
				document.body.appendChild( canvas.ele )
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





















export {

	// base ui functions
	hal,
	render,
	fetch_wrap,

	// base app classes
	ModelRow,
	GalleryRow,
	Spinner,
	Canvas,

	// helper functions
	fill_dimensions,

}

