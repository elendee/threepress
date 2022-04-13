import hal from '../hal.js?v=121'
import {
	GLTFLoader,
} from '../../inc/GLTFLoader.js?v=121'

const MODEL_CACHE = {}


class Modular {
	
	constructor( init ){
		init = init || {}
	}

	async construct_model(){

		const modular = this

		const slug = modular.slug || modular.some_other_slug || ''
		if( !slug ){
			console.log('Modular missing slug', modular )
			return
		}

		const gltf = new GLTFLoader()

		// let base

		if( !MODEL_CACHE[ modular.model_url ] ){

			const model = await new Promise(( resolve, reject ) => {

				const filepath = THREEPRESS.plugin_url + '/world-models/' + modular.world_type + 's/' + modular.slug + '/model.' + modular.world_filetype

				gltf.load( filepath, 
					obj => {
						if( obj.animations && obj.animations.length ){
							modular.animation = {
								mixer: new AnimationMixer( obj.scene ),
								clips: obj.animations,
							}

							for( const anim of obj.animations ){
								console.log('model has anim: ', anim )
							}

							// if( modular.anim_clip ){
							// 	// console.log('looking', modular.animation.clips)
							// 	const clip = AnimationClip.findByName( modular.animation.clips, modular.anim_clip )
							// 	if( clip ){
							// 		const action = modular.animation.mixer.clipAction( clip )
							// 		action.play()
							// 	}else{
							// 		console.log('missing anim clip', modular, modular.anim_clip )
							// 	}
							// 	// modular.mixer.findByName( )
							// }

						}
						resolve( obj.scene )
					},
					xhr => {
						if( xhr && xhr.type !== 'progress' ) console.log( `bad xhr: ${ modular.type } ${ modular.model_url }: ${ xhr.type }` )
					}, 
					error => {
						hal('error', 'error loading model: ', modular.handle || modular.name )
						console.log( `err ${ modular.type } ${ modular.model_url }`, error )
						reject('model err: ', modular.model_url )
					}
				)
			})

			MODEL_CACHE[ modular.model_url ] = {
				model: model,
				stamp: Date.now(),
			}

		}

		MODEL_CACHE[ modular.model_url ].stamp = Date.now()

		modular.MODEL = MODEL_CACHE[ modular.model_url ].model.clone()

		// post_process( modular )

	}

}

export default Modular