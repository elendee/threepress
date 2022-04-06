import { 
	// Mesh,
	DirectionalLight, 
	PointLight,
	// DirectionalLightHelper,
	HemisphereLight,
	// TextureLoader,
	// SpriteMaterial,
	// Sprite,
	// Color,
	// Group,
	Vector3,
	// PlaneGeometry,
	// MeshLambertMaterial,
} from '../../inc/three.module.js?v=130'




const coords = { x: 10, y: 10, z: 10 }
const offset = new Vector3( coords.x * 2, coords.y * 3, coords.x * 2 )

const hemispherical = new HemisphereLight( 0x5599cc, 0xffffff, .4 )
const pointlight = new PointLight( 0xffffff )
const directional = new DirectionalLight( 0xffffff )

directional.position.copy( offset )
directional.castShadow = true

directional.shadow.camera.near = 1;
directional.shadow.camera.far = coords.y * 6;

// bounds
directional.shadow.camera.left = -coords.x * 5; // * 3
directional.shadow.camera.right = coords.x * 5; // * 3
directional.shadow.camera.top = coords.z * 5; // * 3
directional.shadow.camera.bottom = -coords.z * 5; // * 3

// resolution
directional.shadow.mapSize.width = coords.x * 50;
directional.shadow.mapSize.height = coords.z * 50;









let tracking = false
const track = ( player, state ) => { // defaults to directional

	if( state ){

		tracking = setInterval( () => {

			directional.position.copy( player.GROUP.position ).add( offset )
			directional.target.position.copy( directional.position ).sub( offset )

			// console.log('set pos', directional.position )
			// console.log('set tar', directional.target.position )

		}, 2000 )

	}else{

		clearInterval( tracking )
		tracking = false

	}

}


const light = { 
	hemispherical,
	pointlight,
	directional,
	track,
}

THREEPRESS.LIGHT = light

export default light