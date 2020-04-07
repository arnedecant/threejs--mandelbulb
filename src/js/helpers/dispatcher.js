// ---------------------------------------------------------------
// :: EVENT DISPATCHER
// ---------------------------------------------------------------

export default class Dispatcher {

	// ---------------------------------------------------------------
	// :: CONSTRUCTOR
	// ---------------------------------------------------------------

  	constructor(sender) {

        this.sender = sender
        this.listeners = []

	}


    // ---------------------------------------------------------------
	// :: REGISTER
	// ---------------------------------------------------------------

    addListener(listener) {

        this.listeners.push(listener)

    }

    addEventListener(listener) {

        this.addListener(listener)

    }

    // To remove event dispatchers, handlers should be variables
    // because .bind(this) creates a new instance when called
    // Example usage (in some view or controller):
    //
    // - this.handler = this.handler.bind(this)
    // - this.model.dispatcher.addListener(this.handler)
    // - this.model.dispatcher.removeListener(this.handler)
    //
    // removeListener(listener){
    //
    //    this.listeners.forEach((item, i) => {
    //        if(item == listener) this.listeners.splice(i, 1)
    //    })
    //
    // }


    // ---------------------------------------------------------------
	// :: NOTIFY
	// ---------------------------------------------------------------

    notify(args) {

        this.listeners.forEach((listener) => {
            listener(args, this.sender)
        })

    }

}