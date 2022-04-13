import {
	Raycaster,
} from '../../inc/three.module.js?v=130'
import CAMERA from '../world/CAMERA.js?v=130'

const raycaster = new Raycaster(); 
raycaster.camera = CAMERA

export default raycaster