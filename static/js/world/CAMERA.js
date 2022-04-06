import { 
	PerspectiveCamera,
	Group,
} from '../../inc/three.module.js?v=130'

const camera = new PerspectiveCamera( 
	30, 
	window.innerWidth / window.innerHeight, 
	1, 
	1000
)

THREEPRESS.CAMERA = camera

// camera.yaw = {}

camera.fixture = new Group()
camera.fixture.add( camera )

// camera.setFocalLength( 25 )
// camera.original_focal_length = camera.getFocalLength()



export default camera

