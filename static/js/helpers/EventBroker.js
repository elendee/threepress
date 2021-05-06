
class MessageBroker {

	constructor(){

		this.subscribers = {}

	}

	publish( event, data ){

		if( !this.subscribers[ event ] ) return

	    this.subscribers[ event ].forEach( subscriberCallback => subscriberCallback( data ) )

	}

	subscribe( event, callback ){

		if( !this.subscribers[event] ){
			this.subscribers[event] = []
		}
	    
	    this.subscribers[event].push( callback )

	}

}

const broker = new MessageBroker()

export default broker

