
import {
	ModelRow,
} from './lib.js'

let model_frame = false

export default ( callback ) => {

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
		console.log(attachment)
		const model = new ModelRow( attachment )
		const row = model.gen_row()
		
		callback( attachment.id, row )

	});

	model_frame.open()

}
