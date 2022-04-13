import { 
	Scene, 
	Color, 
	AxesHelper,
	FogExp2, 
	// BoxBufferGeometry,
	// MeshLambertMaterial,
	// Mesh,
	// DoubleSide,
} from '../../inc/three.module.js?v=130'


const scene = new Scene()

scene.fog = new FogExp2( 0xccccff, .002 )

export default scene

