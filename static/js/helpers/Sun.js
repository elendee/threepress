
import { 
	Lensflare, 
	LensflareElement 
} from '../../inc/Lensflare.js?v=112'

import { 
	DirectionalLight, 
	TextureLoader,
	SpriteMaterial,
	Sprite,
	Color,
	Group,
	Vector3,
    SpotLight,
} from '../../inc/three.module.js?v=112'


const textureLoader = new TextureLoader()

const sun_tex = textureLoader.load( THREEPRESS.plugin_url + '/assets/sun.png' )

const flare0 = textureLoader.load( THREEPRESS.plugin_url + '/assets/lensflare0.png')
const flare1 = textureLoader.load( THREEPRESS.plugin_url + '/assets/lensflare1.png')




const offset = new Vector3( 500, 500, 500 )






export default class Sun {

	constructor( init ){
		
		init = init || {}
		
		const sun = this

		//////////////// sun / flare
		sun.color = new Color( init.color || 'rgb(255, 255, 255)' )
		sun.scale = init.scale || 100
		sun.intensity = init.intensity || 1

		sun.has_lensflare = init.has_lensflare

		sun.texture = sun_tex
		sun.material = new SpriteMaterial({
			map: sun.texture,
			color: sun.color,
		})
		sun.layer1 = new Sprite( sun.material )
		sun.layer1.bloom = true
		sun.layer2 = new Sprite( sun.material )
		sun.layer2.bloom = true
		// sun.layer3 = new Sprite( sun.material )
		sun.layer1.scale.set( 
			sun.scale, 
			sun.scale, 
			sun.scale )
		sun.layer2.scale.copy( sun.layer1.scale ).multiplyScalar( 1.1 )

		sun.flares = [
			{
				texture: flare0,
				size: 100,
				distance: .05,
				color: sun.color,
			},
			{
				texture: flare0,
				size: 70,
				distance: .1,
				color: sun.color,
			},
			{
				texture: flare0,
				size: 170,
				distance: .15,
				color: sun.color,
			},
			{
				texture: flare1,
				size: 270,
				distance: .2,
				color: sun.color,
			},
			{
				texture: flare1,
				size: 70,
				distance: .25,
				color: sun.color,
			},
			{
				texture: flare0,
				size: 100,
				distance: .6,
				color: new Color(0xccbbcc),
			},
			{
				texture: flare1,
				size: 250,
				distance: .65,
				color: new Color(0xccaaff),
			},
		]

		sun.lensflare = new Lensflare()
		for( let i = 0; i < sun.flares.length; i++ ){
			// if( i < 2 ) continue
			// continue
			sun.flares[i] = new LensflareElement( 
				sun.flares[i].texture, 
				sun.flares[i].size, 
				sun.flares[i].distance, 
				sun.flares[i].color 
			)
			sun.lensflare.addElement( sun.flares[i] )
		}

		sun.ele = new Group()
		sun.ele.type = 'sun'
		sun.ele.add( sun.layer1 )
		sun.ele.add( sun.layer2 )

		sun.ele.userData.type = 'sun'

		if( sun.has_lensflare ) sun.ele.add( sun.lensflare )

		//////////////// Light

		sun.light_type = init.light_type

		if( sun.light_type === 'spot' ){
			sun.light = new SpotLight(0xffffff, sun.intensity, 1000 )
		}else if( sun.light_type === 'directional' ){
			sun.light = new DirectionalLight( sun.color, sun.intensity )
		}

		this.tracking = false

	}



	track( object3d, state ){ 

		const light = this.light

		if( state ){

			this.tracking = setInterval( () => {

				light.position.copy( object3d.position ).add( offset ) // .multiplyScalar( -30 )
				light.target.position.copy( light.position ).sub( offset )

			}, 2000 )

		}else{

			clearInterval( this.tracking )
			this.tracking = false

		}

	}


}

