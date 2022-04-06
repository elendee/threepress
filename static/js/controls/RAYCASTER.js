import {
	Raycaster,
} from '../../inc/three.module.js'
import CAMERA from '../world/CAMERA.js?v=130'

const raycaster = new Raycaster(); 
raycaster.camera = CAMERA

export default raycaster