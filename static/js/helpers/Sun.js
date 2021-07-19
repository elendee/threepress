
import { 
	Lensflare, 
	LensflareElement 
} from '../../inc/Lensflare.js?v=040'

import { 
	DirectionalLight, 
	TextureLoader,
	SpriteMaterial,
	Sprite,
	Color,
	Group,
	Vector3,
} from '../../inc/three.module.js'


const textureLoader = new TextureLoader()

const sun_tex = textureLoader.load( THREEPRESS.plugin_url + '/assets/sun.png' )

// const flare_particle = textureLoader.load('/assets/particle.png')
// const flare_gif = textureLoader.load('/assets/flare.gif')
// const flare_smoke = textureLoader.load('/assets/smoke.png')
// const flare_sun_trans = textureLoader.load('/assets/flare_sun_trans.gif')

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
		for( const flare of sun.flares ){
			sun.lensflare.addElement( new LensflareElement( 
				flare.texture, 
				flare.size, 
				flare.distance, 
				flare.color 
			))
		}

		sun.ele = new Group()
		sun.ele.type = 'sun'
		sun.ele.add( sun.layer1 )
		sun.ele.add( sun.layer2 )

		sun.ele.userData.type = 'sun'

		sun.ele.add( sun.lensflare )
		
		// 
		// sun.ele.add( sun.layer3 )
		// sun.ele.add( sun.directional )

		// sun.ele.position.copy( offset ).multiplyScalar( 10 )

		//////////////// Light

		sun.directional = new DirectionalLight( sun.color, 1 )

		// sun.ele.add( sun.directional )
		sun.directional.position.copy( offset )
		sun.directional.castShadow = true
		sun.directional.shadow.camera.near = 10;
		sun.directional.shadow.camera.far = 30200;

		// bounds
		sun.directional.shadow.camera.left = -500;
		sun.directional.shadow.camera.right = 500;
		sun.directional.shadow.camera.top = 500;
		sun.directional.shadow.camera.bottom = -500;
		// resolution
		sun.directional.shadow.mapSize.width = 2000;
		sun.directional.shadow.mapSize.height = 2000;
		sun.directional.intensity = init.intensity || 1

		this.tracking = false

	}



	hydrate( init ){ // from Ecc

		init = init || {}
		this.color = new Color( init.color || 'rgb(255, 255, 255)')
		this.material.color = this.color
		this.directional.intensity = init.intensity || 1
		
	}




	track( object3d, state ){ 

		const directional = this.directional

		if( state ){

			this.tracking = setInterval( () => {

				directional.position.copy( object3d.position ).add( offset ) // .multiplyScalar( -30 )
				directional.target.position.copy( directional.position ).sub( offset )

			}, 2000 )

		}else{

			clearInterval( this.tracking )
			this.tracking = false

		}

	}


}

