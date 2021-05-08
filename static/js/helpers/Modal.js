

class Modal {

	constructor( init ){
		// init.id
		init = init || {}
		if( !init.type ) debugger

		const ele = this.ele = document.createElement('div')
		this.ele.classList.add('threepress-modal')
		if( init.id ) this.ele.id = init.id

		const type = this.type = init.type
		this.ele.classList.add( 'modal-type-' + type )

		this.content = document.createElement('div')
		this.content.classList.add('threepress-modal-content')

		this.close = document.createElement('div')
		this.close.classList.add('threepress-modal-close', 'flex-wrapper')
		this.close.innerHTML = '&times;'
		this.close.addEventListener('click', () => {
			ele.remove()
		})
		this.ele.appendChild( this.content )
		this.ele.appendChild( this.close )

	}



	make_columns(){

		this.left_panel = document.createElement('div')
		this.left_panel.classList.add('column', 'column-2', 'left-panel')

		this.right_panel = document.createElement('div')
		this.right_panel.classList.add('column', 'column-2', 'right-panel')

		this.content.appendChild( this.left_panel )
		this.content.appendChild( this.right_panel )

		this.ele.classList.add('has-columns')
		
	}


}








export {
	Modal,
}

