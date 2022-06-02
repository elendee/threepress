import {
	TILE_SIZE,
	// scry,
	perlin,
	// jaman_perlin,
	FOG_COLOR,
	FOG_NEAR,
	FOG_FAR,
	PERLIN_SCALE,
	random_vector,
} from '../lib.js?v=140'
import SCENE from './SCENE.js?v=140'
import {
	Clock,
	Mesh,
	Color,
	Group,
	// PlaneGeometry,
	ShaderMaterial,
	ShaderLib,
	PlaneBufferGeometry,
	Object3D,
	InstancedMesh,
	MeshLambertMaterial,
	DoubleSide,
	TextureLoader,
	BoxBufferGeometry,
	MeshDistanceMaterial,
	RGBADepthPacking,
	// Vector3,
} from '../../inc/three.module.js?v=140'
// import { Water } from '../../inc/Water.js?v=140'




const clock = new Clock()
const texLoader = new TextureLoader()
const leaf_geo = new PlaneBufferGeometry(1)
const ground_geo = new BoxBufferGeometry(1,1,1)
const SHADER_CACHE = {}


// const test_col = new Color('rgb(200, 0, 0)')



const TERRAIN_TYPES = THREEPRESS.TERRAIN_TYPES = {
	'foliage4': {
		color: new Color('rgb(60, 130, 50)'),
		height: 4,
	},
	'foliage3': {
		color: new Color('rgb(50, 110, 50)'),
		height: 3,
	}, 
	'foliage2': {
		color: new Color('rgb(40, 100, 30)'),
		height: 2,
	}, 
	'foliage1': {
		color: new Color('rgb(20, 70, 20)'),
		height: 1,
	}, 
	'water_shallow': {
		color: new Color('rgb(50, 50, 200)'),// not used
		height: 0,
	},
	'water_deep': {
		color: new Color('rgb(30, 50, 220)'),// not used
		height: 0,
	},
	'rock':{
		color: new Color('rgb(60, 60, 60)'),
		height: 5,
	}
}
for( const key in TERRAIN_TYPES ) TERRAIN_TYPES[ key ].name = key

const perlin_to_terrain = ( perlin, env ) => {
	// if( perlin < -0.5 || perlin > 0.5 ) console.log('>>', perlin )
	switch( env ){
		case 'asdfasdf':
			break;

		default: // standard
			// if( perlin < -0.9 ) return TERRAIN_TYPES['water_deep']
			// if( perlin < -0.8 ) return TERRAIN_TYPES['water_shallow']
			if( perlin < -0.5 ) return TERRAIN_TYPES['water_deep']
			if( perlin < -0.4 ) return TERRAIN_TYPES['water_shallow']
			if( perlin < -0.3 ) return TERRAIN_TYPES['foliage1']
			if( perlin < -0.1 ) return TERRAIN_TYPES['foliage2']
			if( perlin < 0.1 ) return TERRAIN_TYPES['foliage3']
			if( perlin < 0.4 ) return TERRAIN_TYPES['foliage4']
			return TERRAIN_TYPES['rock']
	}

}


// console.log( ShaderLib )


let simpleNoise = `
float N (vec2 st) { // https://thebookofshaders.com/10/
    return fract( sin( dot( st.xy, vec2(12.9898,78.233 ) ) ) *  43758.5453123);
}
float smoothNoise( vec2 ip ){ // https://www.youtube.com/watch?v=140zXsWftRdsvU
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


// const temp_ground_material = new MeshLambertMaterial({
// 	// side: DoubleSide,
// 	color: 'red',
// 	transparent: true,
// 	opacity: .2,
// })

const ground_material = new MeshLambertMaterial({
	// side: DoubleSide,
	// color: 'blue',
})

// const waterGeometry = new PlaneBufferGeometry(100, 100)
// const water = new Water( waterGeometry, {
// 	textureWidth: 512,
// 	textureHeight: 512,
// 	waterNormals: texLoader.load( '../assets/waternormals.jpg', function ( texture ) {
// 		texture.wrapS = texture.wrapT = RepeatWrapping;
// 	}),
// 	sunDirection: new Vector3(),
// 	sunColor: 0xffffff,
// 	waterColor: 0x001e0f,
// 	distortionScale: 3.7,
// 	fog: true
// })

const shaders = {
	vertex: {
		clover: `
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

}`,
		grass: `
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

}`,

rock_grass: `
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

}`,

		water: `
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
    
    float noise = smoothNoise(mvPosition.xz * 0.5 + vec2(0., t / 2.0 ));
    noise = pow(noise * 0.5 + 0.5, 2.) * 2.;
        
    float displacement = noise * ( 1.0 );
    // mvPosition.z -= displacement;
    mvPosition.y -= displacement;
    
    //
    
    vec4 modelViewPosition = modelViewMatrix * mvPosition;
    gl_Position = projectionMatrix * modelViewPosition;

}
` 
	},

    // float displacement = noise * ( 2.3 * dispPower );
	   //  // here the displacement is made stronger on the blades tips.
    // float dispPower = 1. - cos( uv.y * 3.1416 * 0.5 );

	fragment: {
		clover: `
uniform sampler2D cloverTexture;
varying vec2 vUv;

uniform vec3 fogColor;
uniform float fogNear;
uniform float fogFar;

void main() {
    gl_FragColor = texture2D(cloverTexture, vUv);

	float depth = gl_FragCoord.z / gl_FragCoord.w;
	float fogFactor = smoothstep( fogNear, fogFar, depth );
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );

    if ( gl_FragColor.a < 0.5 ) discard;
}`,
		water: `
uniform vec3 waterColor;
uniform sampler2D waterTexture;
varying vec2 vUv;

uniform vec3 fogColor;
uniform float fogNear;
uniform float fogFar;
void main() {
    float depth = gl_FragCoord.z / gl_FragCoord.w;
    float fogFactor = smoothstep( fogNear, fogFar, depth );

    gl_FragColor = texture2D(waterTexture, vUv );
    // gl_FragColor.rgb = mix( waterColor, gl_FragColor, 0.5 );
    // gl_FragColor.rgb = mix( gl_FragColor, fogColor, fogFactor );
    // gl_FragColor.a = 1.0;

}`,
		grass: `
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
}`,

		rock_grass: `
uniform sampler2D rockGrassTexture;
varying vec2 vUv;

uniform vec3 fogColor;
uniform float fogNear;
uniform float fogFar;

void main() {
    gl_FragColor = texture2D(rockGrassTexture, vUv);

	float depth = gl_FragCoord.z / gl_FragCoord.w;
	float fogFactor = smoothstep( fogNear, fogFar, depth );
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );

    if ( gl_FragColor.a < 0.5 ) discard;
}`,
	}

}

	// float depth = gl_FragCoord.z / gl_FragCoord.w;
	// float fogFactor = smoothstep( fogNear, fogFar, depth );
	// gl_FragColor = vec4(waterColor.r, waterColor.g, waterColor.b, 1.0);

	// gl_FragColor = vec4(fogFactor, fogFactor, fogFactor, 1.0);

	// mix( waterColor, fogColor, fogFactor );
	// gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);

// --- temp water shader
// ---

// textures
const textures = {
	'clover': {
		slug: 'clover.png',
	},
	'grass':{
		slug: 'grass.png',
	},
	'water':{
		slug: 'waternormals-sky.jpg',
	},
	'rockGrass':{
		slug: 'rock-grass.png',
	},
}
for( const type in textures ){
	const url = THREEPRESS.ARCADE.URLS.https + '/resource/texture/' + textures[ type ].slug
	// console.log('loading', url )
	textures[ type ].tex = texLoader.load( url )
}

// console.log('tex..', textures )

const basic_uniforms = {
	time: {
  		value: 0
	},	
	fogColor:    { type: "c", value: new Color( FOG_COLOR ) },
	fogNear:     { type: "f", value: FOG_NEAR },
	fogFar:      { type: "f", value: FOG_FAR },
	fogDensity:    { type: "f", value: 0.9 },	
}

// uniforms
const uniforms = { // window.uniforms

	'clover':{
		...basic_uniforms,
		cloverTexture: {
	        value: textures.clover.tex,
	    },
	},

	'grass':{
		...basic_uniforms,
		grassTexture: {
	        value: textures.grass.tex,
	    },
	},

	'rock_grass':{
		...basic_uniforms,
		rockGrassTexture: {
	        value: textures.rockGrass.tex,
	    },
	},

	'water':{
		...basic_uniforms,
		waterColor: {
			type: 'c',
			value: new Color('rgb(50, 50, 250)')
		},
		waterTexture: {
			value: textures.water.tex,
		}
	}

	// topColor:    { type: "c", value: new Color( 0x0077ff ) },
	// bottomColor: { type: "c", value: new Color( 0xffffff ) },
	// offset:      { type: "f", value: 33 },
	// exponent:    { type: "f", value: 0.6 },
}














class MeshSet {

	constructor( init ){

		init = init || {}
		/*
			grid
			--- not needed for ground meshset:
			uniforms
			slug
		*/

		this.mesh_type = init.mesh_type || 'grass'

		this.grid = init.grid
		if( !Array.isArray( this.grid?.[0] ) || this.grid.length !== this.grid[0].length ){
			console.log('invalid 2d grid for MeshSet', init )
		}
		this.size = this.grid.length
		this.cell_size = Math.ceil( TILE_SIZE / this.size )
		this.count = this.grid.length * this.grid[0].length

		this.GROUND = false // all other mesh_types are stored in LODsets
		this.LODsets = false

		this.fixture = init.fixture

		// console.log("init meshset", this )

		this.slug = init.slug

		this.uniforms = init.uniforms || uniforms[ this.slug ]
		if( !this.uniforms && this.mesh_type !== 'ground' ){
			console.log('missing or invalid uniforms', this.mesh_type )
		}

		// material
		if( this.mesh_type === 'ground' ){
			this.material = ground_material

		// 	this.material = ground_material
		}else{

			if( !SHADER_CACHE[ this.slug ]){
				console.log('init new SM', this.slug )

				SHADER_CACHE[ this.slug ] = new ShaderMaterial({
					vertexShader: shaders.vertex[ this.slug ], 
					fragmentShader: shaders.fragment[ this.slug ],
					uniforms: uniforms[ this.slug ],
					side: DoubleSide,
					transparent: true,
					fog: true,
				})

				this.add_depth( SHADER_CACHE[ this.slug ] )

			}
			this.material = SHADER_CACHE[ this.slug ]

		}

		this.init_instances( init.LODsets )

		if( this.mesh_type === 'ground' ){
			this.GROUND.userData.is_ground = true
		}else{
			for( const key in this.LODsets ){
				this.LODsets[ key].userData.is_cosmetic = true
			}
		}

	}


	add_depth( original_material ){

		const customDistanceMaterial = new MeshDistanceMaterial({
	    	depthPacking: RGBADepthPacking,
	    	alphaTest: 0.5
	    });

		console.log('why not', customDistanceMaterial )

	   //  customDistanceMaterial.onBeforeCompile = shader => {
	      
	   //  	// app specific instancing shader code
	   //  	shader.vertexShader =
	   //      	`#define DEPTH_PACKING 3201
	   //          	attribute vec3 offset;
	   //          	attribute vec4 orientation;

	   //          	vec3 applyQuaternionToVector( vec4 q, vec3 v ){
	   //             		return v + 2.0 * cross( q.xyz, cross( q.xyz, v ) + q.w * v );
	   //          	}` + shader.vertexShader;

	   //  	shader.vertexShader = shader.vertexShader.replace(
	        	
	   //      	"#include <project_vertex>",
				
				// `vec3 vPosition = offset + applyQuaternionToVector( orientation, transformed );
	     
	   //          vec4 mvPosition = modelMatrix * vec4( vPosition, 1.0 );
	   //          transformed = vPosition;
	   //          gl_Position = projectionMatrix * modelViewMatrix * vec4( transformed, 1.0 );`

	   //    );

	   //    shader.fragmentShader =
	   //      "#define DEPTH_PACKING 3201" + "\n" + shader.fragmentShader;
	   //  };

	  //   object.castShadow = true;
	  //   object.receiveShadow = true;
	}


	init_instances( LODsets ){

		let index

		const cell_offset = this.cell_size / 2

		// assign LOD's and/or ground mesh
		if( this.mesh_type === 'ground' ){

			this.GROUND = new InstancedMesh( ground_geo, ground_material, this.count )

			const dummy = new Object3D()
			let terrain

			for( let x = 0; x < this.grid.length; x++ ){
				for( let z = 0; z < this.grid.length; z++ ){
					index = ( x * this.size ) + z
					// console.log('index: ', index )
					terrain = this.grid?.[x]?.[z]
					if( terrain ){
						if( terrain.name.match(/water/i) ) continue
						dummy.position.set(
					  		( this.cell_size * x ) + cell_offset,
					    	// 0,
					    	( -this.cell_size / 2 ) + terrain.height,
					    	( this.cell_size * z)  + cell_offset
					  	);

					  	dummy.scale.set(1,1,1)
					  	// divide( dummy.scale ) // reset from last

					  	dummy.scale.multiplyScalar( this.cell_size )

						dummy.rotation.x = -Math.PI / 2
					  
						dummy.updateMatrix();

						this.GROUND.setMatrixAt( index, dummy.matrix );

						this.GROUND.setColorAt( index, terrain.color );

					}
				}
			}

			this.GROUND.instanceMatrix.needsUpdate = true
			this.GROUND.instanceColor.needsUpdate = true


		}else if( this.mesh_type === 'water' ){

			this.LODsets = LODsets || {
				low: new InstancedMesh( ground_geo, this.material, Math.floor( this.count * .25 ) ),
				medium: new InstancedMesh( ground_geo, this.material, Math.floor( this.count * .5 ) ),
				high: new InstancedMesh(  ground_geo, this.material, this.count ),
			}

			for( const size in this.LODsets ){

				const instance_mesh = this.LODsets[ size ]

				const dummy = new Object3D()
				let terrain

				for( let x = 0; x < this.grid.length; x++ ){
					for( let z = 0; z < this.grid.length; z++ ){

						index = ( x * this.size ) + z
						terrain = this.grid?.[x]?.[z]

						if( terrain ){

							if( !terrain.name.match(/water/i) ) continue
							dummy.position.set(
						  		( this.cell_size * x ) + cell_offset,
						    	// 0,
						    	-this.cell_size / 2,
						    	( this.cell_size * z ) + cell_offset
						  	);

							// console.log('watahhh')

						  	dummy.scale.set( 1,1,1 )
						  	// .divide( dummy.scale ) // reset from last

							dummy.scale.multiplyScalar( this.cell_size )

							// if( Math.random() > .9 ) dummy.scale.multiplyScalar( 1 + Math.random() * 2 )
						  
							dummy.rotation.x = -Math.PI / 2
							// Math.random() * Math.PI;
						  
							dummy.updateMatrix();

							instance_mesh.setMatrixAt( index, dummy.matrix );

							instance_mesh.setColorAt( index, terrain.color );

						}

					}

				}
				instance_mesh.instanceMatrix.needsUpdate = true
				// instance_mesh.instanceColor.needsUpdate = true
			}

		}else if( this.mesh_type === 'foliage' ){

			this.LODsets = LODsets || {
				low: new InstancedMesh( leaf_geo, this.material, Math.floor( this.count * .25 ) ),
				medium: new InstancedMesh( leaf_geo, this.material, Math.floor( this.count * .5 ) ),
				high: new InstancedMesh( leaf_geo, this.material, this.count ),
			}

			for( const size in this.LODsets ){

				const instance_mesh = this.LODsets[ size ]

				const dummy = new Object3D()
				let terrain

				for( let x = 0; x < this.grid.length; x++ ){
					for( let z = 0; z < this.grid.length; z++ ){

						index = ( x * this.size ) + z
						terrain = this.grid?.[x]?.[z]

						if( terrain ){

							// only rendering foliage on certain tiles...
							if( terrain.name.match(/foliage1/) || terrain.name.match(/foliage2/) ){

								dummy.position.set(
							  		this.cell_size * x,
							    	terrain.height,
							    	this.cell_size * z
							  	);
							  
								dummy.scale.setScalar( 10 * Math.random() );

								// if( Math.random() > .9 ) dummy.scale.multiplyScalar( 1 + Math.random() * 2 )
							  
								dummy.rotation.y = Math.random() * Math.PI;
							  
								dummy.updateMatrix();

								instance_mesh.setMatrixAt( index, dummy.matrix );

								instance_mesh.setColorAt( index, terrain.color );
								
							}else{

								// unhandled foliage ('plains' etc.. probably nothing will go here )

							}


						}

					}

				}
				instance_mesh.instanceMatrix.needsUpdate = true
				if( instance_mesh.instanceColor )
					instance_mesh.instanceColor.needsUpdate = true
			}

		}else if( this.mesh_type === 'grass' ){ // default ground terrain.  skips water.  basically, grass.

			this.count *= 10

			this.LODsets = LODsets || {
				low: new InstancedMesh( leaf_geo, this.material, Math.floor( this.count * .25 ) ),
				medium: new InstancedMesh( leaf_geo, this.material, Math.floor( this.count * .5 ) ),
				high: new InstancedMesh( leaf_geo, this.material, this.count ),
			}

			for( const size in this.LODsets ){

				const instance_mesh = this.LODsets[ size ]

				instance_mesh.receiveShadow = true
				// instance_mesh.castShadow = true

				const dummy = new Object3D()
				let terrain

				let random_pos

				// for( let x = 0; x < this.grid.length; x++ ){
				// 	for( let z = 0; z < this.grid.length; z++ ){
				let scalar
				let super_scalar

				for( let i = 0; i < this.count; i++ ){

					random_pos = random_vector( 0, TILE_SIZE )

					terrain = this.grid?.[ Math.floor( random_pos.x / this.cell_size )]?.[ Math.floor( random_pos.z / this.cell_size )]

					if( !terrain ) continue

					if( terrain.name.match(/water/i) || terrain.name.match(/rock/i) ) continue

					random_pos.y = terrain.height

					// index = ( x * this.size ) + z
					index = i

					/*
						RANDOM WAY: ( grass )
					*/

					// const px = ( x * this.cell_size ) + ( Math.random() * this.cell_size ) 
					// const pz = ( z * this.cell_size ) + ( Math.random() * this.cell_size ) 

					dummy.position.copy( random_pos )
					// set( px, 0, pz );

					scalar = 5 * Math.random()

					dummy.scale.setScalar( scalar );

					dummy.position.y += scalar / 1.9

					if( Math.random() > .97 ){
						super_scalar = 1 + Math.random() * 5
						dummy.scale.multiplyScalar( super_scalar )
						dummy.position.y += super_scalar / 2
					} 
				  
					dummy.rotation.y = Math.random() * Math.PI;
				  
					dummy.updateMatrix();

					instance_mesh.setMatrixAt( index, dummy.matrix );
					// instance_mesh.setColorAt( index, test_col ); // terrain.color

					// }

				}

				instance_mesh.instanceMatrix.needsUpdate = true
				// instance_mesh.instanceColor.needsUpdate = true

			}

			// console.log('grass reach: ', reached )
			// console.log('grass reach: ', reached )

		}else if( this.mesh_type === 'rock_grass' ){ // default ground terrain.  skips water.  basically, grass.

			// this.count = 1

			// sets MAX counts, but not guaranteed all instances are placed - 
			this.LODsets = LODsets || {
				low: new InstancedMesh( leaf_geo, this.material, Math.floor( this.count * .25 ) ),
				medium: new InstancedMesh( leaf_geo, this.material, Math.floor( this.count * .5 ) ),
				high: new InstancedMesh( leaf_geo, this.material, this.count ),
			}

			for( const size in this.LODsets ){

				const instance_mesh = this.LODsets[ size ]

				// instance_mesh.receiveShadow = true
				// instance_mesh.castShadow = true

				const dummy = new Object3D()
				let terrain

				let random_pos

				let scalar
				let super_scalar

				for( let i = 0; i < this.count; i++ ){

					random_pos = random_vector( 0, TILE_SIZE )

					terrain = this.grid?.[ Math.floor( random_pos.x / this.cell_size )]?.[ Math.floor( random_pos.z / this.cell_size )]

					if( !terrain || !terrain.name.match(/rock/i) ) continue

					random_pos.y = terrain.height

					index = i

					/*
						RANDOM WAY: ( grass )
					*/
					dummy.position.copy( random_pos )

					scalar = 10 * Math.random()

					dummy.scale.setScalar( scalar );

					dummy.position.y += scalar / 1.9

					if( Math.random() > .9 ){
						super_scalar = 1 + Math.random() * 2
						dummy.scale.multiplyScalar( super_scalar )
						dummy.position.y += super_scalar / 2
					} 
				  
					dummy.rotation.y = Math.random() * Math.PI;
				  
					dummy.updateMatrix();

					instance_mesh.setMatrixAt( index, dummy.matrix );

				}

				instance_mesh.instanceMatrix.needsUpdate = true
				// instance_mesh.instanceColor.needsUpdate = true

			}

		}else{

			console.log('unknown mesh type ', this.mesh_type )
			this.LODsets = {}

		} 
	}


	setLOD( setting ){ // MeshSet

		if( this.mesh_type === 'water' ){
			setting = 'high'
		}

		// console.log("setting LOD: ", this.mesh_type, setting )

		for( const size in this.LODsets ){
			if( size !== setting ) this.fixture.remove( this.LODsets[ size ] )
		}

		switch( setting ){

			case 'low':
				this.fixture.add( this.LODsets.low )
				break;

			case 'medium':
				this.fixture.add( this.LODsets.medium )
				break;

			case 'high':
				this.fixture.add( this.LODsets.high )
				break;

			default: 
				console.log('invalid LOD: ', setting )
				return;
		}

	}

}





























































class Block {

	constructor( init ){
		init = init || {}
		this.coords = init.coords || [] // x / y
		this.size = init.size || 3
		this.grid = init.grid || [] // 2d array 

		this.cell_size = Math.ceil( TILE_SIZE / this.size )

		this.mesh_sets = init.mesh_sets || [] // array of IntancedMeshes
		this.seed = init.seed || '1'
		this.sum = this.sum_seed()
		this.environment = init.environment
		this.LOD = 'low'
		this.fixture = new Group()

	}

	init_grid(){
		for( let i = 0; i < this.size; i++ ){
			this.grid[i] = []
			for( let a = 0; a < this.size; a++ ){
				this.grid[i][a] = this.set_cell_type( this.coords[0] * this.size, this.coords[1] * this.size, i, a )
			}
		}
		// console.log('initialized Block...', this.seed )
	}

	sum_seed(){
		let sum = 0
		for( const letter of this.seed ){
			sum += parseInt( letter, 16 )// .charCodeAt()
		}
		return sum
	}

	build_ground(){
		const set = new MeshSet({
			mesh_type: 'ground',
			grid: this.grid,
			size: this.size,
			fixture: this.fixture,
		})
		set.GROUND.receiveShadow = true
		this.ground_mesh = set.GROUND
		this.ground_mesh.userData = this.ground_mesh.userData
	}

	build_mesh_sets( worldTile ){
		const { x, z } = worldTile 
		// grass
		const grass = new MeshSet({
			fixture: this.fixture,
			grid: this.grid,
			size: this.size,	
			slug: 'grass',
			uniforms: uniforms.grass,
		})
		this.mesh_sets.push( grass )
		for( const size in grass.LODsets ){
			// grass.LODsets[ size ].position.set( x * TILE_SIZE, 0, z * TILE_SIZE )
			grass.LODsets[ size ].position.set( 0, 0, 0 )
		}		
		// clover
		const clover = new MeshSet({
			fixture: this.fixture,
			mesh_type: 'foliage',
			grid: this.grid,
			size: this.size,	
			slug: 'clover',
			uniforms: uniforms.clover,
		})
		this.mesh_sets.push( clover )
		for( const size in clover.LODsets ){
			// clover.LODsets[ size ].position.set( x * TILE_SIZE, 0, z * TILE_SIZE )
			clover.LODsets[ size ].position.set( 0,0,0, )
		}
		// water
		const water = new MeshSet({
			fixture: this.fixture,
			mesh_type: 'water',
			grid: this.grid,
			size: this.size,	
			slug: 'water',
			// uniforms: uniforms.water,
		})
		this.mesh_sets.push( water )
		for( const size in water.LODsets ){
			// water.LODsets[ size ].position.set( x * TILE_SIZE, 0, z * TILE_SIZE )
			water.LODsets[ size ].position.set( 0,0,0 )
		}
		// rock_grass
		const rock_grass = new MeshSet({
			fixture: this.fixture,
			mesh_type: 'rock_grass',
			grid: this.grid,
			size: this.size,	
			slug: 'rock_grass',
			// uniforms: uniforms.rock,
		})
		this.mesh_sets.push( rock_grass )
		for( const size in rock_grass.LODsets ){
			// rock.LODsets[ size ].position.set( x * TILE_SIZE, 0, z * TILE_SIZE )
			rock_grass.LODsets[ size ].position.set( 0,0,0 )
		}


		// this.water_mesh = water.water
		// this.mesh_sets.push( water )
		// for( const size in water.LODsets ){
		// 	water.LODsets[ size ].position.set( x * TILE_SIZE, 0, z * TILE_SIZE )
		// }
		// console.log('setting pos', x, z )
	}

	set_cell_type( worldX, worldZ, x, z){
		const worldpos = [ worldX + x, worldZ + z ]
		const perl = perlin.get( 
			worldpos[0] * PERLIN_SCALE, 
			worldpos[1] * PERLIN_SCALE, 
			this.seed 
		)
		// const perl = jaman_perlin.recurse( worldpos[0], worldpos[1], scale, scale, [[2,0.5],[2,0.5]] )

		const final = perlin_to_terrain( perl, this.environment )
		
		return final
	}

	setLOD( setting ){ // Block
		if( setting === this.LOD ) return
		this.LOD = setting
		for( const set of this.mesh_sets ) set.setLOD( setting )
	}

	update(){
		for( const set of this.mesh_sets ){
			uniforms[ set.slug ].time.value = clock.getElapsedTime() 
		}
	}

}































class BlockRegister {

	constructor(init){
		init = init || {}
		this.blocks = []
	}
	get(x,z){
		for( const block of this.blocks ){
			if( block.coords[0] === x && block.coords[1] === z ) return block
		}
		return false
	}
	add( block ){
		if( typeof block?.coords[0] !== 'number' || typeof block?.coords[1] !== 'number' ){
			console.log('invalid block add')
			return
		}
		const exists = this.get( block.coords[0], block.coords[1] )
		if( exists ){
			// console.log('block already exists')
			return
		}
		this.blocks.push( block )
		return true
	}
	sweep( playerIndex, tick_size ){
		// console.log('sweep', playerIndex, tick_size )
		let block
		for( let i = this.blocks.length -1; i >= 0; i-- ){
			block = this.blocks[i]
			if( typeof block.coords?.[0] !== 'number' || typeof block.coords?.[1] !== 'number' ){
				console.log('skipping invalid block', block )
				continue
			}
			if( Math.abs( block.coords[0] - playerIndex[0] ) > tick_size || 
				Math.abs( block.coords[1] - playerIndex[1] ) > tick_size ){
				this.remove( block )
			}else if( 
				Math.abs( block.coords[0] - playerIndex[0] ) > 2 || 
				Math.abs( block.coords[1] - playerIndex[1] ) > 2 ){
				block.setLOD('low')
			}else if(
				Math.abs( block.coords[0] - playerIndex[0] ) > 1 || 
				Math.abs( block.coords[1] - playerIndex[1] ) > 1 ){
				block.setLOD('medium')
			}else{
				block.setLOD('high')
			}
		}
		// console.log('unhandled blocks clear')
	}
	remove( block ){
		const b = this.get( block.coords[0], block.coords[1] )
		// block register
		if( b ){
			this.blocks.splice( this.blocks.indexOf( block ), 1 )
		}else{
			console.log('block already removed from index')
		}
		// ground
		if( b?.ground_mesh?.parent ){
			SCENE.remove( b.ground_mesh )
		}else{
			console.log('block already removed from Scene')
		}
		// mesh sets
		if( b?.mesh_sets ){
			for( const set of b.mesh_sets ){
				for( const size in set.LODsets ){
					SCENE.remove( set.LODsets[ size ] )
				}
			}
		}
	}

}


export {
	MeshSet,
	Block,
	BlockRegister
}