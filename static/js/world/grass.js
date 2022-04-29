import RENDERER from './RENDERER.js?v=130'
import {
	TILE_SIZE,
} from '../lib.js?v=130'
import {
	CanvasTexture,
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






const grassTexture = texLoader.load( THREEPRESS.ARCADE.URLS.https + '/resource/texture/grass.jpg' )
const grassAlpha = texLoader.load( THREEPRESS.ARCADE.URLS.https + '/resource/texture/grassAlpha.png' )

const uniforms = {
	time: {
  		value: 0
	},
	grassTexture: {
        value: grassTexture,
    },
	grassAlpha: {
        value: grassAlpha,
    },
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


const fragmentShader = `
uniform sampler2D grassAlpha;
uniform sampler2D grassTexture;
varying vec2 vUv;
  
void main() {
    vec4 color = texture2D(grassAlpha, vUv);
    gl_FragColor = texture2D(grassTexture, vUv);
    gl_FragColor.a = color.a;
    if ( color.a < 0.5 ) discard;
}
`;

const leavesMaterial = new ShaderMaterial({
	vertexShader,
	fragmentShader,
	uniforms,
	side: DoubleSide,
	transparent: true,
})



/////////
// MESH
/////////

const instanceNumber = 5000;
const dummy = new Object3D();

const geometry = new PlaneGeometry( 10, 10, 1, 4 );
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