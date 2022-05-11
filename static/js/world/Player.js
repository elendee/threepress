import {
	TILE_SIZE,
	hal,
} from '../lib.js?v=130'

import Entity from './Entity.js?v=130'


class Player extends Entity {
	constructor( init ){
		super( init )
		init = init || {}

		Object.assign( this, init )

		this.current_cell = false // set on interval
		this.previous_cell = false // set on interval

		this.animation_map = { 
			/*
				game actions -> the embedded animation names for that modeltype
			*/
			quaternius_low: {
				'walking': {
					localized: 'Walk',
					fade: 500,
				},
				'running': {
					localized: 'Run',
					fade: 500,
				},
				'strafing': {
					localized: 'Run',
					fade: 500,
				},
				'turning': {
					localized: 'Walk',
					fade: 500,
				},
				'idle': {
					localized: 'Idle',
					fade: 500,
				},
				'receive_hit': {
					localized: 'RecieveHit', // (mispelled)
					fade: 500,
				},
				'jump': {
					localized: 'Jump', // (mispelled)
					fade: 150,
				},
				'punch': {
					localized: 'Punch', // (mispelled)
					fade: 200,
				},
				'victory': {
					localized: 'Victory', // (mispelled)
					fade: 50,
				},
				'roll': {
					localized: 'Roll', // (mispelled)
					fade: 50,
				},
			},

		}

		/* 
			- hydrated with model:
			this.animation = {
				mixer: new AnimationMixer( obj.scene ),
				clips: obj.animations,
			}
		*/
	}


	hydrate( player_data ){
		// console.log('hydrating player... is this going to work..', player_data ) // ( same as Entity.hydrate )
		for( const key in player_data ){
			this[ key ] = player_data[ key ]
			// console.log('hydrating', key, player_data[ key ])
		}
	}


	get_cell( block_register ){

		let cell

		const ppos = this.GROUP.position
		const index = this.getBlockIndex()
		let block, block_modulo, cell_index
		for( const b of block_register.blocks ){
			if( b.coords[0] === index[0] && b.coords[1] === index[1] ){

				block = b

				// interior cell coords
				block_modulo = {
					x: Number( ( ppos.x % TILE_SIZE ).toFixed(2) ),
					z: Number( ( ppos.z % TILE_SIZE ).toFixed(2) ),
				}

				// but world coords are always pos / neg
				// interior coords are always pos
				// so
				// wtf
				// how to do the transform

				//  -- PROBABLY off by one here --
				if( ppos.x < 0 ) block_modulo.x = ( TILE_SIZE + block_modulo.x )
				if( ppos.z < 0 ) block_modulo.z = ( TILE_SIZE + block_modulo.z )
				// -----

				// console.log( block_modulo )

				// floor to int coords
				cell_index = {
					x: Math.floor( block_modulo.x / b.cell_size ),
					z: Math.floor( block_modulo.z / b.cell_size ),
				}

				cell = b.grid?.[cell_index.x]?.[cell_index.z]
				if( !cell ){
					console.log('missing cell for ', cell_index.x, cell_index.z )
					continue
					// console.log('and grid', b.grid )
				}
				break;
			}
		}


		// dev indicator:


		if( 0 ){ // debugging:
			
			// const time = 1800
			// if( block ) block.fixture.position.y = Math.random()

			// hal('standard', cell?.name, time )
			// hal('error', 'cell: ' + JSON.stringify( cell_index ), time )
			// hal('system', 'block: ' + JSON.stringify( block.coords ), time )
			// hal('combat', 'player: ' + JSON.stringify( index ) + '<br>' + JSON.stringify({
			// 	x: this.GROUP.position.x.toFixed(1),
			// 	z: this.GROUP.position.z.toFixed(1),
			// }), time)
		}

		return cell

	}


	begin_tile_detect( block_register ){

		if( this.tile_detect ) return

		this.tile_detect = setInterval(() => {

			const cell = this.get_cell( block_register )

			if( this.current_cell !== cell ){
				// console.log('NOW on: ', b.coords )
				this.previous_cell = this.current_cell
				this.current_cell = cell
				this.update_cell_state( cell )
				// console.log('updating to', cell )
			}

		}, 500)

	}


	update_cell_state( cell ){
		/*
			dont handle history, just set state
		*/
		const current = this.current_cell
		if( current && current.name.match(/water/) ){
			this.swim( true )
		}else{
			this.swim( false )
			this.GROUP.position.y = cell.height
		}
	}

	swim( state ){

		if( state ){
			this.animate('roll', true, 50 )
			setTimeout(()  => {
				this.animate('roll', false, 50 )
				this.animate('victory', true, 100)
				// this.animate('receive_hit', true, 100)
				this.MODEL.rotation.x = .5
				this.GROUP.position.y = -3
			}, 500)			
		}else{
			// this.animate('roll', false, 50 )
			this.animate('victory', false, 100)
			// this.animate('receive_hit', false, 100)
			this.MODEL.rotation.x = 0 // ( Math.PI / 2 ) - .15
			this.GROUP.position.y = 0
		}

	}


	process_model(){
		
		this.MODEL.traverse(ele => {
			if( ele.name.match(/cube/i)){
				ele.castShadow = true
				ele.receiveShadow = true
			}		
		})

		this.MODEL.userData.clickable = true
		this.MODEL.userData.uuid = this.uuid

	}


}


export default Player