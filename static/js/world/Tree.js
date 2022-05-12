import Entity from './Entity.js?v=140'
import {
	random_entry,
} from '../lib.js?v=140'
import {
	MeshLambertMaterial,
} from '../../inc/three.module.js?v=140'




const light_green = new MeshLambertMaterial({
	color: 'rgb(00, 150, 50)',
})
const mid_green = new MeshLambertMaterial({
	color: 'rgb(0, 120, 30)',
})

const tree_mats = {
	pine: [ light_green, mid_green ],
}



export default class Tree extends Entity {
	constructor( init){
		super(init)
		init = init || {}
		Object.assign( this, init )

		this.use_cache = true

	}

	process_model(){
		this.MODEL.traverse(ele => {
			ele.castShadow = true
			if( ele.material ) ele.material = random_entry( tree_mats[ this.species ] )
		})

		this.MODEL.userData.clickable = true
		this.MODEL.userData.uuid = this.uuid

	}

}