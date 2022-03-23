import {
	Vector2,
	Layers,
	ReinhardToneMapping,
	ShaderMaterial,
	DoubleSide,
	MeshBasicMaterial,
} from './three.module.js'


import {
	EffectComposer,
} from './EffectComposer.js?v=121'
import { ShaderPass } from './ShaderPass.js?v=121'
import { RenderPass } from './RenderPass.js?v=121'
import { UnrealBloomPass } from './UnrealBloomPass.js?v=121'




const vshader = `
varying vec2 vUv;
void main() {
	vUv = uv;
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`

const fshader = `
uniform sampler2D baseTexture;
uniform sampler2D bloomTexture;
varying vec2 vUv;
void main() {
	gl_FragColor = ( texture2D( baseTexture, vUv ) + vec4( 1.0 ) * texture2D( bloomTexture, vUv ) );
}`

const BLOOM_LAYER = 1
// const DEFAULT_LAYER = 0

const bloomLayer = new Layers();
bloomLayer.set( BLOOM_LAYER );



let bloomComposer, bloomPass, renderScene, finalComposer, finalPass



const init = ( RENDERER, SCENE, CAMERA, params ) => {

	const bloom_params = {
		// exposure: 1,
		strength: params.strength / 10,
		threshold: params.threshold / 10,
		radius: 0,
	}

	bloomComposer = new EffectComposer( RENDERER )
	window.bloomComposer = bloomComposer

	renderScene = new RenderPass( SCENE, CAMERA )

	RENDERER.toneMapping = ReinhardToneMapping;

		finalPass = new ShaderPass(
		new ShaderMaterial( {
			uniforms: {
				baseTexture: { 
					value: null 
				},
				bloomTexture: { 
					value: bloomComposer.renderTarget2.texture 
				}
			},
			vertexShader: vshader,
			// document.getElementById( 'vertexshader' ).textContent,
			fragmentShader: fshader,
			// document.getElementById( 'fragmentshader' ).textContent,
			defines: {}
		} ), "baseTexture"
	);
	finalPass.needsSwap = true;
	// window.finalComposer = finalComposer

	finalComposer = new EffectComposer( RENDERER );
	finalComposer.addPass( renderScene )
	finalComposer.addPass( finalPass )

	bloomPass = new UnrealBloomPass( new Vector2( 1, 1
		// window.innerWidth / GLOBAL.RENDER.RESOLUTIONS[ GLOBAL.RENDER.RES_KEY ], 
		// window.innerHeight / GLOBAL.RENDER.RESOLUTIONS[ GLOBAL.RENDER.RES_KEY ] 
	), 0, 0, 0 ); // 1.5, 0.4, 0.85
	bloomPass.threshold = bloom_params.threshold
	bloomPass.strength = bloom_params.strength;
	bloomPass.radius = bloom_params.radius;

	bloomComposer.renderToScreen = false
	bloomComposer.addPass( renderScene )
	bloomComposer.addPass( bloomPass )

	composer_res( RENDERER )

}













const darkMaterial = new MeshBasicMaterial( { color: 'black', side: DoubleSide } );
const materials = {}



function darkenNonBloomed( obj ) {
	if( obj.type === 'sun'){
		for( const child of obj.children ){
			if( child.bloom ) continue
			materials[ child.uuid ] = child.material;
			child.material = darkMaterial;			
			// debugger
		}
	}else 
	if (  obj.isMesh && bloomLayer.test( obj.layers ) === false ) { //   / 
		materials[ obj.uuid ] = obj.material;
		obj.material = darkMaterial;
	}
}

function restoreMaterial( obj ) {
	if( obj.type === 'sun'){
		for( const child of obj.children ){
			if( child.bloom ) continue
			child.material = materials[ child.uuid ];
			delete materials[ child.uuid ];
		}
	}else 
	if ( materials[ obj.uuid ] ) {
		obj.material = materials[ obj.uuid ];
		delete materials[ obj.uuid ];
	}
}





const composeAnimate = SCENE => {

	if( !bloomComposer ) return

	SCENE.traverse( darkenNonBloomed )
    bloomComposer.render()
    // debugger

	SCENE.traverse( restoreMaterial )
    finalComposer.render()

}


const addBloom = window.addBloom = obj => { // window.addBloom

	obj.layers.enable( BLOOM_LAYER )
	materials[ obj.uuid ] = obj.material

}

const removeBloom = obj => { /// = window.removeBloom

	obj.layers.disable( BLOOM_LAYER )
	delete materials[ obj.uuid ]

}



const composer_res = renderer => {

	// setTimeout(()=>{

		const bounds = renderer.domElement.getBoundingClientRect()

		finalComposer.setSize( 
			bounds.width, // / GLOBAL.RENDER.RESOLUTIONS[ GLOBAL.RENDER.RES_KEY ],
			bounds.height, // / GLOBAL.RENDER.RESOLUTIONS[ GLOBAL.RENDER.RES_KEY ],
			false,
		)
		bloomComposer.setSize( 
			bounds.width, //  / GLOBAL.RENDER.RESOLUTIONS[ GLOBAL.RENDER.RES_KEY ],
			bounds.height, //  / GLOBAL.RENDER.RESOLUTIONS[ GLOBAL.RENDER.RES_KEY ],
			false,
		)

	// }, 2000 )

}

// const composer_intensity = event => {
// 	const { modifier } = event 
// 	if( typeof event.set_to === 'number' ){
// 		bloomPass.strength = event.set_to
// 	}else{
// 		if( typeof modifier === 'number' ){
// 			bloomPass.strength *= modifier
// 		}else{
// 			bloomPass.strength = bloom_params.strength
// 		}		
// 	}
// }

// const composer_radius = event => {
// 	const { modifier } = event 
// 	if( typeof modifier === 'number' ){
// 		bloomPass.radius *= modifier
// 	}else{
// 		bloomPass.radius = bloom_params.radius
// 	}
// }


export {
	init,
	composeAnimate,
	addBloom,
	removeBloom,
}

