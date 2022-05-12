import {
	Raycaster,
} from '../../inc/three.module.js?v=140'
import CAMERA from '../world/CAMERA.js?v=140'

const raycaster = new Raycaster(); 
raycaster.camera = CAMERA

export default raycaster