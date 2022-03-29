
class MessageBroker {

	constructor(){

		this.subscribers = {}

	}

	publish( event, data ){

		if( !this.subscribers[ event ] ){
			console.log('event with no sub: ', event )
			return
		}

	    this.subscribers[ event ].forEach( subscriberCallback => subscriberCallback( data ) )

	}

	subscribe( event, callback ){

		if( !this.subscribers[event] ){
			this.subscribers[event] = []
		}
	    
	    this.subscribers[event].push( callback )

	}

}

const broker = THREEPRESS.BROKER = new MessageBroker()

export default broker

