// -------------------------------------------------------------------
// :: Modal
// -------------------------------------------------------------------

import Component from '../base/component'
import Dispatcher from '../helpers/dispatcher'

// extends Component ??

export default class Modal { 

	constructor(id, triggers = []) {

		// Properties
		
		this.id = `modal__${ id }`
		this.element = document.getElementById(this.id)
		this.triggers = this._normalize(triggers)

		// Dispatchers

		this.onClick = new Dispatcher()
		this.onOpen = new Dispatcher()
		this.onClose = new Dispatcher()

		// Events

		document.body.addEventListener('click', this.click.bind(this))

	}

	// Convert whatever type triggers may be into an array of nodes

	_normalize(triggers) {

		// String

		if (typeof triggers === 'string') triggers = [...document.querySelectorAll(selector)]

		// Array of strings or NodeList

		if (!Array.isArray(triggers)) triggers = [...triggers]
		triggers.map((trigger) => typeof trigger === 'string' ? [...document.querySelectorAll(trigger)] : trigger)

		// Flatten the array
		
		return triggers.flat()

	}

	_isSupported() {

		if (typeof this.element.showModal === 'function') return true
		
		return false

	}

	init() {

		

	}

	click(e) {

		if (e.target.nodeName !== 'BUTTON') return

		this.close()
		this.onClick.notify()

    }
    
    open() {

		if (this._isSupported()) this.element.showModal()
		else this.element.setAttribute('open', 'open')
		
		this.onOpen.notify()

    }

    close() {

		if (this._isSupported()) this.element.close()
		else this.element.removeAttribute('open')

		this.onClose.notify()

    }

}