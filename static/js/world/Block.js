import {
	TILE_SIZE,
	scry,
	perlin,
	jaman_perlin,
	FOG_COLOR,
	FOG_NEAR,
	FOG_FAR,
} from '../lib.js?v=130'
import SCENE from './SCENE.js?v=130'
import {
	Clock,
	Mesh,
	Color,
	// PlaneGeometry,
	ShaderMaterial,
	PlaneBufferGeometry,
	Object3D,
	InstancedMesh,
	MeshLambertMaterial,
	DoubleSide,
	TextureLoader
} from '../../inc/three.module.js?v=130'




const clock = new Clock()
const texLoader = new TextureLoader()
const leaf_geo = new PlaneBufferGeometry(1)
const SHADER_CACHE = {}







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

const shaders = {
	vertex: {
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
},
	fragment: {
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
}`
	}

}

// textures
const textures = {
	'grass': {
		slug: 'clover.png',
		tex: false,
		// alpha: {
		// 	slug: 'grassAlpha.png',
		// 	tex: false,
		// }
	},
}
for( const type in textures ){
	textures[ type ].tex = texLoader.load( THREEPRESS.ARCADE.URLS.https + '/resource/texture/' + textures[ type ].slug )
}

// uniforms
const uniforms = {

	'grass':{
		time: {
	  		value: 0
		},
		grassTexture: {
	        value: textures.grass.tex,
	    },
		// grassAlpha: {
		//     value: grassAlpha,
		// },
		fogColor:    { type: "c", value: new Color( FOG_COLOR ) },
		fogNear:     { type: "f", value: FOG_NEAR },
		fogFar:      { type: "f", value: FOG_FAR },
		fogDensity:    { type: "f", value: 0.9 },	
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
			is_ground
			--- not needed for ground meshset:
			uniforms
			slug
		*/

		this.is_ground = init.is_ground
		this.grid = init.grid
		if( !Array.isArray( this.grid?.[0] ) || this.grid.length !== this.grid[0].length ){
			console.log('invalid 2d grid for MeshSet', init )
		}
		this.size = this.grid.length
		this.cell_size = Math.ceil( TILE_SIZE / this.size )
		this.count = this.grid.length * this.grid[0].length
		this.ground = false // instantiate below

		// console.log("init meshset", this )

		this.uniforms = init.uniforms
		this.slug = init.slug

		// material
		if( this.is_ground ){
			this.material = ground_material
		}else{
			if( !SHADER_CACHE[ this.slug ]){
				// console.log('init new SM', this.slug )
				SHADER_CACHE[ this.slug ] = new ShaderMaterial({
					vertexShader: shaders.vertex[ this.slug ],
					fragmentShader: shaders.fragment[ this.slug ],
					uniforms: uniforms[ this.slug ],
					side: DoubleSide,
					transparent: true,
					fog: true,
				})
			}
			this.material = SHADER_CACHE[ this.slug ]
		}


		let index
		// assign LOD's and/or ground mesh
		if( this.is_ground ){

			// this.ground = new Mesh( leaf_geo, temp_ground_material )
			// this.ground.rotation.x = -Math.PI / 2
			// this.ground.scale.multiplyScalar( TILE_SIZE * .9 )

			this.ground = new InstancedMesh( leaf_geo, ground_material, this.count )

			const dummy = new Object3D()

			for( let x = 0; x < this.grid.length; x++ ){
				for( let z = 0; z < this.grid.length; z++ ){
					index = ( x * this.size ) + z
					// console.log('index: ', index )
					if( this.grid?.[x]?.[z] ){
						dummy.position.set(
					  		this.cell_size * x,
					    	0,
					    	this.cell_size * z
					  	);

					  	dummy.scale.divide( dummy.scale ) // reset from last

					  	dummy.scale.multiplyScalar( this.cell_size )

						dummy.rotation.x = -Math.PI / 2
						// dummy.rotation.x = Math.random()
					  
						dummy.updateMatrix();

						this.ground.setMatrixAt( index, dummy.matrix );

						this.ground.setColorAt( index, DUMMY_VALUES[ this.grid[x][z] ] );

					}
				}
			}

			this.ground.instanceMatrix.needsUpdate = true
			this.ground.instanceColor.needsUpdate = true


		}else{

			this.LODsets = init.LODsets || {
				low: new InstancedMesh(leaf_geo, this.material, Math.floor( this.count * .25 ) ),
				medium: new InstancedMesh(leaf_geo, this.material, Math.floor( this.count * .5 ) ),
				high: new InstancedMesh( leaf_geo, this.material, this.count ),
			}

			for( const size in this.LODsets ){

				const instance_mesh = this.LODsets[ size ]

				const dummy = new Object3D()

				for( let x = 0; x < this.grid.length; x++ ){
					for( let z = 0; z < this.grid.length; z++ ){

						index = ( x * this.size ) + z

						if( this.grid?.[x]?.[z] ){
							dummy.position.set(
						  		( Math.random() ) * TILE_SIZE,
						    	0,
						    	( Math.random() ) * TILE_SIZE
						  	);
						  
							dummy.scale.setScalar( 10 * Math.random() );

							// if( Math.random() > .9 ) dummy.scale.multiplyScalar( 1 + Math.random() * 2 )
						  
							dummy.rotation.y = Math.random() * Math.PI;
						  
							dummy.updateMatrix();

							instance_mesh.setMatrixAt( index, dummy.matrix );

						}

					}

				}

			}

		} // 

	}


	setLOD( setting ){ // MeshSet

		// console.log("setting LOD: ", setting )

		for( const size in this.LODsets ){
			if( size !== setting ) SCENE.remove( this.LODsets[ size ] )
		}

		switch( setting ){

			case 'low':
				SCENE.add( this.LODsets.low )
				break;

			case 'medium':
				SCENE.add( this.LODsets.medium )
				break;

			case 'high':
				SCENE.add( this.LODsets.high )
				break;

			default: 
				console.log('invalid LOD: ', setting )
				return;
		}

	}

}





























const DUMMY_COLORS = THREEPRESS.DUMMY_COLORS = ['yellow', 'lightgreen', 'green', 'darkgreen', 'blue', 'darkblue']
const DUMMY_VALUES = THREEPRESS.DUMMY_VALUES = {}
for( let i = 0; i < DUMMY_COLORS.length; i++ ){
	DUMMY_VALUES[ DUMMY_COLORS[i] ] = new Color( DUMMY_COLORS[i] )
}



class Block {

	constructor( init ){
		init = init || {}
		this.coords = init.coords || [] // x / y
		this.size = init.size || 3
		this.grid = init.grid || [] // 2d array 
		this.mesh_sets = init.mesh_sets || [] // array of IntancedMeshes
		this.seed = init.seed || '1'
		this.sum = this.sum_seed()
		this.LOD = 'low'

	}

	init_grid(){
		for( let i = 0; i < this.size; i++ ){
			this.grid[i] = []
			for( let a = 0; a < this.size; a++ ){
				this.grid[i][a] = this.set_cell_color( this.coords[0] * this.size, this.coords[1] * this.size, i, a )
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
			is_ground: true,
			grid: this.grid,
			size: this.size,
		})
		this.ground_mesh = set.ground
	}

	build_mesh_sets( worldTile ){
		const { x, z } = worldTile 
		// ferns
		const grass = new MeshSet({
			grid: this.grid,
			size: this.size,	
			slug: 'grass',
			uniforms: uniforms.grass,
		})
		this.mesh_sets.push( grass )
		for( const size in grass.LODsets ){
			grass.LODsets[ size ].position.set( x * TILE_SIZE, 0, z * TILE_SIZE )
		}
		// console.log('setting pos', x, z )
	}

	set_cell_color( worldX, worldZ, x, z){
		const worldpos = [ worldX + x, worldZ + z ]
		const scale = .1
		const perl = perlin.get( worldpos[0] * scale, worldpos[1] * scale, this.seed )
		// const perl = jaman_perlin.recurse( worldpos[0], worldpos[1], scale, scale, [[2,0.5],[2,0.5]] )
		const final = Math.floor( scry( perl, -1, 1, 0, DUMMY_COLORS.length + 1 ) )
		// return new Color( 'rgb(' + final + ', 50, 50)')
		return DUMMY_COLORS[ final ]
	}

	setLOD( setting ){ // Block
		if( setting === 'ground' ){
			SCENE.add( this.ground_mesh )
		}else{
			for( const set of this.mesh_sets ) set.setLOD( setting )
			this.LOD = setting
		}
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
			console.log('ya..')
			for( const set of b.mesh_sets ){
				// console.log('slug..', slug )
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