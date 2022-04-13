// import Entity from './Entity.js?v=130'
import {
	random_entry,
} from '../lib.js?v=130'
import {
	MeshLambertMaterial,
	BoxBufferGeometry,
	Mesh,
	Group,
} from '../../inc/three.module.js?v=130'



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

		this.traverse_model()

	}

	traverse_model(){
		this.MODEL.traverse(ele => {
			ele.castShadow = true
			ele.receiveShadow = true
		})
		// this.MODEL.castShadow = true
	}

}