// import RENDERER from './RENDERER.js?v=130'
import {
	TILE_SIZE,
	FOG_COLOR,
	FOG_NEAR,
	FOG_FAR,
	// FOG_DENSITY,
} from '../lib.js?v=130'
import {
	Color,
	// ShaderChunk,
	Mesh,
	// CanvasTexture,
	Clock,
	ShaderMaterial,
	PlaneBufferGeometry,
	DoubleSide,
	Object3D,
	PlaneGeometry,
	InstancedMesh,
	MeshLambertMaterial,
	TextureLoader,
	RepeatWrapping,
} from '../../inc/three.module.js?v=130'



const clock = new Clock();

const texLoader = new TextureLoader()







// -------------------
// base foliage inputs
// -------------------

const instanceNumber = 1500;
const dummy = new Object3D();


const grassTexture = texLoader.load( THREEPRESS.ARCADE.URLS.https + '/resource/texture/clover.png' )
// const grassTexture = texLoader.load( THREEPRESS.ARCADE.URLS.https + '/resource/texture/grass.jpg' )
// const grassAlpha = texLoader.load( THREEPRESS.ARCADE.URLS.https + '/resource/texture/grassAlpha.png' )

const uniforms = {
	time: {
  		value: 0
	},
	grassTexture: {
        value: grassTexture,
    },
	// grassAlpha: {
 //        value: grassAlpha,
 //    },
	fogColor:    { type: "c", value: new Color( FOG_COLOR ) },
	fogNear:     { type: "f", value: FOG_NEAR },
	fogFar:      { type: "f", value: FOG_FAR },
	fogDensity:    { type: "f", value: 0.9 },

	// topColor:    { type: "c", value: new Color( 0x0077ff ) },
	// bottomColor: { type: "c", value: new Color( 0xffffff ) },
	// offset:      { type: "f", value: 33 },
	// exponent:    { type: "f", value: 0.6 },
}



let simpleNoise = `
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
}
`;


const vertexShader = `
varying vec2 vUv;
uniform float time;

${simpleNoise}

void main() {

    vUv = uv;
    float t = time * 2.;
    
    // VERTEX POSITION
    
    vec4 mvPosition = vec4( position, 1.0 );
    #ifdef USE_INSTANCING
        mvPosition = instanceMatrix * mvPosition;
    #endif
    
    // DISPLACEMENT
    
    float noise = smoothNoise(mvPosition.xz * 0.5 + vec2(0., t));
    noise = pow(noise * 0.5 + 0.5, 2.) * 2.;
    
    // here the displacement is made stronger on the blades tips.
    float dispPower = 1. - cos( uv.y * 3.1416 * 0.5 );
    
    float displacement = noise * ( 2.3 * dispPower );
    mvPosition.z -= displacement;
    // mvPosition.y -= displacement;
    
    //
    
    vec4 modelViewPosition = modelViewMatrix * mvPosition;
    gl_Position = projectionMatrix * modelViewPosition;

}`;


// using straight PNG:
const fragmentShader = `
uniform sampler2D grassTexture;
varying vec2 vUv;

uniform vec3 fogColor;
uniform float fogNear;
uniform float fogFar;

void main() {
    gl_FragColor = texture2D(grassTexture, vUv);

	float depth = gl_FragCoord.z / gl_FragCoord.w;
	float fogFactor = smoothstep( fogNear, fogFar, depth );
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );

    if ( gl_FragColor.a < 0.5 ) discard;
}`;
	 // ${ ShaderChunk['fog_fragment'] }

// ${ ShaderChunk[ "common" ]}
// ${ ShaderChunk[ "fog_pars_fragment" ]}  
// ${ ShaderChunk['fog_fragment'] }

// using separate alphaMap:
// const fragmentShader = `
// uniform sampler2D grassAlpha;
// uniform sampler2D grassTexture;
// varying vec2 vUv;
  
// void main() {
//     vec4 color = texture2D(grassAlpha, vUv);
//     gl_FragColor = texture2D(grassTexture, vUv);
//     gl_FragColor.a = color.a;
//     if ( color.a < 0.5 ) discard;
// }
// `;








// --------------------
// base foliage threejs
// --------------------

const geometry = new PlaneGeometry( 3, 5, 1, 4 );
geometry.translate( 0, 0.5, 0 ); // move grass blade geometry lowest point at 0.

const leavesMaterial = new ShaderMaterial({
	vertexShader,
	fragmentShader,
	uniforms,
	side: DoubleSide,
	transparent: true,
	fog: true,
})

const grass = new InstancedMesh( geometry, leavesMaterial, instanceNumber );

// Position and scale the grass blade instances randomly.

for ( let i=0 ; i < instanceNumber ; i++ ) {

	dummy.position.set(
  		( Math.random() ) * TILE_SIZE,
    	0,
    	( Math.random() ) * TILE_SIZE
  	);
  
	dummy.scale.setScalar( 0.1 + Math.random() );

	if( Math.random() > .9 ) dummy.scale.multiplyScalar( 1 + Math.random() * 2 )
  
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

// ----------------
// end base foliage
// ----------------












// ------
// ground
// ------
const groundgeo = new PlaneBufferGeometry(1)
const tex = texLoader.load( THREEPRESS.ARCADE.URLS.https + '/resource/texture/Grass_04.jpg')
tex.wrapS = RepeatWrapping
tex.wrapT = RepeatWrapping
tex.repeat.set( 4, 4 )
const groundmat = new MeshLambertMaterial({
	map: tex,
	color: 'rgb(90, 140, 50)',
})
const ground = new Mesh( groundgeo, groundmat )
ground.userData.is_ground = true
ground.receiveShadow = true
ground.rotation.x = -Math.PI /2
ground.scale.multiplyScalar( TILE_SIZE )
grass.add( ground )
// ----------
// end ground
// ----------







export {
	grass,
	// ground,
	update,
}