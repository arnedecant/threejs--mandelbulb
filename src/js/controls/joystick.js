import Dispatcher from "../helpers/dispatcher";

export default class JoyStick {

	constructor(options = {}) {

		this.$template = document.querySelector('template[data-name="joystick"]').content.cloneNode(true)

		this.$joystick = this.$template.querySelector('.joystick')
		this.$thumb = this.$template.querySelector('.joystick__thumb')

		INTERFACE.element.appendChild(this.$joystick)

		this.onDirection = new Dispatcher()
        
		this.maxRadius = options.maxRadius || (this.$joystick.offsetWidth / 2)
		this.maxRadiusSquared = this.maxRadius * this.maxRadius
		this.origin = { left: this.$thumb.offsetLeft, top: this.$thumb.offsetTop }
        
        if (!this.$thumb) return

        this.$thumb.addEventListener('touchstart', this.tap.bind(this))
		this.$thumb.addEventListener('mousedown', this.tap.bind(this))
		
	}
	
	getMousePosition(e = window.event) {

		let x = e.targetTouches ? e.targetTouches[0].pageX : e.clientX
		let y = e.targetTouches ? e.targetTouches[0].pageY : e.clientY

		return { x, y }

	}
	
	tap(e = window.event) {
		
		// get the mouse cursor position at startup:

		this.offset = this.getMousePosition(e)

		// set events

		document.ontouchmove = this.move.bind(this)
		document.ontouchend =  this.up.bind(this)
		document.onmousemove = this.move.bind(this)
		document.onmouseup = this.up.bind(this)

	}
	
	move(e = window.event) {

		// calculate the new cursor position:
		
		const mouse = this.getMousePosition(e)

		let left = mouse.x - this.offset.x
		let top = mouse.y - this.offset.y

		// set boundaries
		
		const sqMag = left * left + top * top

		if (sqMag > this.maxRadiusSquared) {

			// To the power of 0.5 is equal to square 
			// root, but a tad more performant

			const magnitude = Math.pow(sqMag, 0.5)

			left /= magnitude
			top /= magnitude
			left *= this.maxRadius
			top *= this.maxRadius

		}
        
		// set the element's new position:

		this.$thumb.style.setProperty('--translateX', left + 'px')
		this.$thumb.style.setProperty('--translateY', top + 'px')
		this.$thumb.style.setProperty('--shadowX', (0 - left / 8) + 'px')
		this.$thumb.style.setProperty('--shadowY', (0 - top / 8) + 'px')

		// set normalized values
		
		const x = (left - this.origin.left + this.$thumb.clientWidth / 2) / this.maxRadius
		const z = 0 - (top - this.origin.top + this.$thumb.clientHeight / 2) / this.maxRadius

		// notify listeners

		this.onDirection.notify({ x, y: 0, z })

	}
	
	up(e = window.event) {

		// disable events

		document.ontouchmove = null
		document.touchend = null
		document.onmousemove = null
		document.onmouseup = null

		// reset thumb

		this.$thumb.style.setProperty('--translateX', 0 + 'px')
		this.$thumb.style.setProperty('--translateY', 0 + 'px')
		this.$thumb.style.setProperty('--shadowX', 0 + 'px')
		this.$thumb.style.setProperty('--shadowY', 0 + 'px')

		// notify listeners

		this.onDirection.notify({ x: 0, y: 0, z: 0 })

	}
}