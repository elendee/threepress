import {
	addBloom,
} from '../../inc/composer/ComposerSelectiveBloom.js?v=121'

import {
	Vector3,
	Group,
	Mesh,
	BoxBufferGeometry,
	PlaneBufferGeometry,
	MeshBasicMaterial,
} from '../../inc/three.module.js?v=121'

import {
	random_vector,
	random_hex,
} from '../lib.js?v=121'



const flakegeo = [
	new BoxBufferGeometry(.6, .6, .6),
	new PlaneBufferGeometry(.4, .4),
]
const flakemats = []
const whitemat = new MeshBasicMaterial({ color: 'white' })

let mothernature
const prevailing = window.prevailing = new Vector3(10, 0, 0)




let tracking = 0
let tracker = 0

class Gust {

	constructor( init ){

		init = init || {}

		this.id = random_hex( 4 )
		tracking++
		if( tracking < 3 ) this.tracking = true

		this.flakes = []
		this.group = new Group()
		const dim = 20 + ( Math.random() * 70 )
		this.dimensions = new Vector3( dim, dim, dim )
		let flake
		for( let i = 0; i < 50; i++){
			flake = new Flake({
				in_gust: true,
				mat: init.mat,
			})
			flake.ele.scale.multiplyScalar( Math.random() )
			flake.position.copy( random_vector( -dim/2, dim/2 ) )
			this.flakes.push( flake )
			this.group.add( flake.ele )
		}	
		this.momentum = new Vector3(1, -1, 0)
		this.position = new Vector3()

		const x = -50 + (Math.random() * 100 )
		const z = -50 + (Math.random() * 100 )
		this.group.position.set( x, 50, z )

	}


	reset(){
		this.position.y = 60
	}

	update( delta ){

		const add = random_vector( -2, 2 )
		this.momentum.add( add ).clampScalar( -10, 10 )
		this.momentum.y = Math.min( 0, this.momentum.y )

		this.momentum.add( prevailing )
		// if( delta < 0 ) debugger

		const tick = new Vector3().copy( this.momentum ).multiplyScalar( delta / 1000 )
		// if( tracker % 200 === 0 ) console.log( add.y > 0, this.momentum.y > 0, prevailing.y > 0 )
		// if( tracker % 200 === 0 ) console.log( 'WTF adding ' + tick.y + ' to ' + this.group.position.y )
		tracker++

		this.group.position.add( tick )
		// this.group.position.y -= .11

		// x
		if( Math.abs( this.group.position.x ) > 60 ){
			// if( this.tracking ) console.log('reset group ' + this.id + ' x to', this.group.position.x )
			if( this.group.position.x > 0 ){
				this.group.position.x = -50
			}else{
				this.group.position.x = 50
			}
			// this.group.position.x *= ( -1 * ( 40 / this.group.position.x ) )
		}
		// y
		if( this.group.position.y < -50 ) this.group.position.y = 50
		// z
		if( Math.abs( this.group.position.z ) > 60 ){
			// if( this.tracking ) console.log('reset group ' + this.id + ' z to', this.group.position.z )
			if( this.group.position.z > 0 ){
				this.group.position.z = -50
			}else{
				this.group.position.z = 50
			}
			// this.group.position.z *= ( -1 * ( 40 / this.group.position.z ) )
		}

		for( const flake of this.flakes ) flake.update( delta )

	}

}





class Flake {

	constructor( init ){
		init = init || {}
		this.momentum = new Vector3()
		this.position = new Vector3()
		this.ele = new Mesh( flakegeo[ Math.random() > .5 ? 1 : 0 ], init.mat || whitemat )
		// this.ele.castShadow = true
		addBloom( this.ele )
		this.in_gust = init.in_gust
		this.bound = this.in_gust ? 10 : 50
	}

	update( delta ){

		const add = random_vector( -1, 1 ).multiplyScalar( delta / 1000 )
		add.y = this.in_gust ? add.y : Math.min( -.5, add.y )
		this.momentum.add( add ).clampScalar( -.1, .1 )
		this.ele.position.add( this.momentum )

		this.r = Math.random()
		this.ele.rotation.x += this.r
		this.ele.rotation.y += this.r
		this.ele.rotation.z += this.r
		// set( this.r, this.r, this.r )

		// x
		if( Math.abs( this.ele.position.x ) > this.bound ) this.ele.position.x *= ( -1 * ( this.bound / this.ele.position.x ) )
		// y
		if( this.ele.position.y < -( this.bound / 2 ) ) this.ele.position.y = this.in_gust ? ( this.bound / 2 ) : 50
		// z
		if( Math.abs( this.ele.position.z ) > this.bound ) this.ele.position.z *= ( -1 * ( this.bound / this.ele.position.z ) )
	}

}








export default ( type, gallery ) => {

	gallery.flakes = []
	gallery.gusts = []

	// for( let i = 0; i < 10; i++ ){
	// 	flakemats[i] = new MeshBasicMaterial({
	// 		color: '#' + random_hex(6),
	// 	})
	// }

	if( type === 'blizzard'){
		for( let i = 0; i < 50; i++ ){
			const gust = new Gust({
				mat: whitemat,
				// mat: flakemats[ i % flakemats.length ],
			})
			setTimeout(()=> {
				gallery.gusts.push( gust )
				gallery.SCENE.add( gust.group )
				gust.group.position.y = Math.random() * 50
			}, Math.random() * 10 * 1000 )

		}

		if( !mothernature ) mothernature = setInterval(() => {
			const add = random_vector( -.5, .5 )
			prevailing.add( add ).clampScalar( -20, 20 )
			prevailing.y = Math.max( -5, Math.min( 2, prevailing.y ) )
		}, 30 )



	}else if( type === 'snow' ){
		for(let i = 0; i < 500; i++){
			const flake = new Flake({
				in_gust: false,
			})
			flake.ele.scale.multiplyScalar( Math.random() )
			let vector = random_vector( -50, 50 )
			// console.log(vector )
			flake.ele.position.copy( vector )
			setTimeout(() => {
				gallery.flakes.push( flake )
				gallery.SCENE.add( flake.ele )
			}, Math.random() * 2000 )
		}

	}

}