// import Entity from './Entity.js?v=140'
// import {
// 	// random_entry,
// 	add_transforms,
// } from '../lib.js?v=140'
// import {}
import {
	MeshLambertMaterial,
	BoxBufferGeometry,
	Mesh,
	Group,
} from '../../inc/three.module.js?v=140'



const geo = new BoxBufferGeometry(1,1,1)
const mat = new MeshLambertMaterial({
	color: 'rgb(255, 255, 250)'
})

export default class Pillar {

	constructor( init){
		init = init || {}
		Object.assign( this, init )

		this.use_cache = true

	}

	async construct_model(){
		const mesh = new Mesh( geo, mat )
		mesh.scale.x = this.width
		mesh.scale.y = this.height
		mesh.scale.z = this.length
		this.MODEL = mesh
		this.GROUP = new Group()
		this.GROUP.add( this.MODEL )

		mesh.rotation.y = this.rotation

		this.process_model()

	}

	process_model(){
		
		this.MODEL.traverse(ele => {
			ele.castShadow = true
			ele.receiveShadow = true
		})

		this.MODEL.userData.clickable = true
		this.MODEL.userData.uuid = this.uuid

	}

}