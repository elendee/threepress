import ThreepressGallery from './ThreepressGallery.js?v=140'
import '../inc/seedrandom.js?v=140'
import {
	Box3,
	Vector3,
} from '../inc/three.module.js?v=140'




const logging = false
const tstack = file => {
	if( logging ) console.log('threepress stack: ', file )
}
tstack('lib.js')



const URLS = localStorage.getItem('threepress-arcade-urls')
THREEPRESS.ARCADE = THREEPRESS.ARCADE || {}
if( URLS ){
	THREEPRESS.ARCADE.URLS = JSON.parse( URLS )
}else{
	THREEPRESS.ARCADE.URLS = {
		websocket: 'wss://arcade.threepress.shop/ws:9011',
		https: 'https://arcade.threepress.shop',
	}
}






// ------------------------------------------------------------ declarations


const alert_contain = document.createElement('div')
alert_contain.id = 'alert-contain-3p'
document.body.appendChild( alert_contain )






const hal = THREEPRESS.hal = ( type, msg, time ) => {

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
		this.caption = init.post_excerpt || init.caption
		this.thumb_url = init.thumb_img || THREEPRESS.plugin_url + '/assets/helper.png'
		this.form = init.form
	}

	gen_row(){

		const obj = this

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

		if( this.caption ){
			const caption = document.createElement('div')
			caption.classList.add('column')
			caption.innerHTML = this.caption
			row.appendChild( caption )
		}

		const viz = document.createElement('div')
		viz.classList.add('model-row-preview', 'threepress-button')
		const eye = document.createElement('img')
		eye.src = THREEPRESS.plugin_url + '/assets/eye-viz.png'
		viz.appendChild( eye )
		viz.addEventListener('click', () => {
			const gallery_preview = ThreepressGallery({
				preview_type: 'model',
				model_row: row,
				model: { 
					guid: input.value.trim(),
				},
				name: '',
				rotate_scene: true,
				bg_color: 'linear-gradient(45deg,white,transparent)',
				controls: 'orbit',
				form: document.createElement('form'),// obj.form,
			})
			gallery_preview.preview()
		})
		row.appendChild( viz )

		return row
	}

}





class ImageRow {  

	constructor( init ){
		init = init || {}
		this.id = init.ID || init.id
		this.title = init.post_title || init.title
		this.name = init.post_name || init.name
		this.url = init.guid || init.url
		this.date = init.post_date || init.date
		this.name = init.post_name || init.name
		this.caption = init.post_excerpt || init.caption
		this.thumb_url = init.thumb_img || THREEPRESS.plugin_url + '/assets/helper.png'
		this.form = init.form
	}

	gen_row(){

		const obj = this

		const row = document.createElement('div')
		row.classList.add('row', 'threepress-row', 'threepress-image-row')
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
		thumb.classList.add('threepress-row-icon') // blorb < change to img icon <
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
		id.title = 'image id'
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

		if( this.caption ){
			const caption = document.createElement('div')
			caption.classList.add('column')
			caption.innerHTML = this.caption
			row.appendChild( caption )
		}

		return row
	}

}




const fetch_wrap = ( url, method, body, no_spinner ) => {

	return new Promise(( resolve, reject ) => {

		if( !no_spinner ) spinner.show()

		let data = {}

		if( method.match(/post/i)){
			data.url = url
			data.data = body
			data.method = method
		}else{
			data = url
		}

		jQuery.ajax( data )
		.then( res => {
			if( typeof res === 'string' ){
				try{
					const r = JSON.parse( res )
					resolve( r )
				}catch( e ){
					console.log( 'err parse fetch_wrap: ', res )
					reject( e )
				}				
			}else if( typeof res === 'object' ){
				resolve( res )
			}else{
				console.log( res )
				reject()
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
				const gallery = ThreepressGallery({
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




const set_contingents = ( contingents, enabled, hide ) => {
	for( const ele of contingents ){
		if( hide ){
			enabled ? ele.style.display = 'inline-block' : ele.style.display = 'none'
		}else{
			enabled ? ele.classList.remove('threepress-disabled') : ele.classList.add('threepress-disabled')
		}
	}
}



const media_types = {
	image: ['image'],
	model: 'application/octet-stream',
}

let media_frame = false

const media_selector = ( type, callback ) => {

	// if( type == 'model' && media_frame ){
	// 	media_frame.open()
	// 	return
	// }

	if( !wp.media ){
		console.error('wp.media not enabled')
		return false
	}

	media_frame = new wp.media.view.MediaFrame.Select({
		title: 'Select ' + type,
		multiple: false,
		library: {
			order: 'ASC',
			orderby: 'title',
			type: media_types[ type ],
			search: null,
			uploadedTo: null,
		},

		button: {
			text: 'set ' + type
		}
	})

	media_frame.on( 'select', function() {

		const attachment = media_frame.state().get('selection').first().toJSON()
		// console.log('attachment selected: ', attachment)
		let row
		if( type === 'model' ){
			row = new ModelRow( attachment )
		}else{
			row = new ImageRow( attachment )
		}
		
		callback( attachment.id, row )

	});

	media_frame.open()

}



const val_boolean = ( ...values ) => {
	for( const val of values ){
		if( typeof val === 'boolean' ) return val
		if( val ) return true
	}
	return values[ values.length - 1 ]
}



const insertAfter = ( newNode, referenceNode ) => {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}


const get_row = ( container, id ) => {
	for( const row of container.querySelectorAll('.threepress-row')){
		if( row.getAttribute('data-id') == id ) return row
	}
	return false
}








const coord_range = ( name, is_ground_dims, dim ) => {
	const dim_ranges = ['x', 'z']
	const coord = document.createElement('input')
	coord.classList.add('coord-range')
	coord.type = 'range'
	coord.min = is_ground_dims && dim_ranges.includes( dim ) ? 1 : -3
	coord.max = is_ground_dims && dim_ranges.includes( dim ) ? 10 : 3
	coord.step = 1
	coord.name = name
	coord.value = 1
	if( is_ground_dims && dim === 'y' ) coord.max = 10
	return coord
}




const get_html_translation_table = (table, quote_style) => {  
    // Returns the internal translation table used by htmlspecialchars and htmlentities    
    //   
    // version: 902.2516  
    // discuss at: http://phpjs.org/functions/get_html_translation_table  
    // +   original by: Philip Peterson  
    // +    revised by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)  
    // +   bugfixed by: noname  
    // +   bugfixed by: Alex  
    // +   bugfixed by: Marco  
    // %          note: It has been decided that we're not going to add global  
    // %          note: dependencies to php.js. Meaning the constants are not  
    // %          note: real constants, but strings instead. integers are also supported if someone  
    // %          note: chooses to create the constants themselves.  
    // %          note: Table from http://www.the-art-of-web.com/html/character-codes/  
    // *     example 1: get_html_translation_table('HTML_SPECIALCHARS');  
    // *     returns 1: {'"': '&quot;', '&': '&amp;', '<': '&lt;', '>': '&gt;'}  
      
    var entities = {}, histogram = {}, decimal = 0, symbol = '';  
    var constMappingTable = {}, constMappingQuoteStyle = {};  
    var useTable = {}, useQuoteStyle = {};  
      
    useTable      = (table ? table.toUpperCase() : 'HTML_SPECIALCHARS');  
    useQuoteStyle = (quote_style ? quote_style.toUpperCase() : 'ENT_COMPAT');  
      
    // Translate arguments  
    constMappingTable[0]      = 'HTML_SPECIALCHARS';  
    constMappingTable[1]      = 'HTML_ENTITIES';  
    constMappingQuoteStyle[0] = 'ENT_NOQUOTES';  
    constMappingQuoteStyle[2] = 'ENT_COMPAT';  
    constMappingQuoteStyle[3] = 'ENT_QUOTES';  
      
    // Map numbers to strings for compatibilty with PHP constants  
    if (!isNaN(useTable)) {  
        useTable = constMappingTable[useTable];  
    }  
    if (!isNaN(useQuoteStyle)) {  
        useQuoteStyle = constMappingQuoteStyle[useQuoteStyle];  
    }  
      
    if (useQuoteStyle != 'ENT_NOQUOTES') {  
        entities['34'] = '&quot;';  
    }  
  
    if (useQuoteStyle == 'ENT_QUOTES') {  
        entities['39'] = '&#039;';  
    }  
  
    if (useTable == 'HTML_SPECIALCHARS') {  
        // ascii decimals for better compatibility  
        entities['38'] = '&amp;';  
        entities['60'] = '&lt;';  
        entities['62'] = '&gt;';  
    } else if (useTable == 'HTML_ENTITIES') {  
        // ascii decimals for better compatibility  
        entities['38']  = '&amp;';  
        entities['60']  = '&lt;';  
        entities['62']  = '&gt;';  
        entities['160'] = '&nbsp;';  
        entities['161'] = '&iexcl;';  
        entities['162'] = '&cent;';  
        entities['163'] = '&pound;';  
        entities['164'] = '&curren;';  
        entities['165'] = '&yen;';  
        entities['166'] = '&brvbar;';  
        entities['167'] = '&sect;';  
        entities['168'] = '&uml;';  
        entities['169'] = '&copy;';  
        entities['170'] = '&ordf;';  
        entities['171'] = '&laquo;';  
        entities['172'] = '&not;';  
        entities['173'] = '&shy;';  
        entities['174'] = '&reg;';  
        entities['175'] = '&macr;';  
        entities['176'] = '&deg;';  
        entities['177'] = '&plusmn;';  
        entities['178'] = '&sup2;';  
        entities['179'] = '&sup3;';  
        entities['180'] = '&acute;';  
        entities['181'] = '&micro;';  
        entities['182'] = '&para;';  
        entities['183'] = '&middot;';  
        entities['184'] = '&cedil;';  
        entities['185'] = '&sup1;';  
        entities['186'] = '&ordm;';  
        entities['187'] = '&raquo;';  
        entities['188'] = '&frac14;';  
        entities['189'] = '&frac12;';  
        entities['190'] = '&frac34;';  
        entities['191'] = '&iquest;';  
        entities['192'] = '&Agrave;';  
        entities['193'] = '&Aacute;';  
        entities['194'] = '&Acirc;';  
        entities['195'] = '&Atilde;';  
        entities['196'] = '&Auml;';  
        entities['197'] = '&Aring;';  
        entities['198'] = '&AElig;';  
        entities['199'] = '&Ccedil;';  
        entities['200'] = '&Egrave;';  
        entities['201'] = '&Eacute;';  
        entities['202'] = '&Ecirc;';  
        entities['203'] = '&Euml;';  
        entities['204'] = '&Igrave;';  
        entities['205'] = '&Iacute;';  
        entities['206'] = '&Icirc;';  
        entities['207'] = '&Iuml;';  
        entities['208'] = '&ETH;';  
        entities['209'] = '&Ntilde;';  
        entities['210'] = '&Ograve;';  
        entities['211'] = '&Oacute;';  
        entities['212'] = '&Ocirc;';  
        entities['213'] = '&Otilde;';  
        entities['214'] = '&Ouml;';  
        entities['215'] = '&times;';  
        entities['216'] = '&Oslash;';  
        entities['217'] = '&Ugrave;';  
        entities['218'] = '&Uacute;';  
        entities['219'] = '&Ucirc;';  
        entities['220'] = '&Uuml;';  
        entities['221'] = '&Yacute;';  
        entities['222'] = '&THORN;';  
        entities['223'] = '&szlig;';  
        entities['224'] = '&agrave;';  
        entities['225'] = '&aacute;';  
        entities['226'] = '&acirc;';  
        entities['227'] = '&atilde;';  
        entities['228'] = '&auml;';  
        entities['229'] = '&aring;';  
        entities['230'] = '&aelig;';  
        entities['231'] = '&ccedil;';  
        entities['232'] = '&egrave;';  
        entities['233'] = '&eacute;';  
        entities['234'] = '&ecirc;';  
        entities['235'] = '&euml;';  
        entities['236'] = '&igrave;';  
        entities['237'] = '&iacute;';  
        entities['238'] = '&icirc;';  
        entities['239'] = '&iuml;';  
        entities['240'] = '&eth;';  
        entities['241'] = '&ntilde;';  
        entities['242'] = '&ograve;';  
        entities['243'] = '&oacute;';  
        entities['244'] = '&ocirc;';  
        entities['245'] = '&otilde;';  
        entities['246'] = '&ouml;';  
        entities['247'] = '&divide;';  
        entities['248'] = '&oslash;';  
        entities['249'] = '&ugrave;';  
        entities['250'] = '&uacute;';  
        entities['251'] = '&ucirc;';  
        entities['252'] = '&uuml;';  
        entities['253'] = '&yacute;';  
        entities['254'] = '&thorn;';  
        entities['255'] = '&yuml;';  
    } else {  
        throw Error("Table: "+useTable+' not supported');  
        return false;  
    }  
      
    // ascii decimals to real symbols  
    for (decimal in entities) {  
        symbol = String.fromCharCode(decimal);  
        histogram[symbol] = entities[decimal];  
    }  
      
    return histogram;  
}  



const htmlspecialchars_decode = (string, quote_style) => {  
    // Convert special HTML entities back to characters    
    //   
    // version: 901.714  
    // discuss at: http://phpjs.org/functions/htmlspecialchars_decode  
    // +   original by: Mirek Slugen  
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)  
    // +   bugfixed by: Mateusz "loonquawl" Zalega  
    // +      input by: ReverseSyntax  
    // +      input by: Slawomir Kaniecki  
    // +      input by: Scott Cariss  
    // +      input by: Francois  
    // +   bugfixed by: Onno Marsman  
    // +    revised by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)  
    // -    depends on: get_html_translation_table  
    // *     example 1: htmlspecialchars_decode("<p>this -&gt; &quot;</p>", 'ENT_NOQUOTES');  
    // *     returns 1: '<p>this -> &quot;</p>'  
    var histogram = {}, symbol = '', tmp_str = '', entity = '';  
    tmp_str = string.toString();  
      
    if (false === (histogram = get_html_translation_table('HTML_SPECIALCHARS', quote_style))) {  
        return false;  
    }  
  
    // &amp; must be the last character when decoding!  
    delete(histogram['&']);  
    histogram['&'] = '&amp;';  
  
    for (symbol in histogram) {  
        entity = histogram[symbol];  
        tmp_str = tmp_str.split(entity).join(symbol);  
    }  
      
    return tmp_str;  
}  


const get_radio_val = elements => {
	for( const ele of elements ){
		if( ele.checked ) return ele.value
	}
	return undefined 
}






const resolutions = [4, 2, 1.5, 1]


const set_radio = result => {
	for( const input of document.querySelectorAll('input[type=radio][name=' + result.option_name.replace('threepress_',  '' ) ) ){
		if( input.value === result.option_value ){
			input.checked = true
		}
	}
}


const random_entry = source => {

	if( Array.isArray( source )){
		return source[ random_range( 0, source.length - 1, true ) ]
	}else if( source && typeof source === 'object'){
		return source[ random_entry( Object.keys( source ) ) ]
	}
	return ''
}



const random_range = ( low, high, int ) => {

	if( low >= high ) return low

	return int ? Math.floor( low + ( Math.random() * ( high - low ) ) ) : low + ( Math.random() * ( high - low ) )

}



const random_vector = ( min, max ) => {

	const range = Math.abs( max - min )

	return new Vector3( 
		min + ( Math.random() * range ), 
		min + ( Math.random() * range ), 
		min + ( Math.random() * range ), 
	)

}


const random_hex = len => {
	//	let r = '#' + Math.floor( Math.random() * 16777215 ).toString(16)
	let s = ''
	for( let i = 0; i < len; i++){
		s += Math.floor( Math.random() * 16 ).toString( 16 )
	}
	return s
}


const imageToDataURI = ( img, initX, initY, initWidth, initHeight, targetX, targetY, targetWidth, targetHeight ) => {

    // create an off-screen canvas
    const offscreen_canvas = document.createElement('canvas')
    const ctx = offscreen_canvas.getContext('2d')

    // set its dimension to target size
    offscreen_canvas.width = targetWidth
    offscreen_canvas.height = targetHeight

    // draw source image into the off-screen canvas:
    ctx.drawImage( img, initX, initY, initWidth, initHeight, targetX, targetY, targetWidth, targetHeight )

    // encode image to data-uri with base64 version of compressed image
    return offscreen_canvas.toDataURL()
}

const diff = window.diff = ( a, b, current, allowed ) => {
	
	if( typeof current !== 'number' || typeof allowed !== 'number' || typeof a === 'function' || typeof b === 'function' || !a || !b ){
		return
	}
	
	const diffpass = {}
	
	if( typeof a === 'object' && typeof b === 'object' ){
	    for( const key of Object.keys( a ) ){
	        if( a[ key ] !== b[ key ] ){
	            diffpass[ key ] = [ a[ key ], b[ key ] ]
	        }else if( current < allowed ){
		    	diff( a[ key ], b[ key ], current + 1, allowed )
	        }
	    }
		for( const key of Object.keys( b ) ){
	        if( a[ key ] !== b[ key ] && !diffpass[ key ] ){
	        	diffpass[ key ] = [ a[ key ], b[ key ]]
	        }else if( current < allowed ){
			    diff( a[ key ], b[ key ], current + 1, allowed )
	        }
	    }
	}else if( a !== b ){
		diffpass[ random_hex( 6 )] = [ a, b ]
	}

	if( Object.keys( diffpass ).length ) console.log( 'diffpass ' + current + ': ', diffpass )

}


const sleep = ms => {
	return new Promise((resolve, reject ) => {
		setTimeout(() => {
			resolve()
		}, typeof ms === 'number' ? ms : 1000 )
	})
}


const process_split = ( string, require_length ) => {

	if( typeof string !== 'string' ) return {}

	const split = string.split(',')
	if( !split || split.length !== 3 ) return {}

	// console.log('hrm', split )
	if( require_length ){
		if( !split[0] && !split[1] && !split[2] ) split = [1,0,0]
	}

	return {
		x: Number( split[0] ),
		y: Number( split[1] ),
		z: Number( split[2] ),
	}

}





const build_option = ( type, name, value, label, placeholder, contingent, attrs, checked ) => {
	const selection = document.createElement('div')
	selection.classList.add('selection')
	if( contingent ) selection.classList.add('contingent')
	const label_ele = document.createElement('label')
	label_ele.innerHTML = label || ( name ? name.replace(/_/g, ' ' ) : '' )
	const input = document.createElement('input')
	if( placeholder ) input.placeholder = placeholder
	if( type ) input.type = type
	if( name ) input.name = name
	if( value ) input.value = value
	for( const key in attrs ){
		input[ key ] = attrs[ key ]
	}
	if( type === 'checkbox' || type === 'radio'){
		if( checked ) input.checked = true
		label_ele.addEventListener('click', () => {
			const input = label_ele.parentElement.querySelector('input')
			if( input.type === 'radio' || input.type === 'checkbox') input.click()
		})
	}

	selection.appendChild( label_ele )
	selection.appendChild( input )
	return selection
}







const build_positioner = ( type, gallery, is_ground_dims ) => {
	const wrapper = document.createElement('div')
	const readout = document.createElement('input')
	readout.type = 'text'
	readout.classList.add('readout')
	readout.setAttribute('readonly', true)
	const dims = ['x', 'y', 'z']
	for( const dim of dims ){
		const ele = coord_range( dim, is_ground_dims, dim )
		wrapper.appendChild( ele )
		ele.addEventListener('change', () => {
			gallery.render_change( ele.parentElement, gallery.form )
			gallery.render_position_strings()
		})
	}
	wrapper.appendChild( readout )
	const pre = document.createElement('div')
	if( is_ground_dims ){
		pre.innerHTML = '<b>x:</b> ground plane width &nbsp;&nbsp;&nbsp; <b>y:</b> ground height scale (if height mapped) &nbsp;&nbsp;&nbsp; <b>z:</b> ground plane depth'
	}else{
		pre.innerHTML = 'XYZ for <b>angle</b> only.  '
	}
	wrapper.prepend( pre )
	return wrapper
}


const require_length = obj => {
	if( !obj ) return {
		x: 1,
		y: 0,
		z: 0,
	}
	if( obj.x == 0 && obj.y == 0 && obj.z == 0 ){
		obj.x = 1
	}
}



const validate_number = ( ...args ) => {
	if( !args || !args.length ) return false
	for( const arg of args ){
		if( typeof Number( arg ) === 'number' && !isNaN( arg )) return Number( arg )
	}
	return args[ args.length - 1 ]
}


// let bbox
const get_bbox = mesh => {
	if( !mesh.isMesh && !mesh.isObject3D ){
		console.log('invalid mesh dimensions for bbox', mesh )
		return new Vector3(1,1,1)
	}
	
	return new Box3().setFromObject( mesh )
}


const trim = ( flo, n ) => {
	return Number( flo.toFixed( n ) )
}


const format_date = ( type, date, granular, apply_TZ ) => {
	// granular just applies hours / min / seconds
	// validity
	let date_obj = new Date( date )
	if( !date || date_obj.toString().match(/invalid/i) ){
		return 'null or invalid date'
	}

	// timezone
	if( apply_TZ ){
		const offset = new Date().getTimezoneOffset() * 60 * 1000
		const new_ms = date_obj.getTime() - offset
		date_obj = new Date( new_ms )
	}

	// format
	let res = ''

	switch ( type ){

		case 'slashes':
			res = ( date_obj.getMonth() + 1 ) + '/' + date_obj.getDate() + '/' + ( date_obj.getYear() - 100 )
			if( granular ) res += ' - ' + date_obj.getHours() + ':' + date_obj.getMinutes() + ':' + date_obj.getSeconds()
			break;

		default: 
			break;

	}

	return res

}


const get_domain = value => {
	if( typeof value !== 'string' ){
		log('flag', 'what is value', value)
	}
	if( value.match(/localhost/i) ) return 'localhost'
	const match = ( value || '' ).match(/(?:\w+\.)+\w+/)
	// const match = value.match(/(?!(w+)\.)\w*(?:\w+\.)+\w+/) // (exclude www)
	return ( match ? match[0] : '' ).toLowerCase()
}


const get_install_type = url => {
	const images = ['jpg', 'jpeg', 'png', 'gif']
	const models = ['glb', 'gltf']
	let type, regex
	for( const suffix of images ){
		regex = new RegExp( suffix, 'i')
		if( url.match( regex ) ){
			type = 'image'
			break;
		}
	}
	if( !type ){
		for( const suffix of models ){
			regex = new RegExp( suffix, 'i')
			if( url.match( regex ) ){
				type = 'model'
				break;
			}					
		}
	}
	return type
}


const DEBUG = false
const debug_load = ( ...args ) => {
	if( DEBUG ){
		console.warn( ...args )
	}
}

const TILE_SIZE = 100 // World
const BLOCK_SIZE = 10 // World
const FOG_COLOR = 0xaabbff
const FOG_NEAR = 200
const FOG_FAR = 700
const FOG_DENSITY = 0.002
const PERLIN_SCALE = 0.07




function scry( x, old_min, old_max, new_min, new_max ){

	const first_ratio = ( x - old_min ) / ( old_max - old_min )
	const result = ( first_ratio * ( new_max - new_min ) ) + new_min
	return result
}


// const pseudo_random = ( x, y, z, w ) => {
// 	let v = 0
// 	if( x ) v += x
// 	if( y ) v += y
// 	if( z ) v += z
// 	if( w ) v += w
// 	return scry( Math.sin( v ), -1, 1, 0, 1 )
// }



let perlin = {
    rand_vect: function( x, y, vx, vy, seed ){
    	Math.seedrandom( ( seed || '' ) + Math.floor(x) + Math.floor(y) + Math.floor(vx) + Math.floor(vy) )
        let theta = Math.random() * 2 * Math.PI;
        return {x: Math.cos(theta), y: Math.sin(theta)};
    },
    // dot_prod_grid: function(x, y, vx, vy){
    //     let g_vect;
    //     let d_vect = {x: x - vx, y: y - vy};
    //     if (this.gradients[[vx,vy]]){
    //         g_vect = this.gradients[[vx,vy]];
    //     } else {
    //         g_vect = this.rand_vect();
    //         this.gradients[[vx, vy]] = g_vect;
    //     }
    //     return d_vect.x * g_vect.x + d_vect.y * g_vect.y;
    // },
    dot_prod_grid_static: function(x, y, vx, vy, seed ){
        let g_vect;
        let d_vect = {x: x - vx, y: y - vy};
        if (this.gradients[[vx,vy]]){
            g_vect = this.gradients[[vx,vy]];
        } else {
            g_vect = this.rand_vect( x, y, vx, vy, seed );
            this.gradients[[vx, vy]] = g_vect;
        }
        return d_vect.x * g_vect.x + d_vect.y * g_vect.y;
    },
    smootherstep: function(x){
        return 6*x**5 - 15*x**4 + 10*x**3;
    },
    interp: function(x, a, b){
        return a + this.smootherstep(x) * (b-a);
    },
    seed: function(){
        this.gradients = {};
        this.memory = {};
    },
    get: function(x, y, seed ) {
        if (this.memory.hasOwnProperty([x,y]))
            return this.memory[[x,y]];
        let xf = Math.floor(x);
        let yf = Math.floor(y);
        //interpolate
        let tl = this.dot_prod_grid_static(x, y, xf,   yf, seed );
        let tr = this.dot_prod_grid_static(x, y, xf+1, yf, seed );
        let bl = this.dot_prod_grid_static(x, y, xf,   yf+1, seed );
        let br = this.dot_prod_grid_static(x, y, xf+1, yf+1, seed );
        let xt = this.interp(x-xf, tl, tr);
        let xb = this.interp(x-xf, bl, br);
        let v = this.interp(y-yf, xt, xb);
        this.memory[[x,y]] = v;
        return v;
    }
}
perlin.seed();




let jaman_perlin = {
    dot: function(x, y, x2, y2){
        let a, b = {x: x - x2, y: y - y2};
        if (this.gradientCache[[x2,y2]]){
            a = this.gradientCache[[x2,y2]];
        } else {
            let theta = Math.random() * 2 * Math.PI;
            a = {x: Math.cos(theta), y: Math.sin(theta)};
            this.gradientCache[[x2, y2]] = a;
        }
        return b.x * a.x + b.y * a.y;
    },
    smooth: x => {
        return 6*x**5 - 15*x**4 + 10*x**3;
    },
    reset: function() {
        this.gradientCache = {};
        this.valueCache = {};
    },
    get: function(x, y) {
        if (this.valueCache.hasOwnProperty([x,y]))return this.valueCache[[x,y]];
        let xf = Math.floor(x);
        let yf = Math.floor(y);
        let tl = this.dot(x, y, xf,   yf);
        let tr = this.dot(x, y, xf+1, yf);
        let bl = this.dot(x, y, xf,   yf+1);
        let br = this.dot(x, y, xf+1, yf+1);
        let xt = tl + this.smooth(x-xf) * (tr-tl);
        let xb = bl + this.smooth(x-xf) * (br-bl);
        let v = xt + this.smooth(y-yf) * (xb-xt);
        this.valueCache[[x,y]] = v;
        return v;
    },
    recurse: function (x, y, fx = 0.1, fy = 0.1, octaves = [[2,0.5],[2,0.5]]) {
        let amplitude = 1;
        let range = 1;
        let v = this.get( x * fx, y * fy );
        octaves.forEach(octave => {
            fx *= octave[0];
            fy *= octave[0];
            amplitude *= octave[1];
            range += amplitude;
            v += this.get( x * fx, y * fy ) * amplitude;
        });
        return (v+1)/2;
    }
}
jaman_perlin.reset();


export {

	// base ui functions
	hal,
	render,
	fetch_wrap,
	spinner,

	// base app classes
	ModelRow,
	ImageRow,
	Spinner,
	ThreepressGallery,

	// builders - used by ext's
	build_option,
	build_positioner,

	// helper functions
	fill_dimensions,
	origin,
	set_contingents,
	media_selector,
	insertAfter,
	get_radio_val,
	get_html_translation_table,
	htmlspecialchars_decode,
	set_radio,
	random_hex,
	random_vector,
	random_entry,
	random_range,
	diff,
	coord_range,
	require_length,

	// validations
	val_boolean,
	get_row,
	tstack,
	validate_number,

	// canvas defaults

	resolutions,

	imageToDataURI,
	sleep,
	process_split,

	get_bbox,
	trim,

	format_date,

	get_domain,
	get_install_type,

	debug_load,

	TILE_SIZE,
	BLOCK_SIZE,
	FOG_COLOR,
	FOG_NEAR,
	FOG_FAR,
	FOG_DENSITY,

	scry,
	perlin,
	jaman_perlin,
	PERLIN_SCALE,
}
