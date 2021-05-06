
import { 
	PerspectiveCamera,
	// Group,
} from './three.module.js'

const view = 1000

const camera = new PerspectiveCamera( 
	30, 
	window.innerWidth / window.innerHeight, 
	1, 
	view
)
// camera.position.set( 0, 300, -40 );

// camera.yaw = {}

// camera.fixture = new Group()


// camera.up = new THREE.Vector3(0, 0, 1)

// controls.maxPolarAngle = Math.PI / 1.97;
// controls.maxPolarAngle = Math.PI / 2;

export default camera

