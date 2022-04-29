import {
	TILE_SIZE,
} from '../lib.js?v=130'
import {
	Clock,
	ShaderMaterial,
	DoubleSide,
	Object3D,
	PlaneGeometry,
	InstancedMesh,
	MeshLambertMaterial,
	TextureLoader,
} from '../../inc/three.module.js?v=130'



const clock = new Clock();

const texLoader = new TextureLoader()


const simpleNoise = `
float N (vec2 st) { // https://thebookofshaders.com/10/
    return fract( sin( dot( st.xy, vec2(12.9898,78.233 ) ) ) *  43758.5453123);
}

float smoothNoise( vec2 ip ){ // https://www.youtube.com/watch?v=zXsWftRdsvU
	vec2 lv = fract( ip );
  vec2 id = floor( ip );
  
  lv = lv * lv * ( 3. - 2. * lv );
  
  float bl = N( id );
  float br = N( id + vec2( 1, 0 ));
  float b = mix( bl, br, lv.x );
  
  float tl = N( id + vec2( 0, 1 ));
  float tr = N( id + vec2( 1, 1 ));
  float t = mix( tl, tr, lv.x );
  
  return mix( b, t, lv.y );
}`;


////////////
// MATERIAL
////////////


// varying vec2 vUv;
// ----------------------------
const spliceTop = `
  uniform float time;
`

const spliceMain = `
    vUv = uv;
    float t = time * 2.;
    
    // VERTEX POSITION
    
    vec4 MYmvPosition = vec4( position, 1.0 );
    #ifdef USE_INSTANCING
    	MYmvPosition = instanceMatrix * MYmvPosition;
    #endif
    
    // DISPLACEMENT
    
    float noise = smoothNoise(MYmvPosition.xz * 0.5 + vec2(0., t));
    noise = pow(noise * 0.5 + 0.5, 2.) * 2.;
    
    // here the displacement is made stronger on the blades tips.
    float dispPower = 1. - cos( uv.y * 3.1416 * 0.5 );
    
    float displacement = noise * ( 0.3 * dispPower );
    MYmvPosition.z -= displacement;
    
    //
    
    vec4 modelViewPosition = modelViewMatrix * MYmvPosition;
    gl_Position = projectionMatrix * modelViewPosition;
`
// ----------------------------



// const vertexShader = `
//   varying vec2 vUv;
//   uniform float time;
  
//   ${simpleNoise}
  
// 	void main() {

//     vUv = uv;
//     float t = time * 2.;
    
//     // VERTEX POSITION
    
//     vec4 mvPosition = vec4( position, 1.0 );
//     #ifdef USE_INSTANCING
//     	mvPosition = instanceMatrix * mvPosition;
//     #endif
    
//     // DISPLACEMENT
    
//     float noise = smoothNoise(mvPosition.xz * 0.5 + vec2(0., t));
//     noise = pow(noise * 0.5 + 0.5, 2.) * 2.;
    
//     // here the displacement is made stronger on the blades tips.
//     float dispPower = 1. - cos( uv.y * 3.1416 * 0.5 );
    
//     float displacement = noise * ( 0.3 * dispPower );
//     mvPosition.z -= displacement;
    
//     //
    
//     vec4 modelViewPosition = modelViewMatrix * mvPosition;
//     gl_Position = projectionMatrix * modelViewPosition;

// 	}
// `;

// const fragmentShader = `
//   varying vec2 vUv;
  
//   void main() {
//   	vec3 baseColor = vec3( 0.41, 1.0, 0.5 );
//     float clarity = ( vUv.y * 0.875 ) + 0.125;
//     gl_FragColor = vec4( baseColor * clarity, 1 );
//   }
// `;

// uniform float texture
// + 0.125
// const tempShader = `
//   varying vec2 vUv;
  
//   void main() {
//     float clarity = ( vUv.y * 0.875 );
//     gl_FragColor = vec4( clarity, 0.0, 0.0, 1 );
//   }
// `



const grassMap = texLoader.load( THREEPRESS.ARCADE.URLS.https + '/resource/texture/grass.jpg' )
const grassAlpha = texLoader.load( THREEPRESS.ARCADE.URLS.https + '/resource/texture/grassAlpha.png' )

const uniforms = {
	time: {
  		value: 0
	},
	texture: {
		value: grassMap,
		type: 't'
	},
}


const leavesMaterial = THREEPRESS.leavesMaterial = new MeshLambertMaterial({
	map: grassMap,
	transparent: true,
	alphaMap: grassAlpha,
	onBeforeCompile: shader => {

		// const { 
		// 	fragmentShader, 
		// 	vertexShader, 
		// 	uniforms 
		// } = shader

		// shader.vertexShader = vertexShader
		// console.log('>>', vertexShader)
		
		shader.vertexShader = shader.vertexShader.replace(
			'#define LAMBERT',
			'#define LAMBERT' + spliceTop + simpleNoise
		)

		shader.vertexShader = shader.vertexShader.replace(
			'#include <fog_vertex>',
			'#include <fog_vertex>' + spliceMain
		)

		console.log( '>>>', shader.vertexShader )

		// debugger

		// console.log( shader.uniforms )

		// shader.uniforms.time = {
		// 	value: 0
		// }

		// console.log( shader.vertexShader )

	}
	// uniforms: uniforms,
	// color: 'green',
})



// const leavesMaterial = new ShaderMaterial({
// 	vertexShader,
// 	tempShader,
// 	// fragmentShader,
// 	uniforms,
// 	side: DoubleSide,
// 	transparent: true,
// 	// map: grassMap,
// 	// alphaMap: grassAlpha,
// });

/////////
// MESH
/////////

const instanceNumber = 5000;
const dummy = new Object3D();

const geometry = new PlaneGeometry( 3, 5, 1, 4 );
geometry.translate( 0, 0.5, 0 ); // move grass blade geometry lowest point at 0.

const grass = new InstancedMesh( geometry, leavesMaterial, instanceNumber );

// Position and scale the grass blade instances randomly.

for ( let i=0 ; i < instanceNumber ; i++ ) {

	dummy.position.set(
  		( Math.random() - 0.5 ) * TILE_SIZE,
    	0,
    	( Math.random() - 0.5 ) * TILE_SIZE
  	);
  
	dummy.scale.setScalar( 0.5 + Math.random() * 0.5 );
  
	dummy.rotation.y = Math.random() * Math.PI;
  
	dummy.updateMatrix();

	grass.setMatrixAt( i, dummy.matrix );

}

const update = function () {

	// Hand a time variable to vertex shader for wind displacement.
	uniforms.time.value = clock.getElapsedTime();
	// leavesMaterial.uniforms.time.value = clock.getElapsedTime();
	// leavesMaterial.uniformsNeedUpdate = true;
};


export {
	grass,
	// ground,
	update,
}