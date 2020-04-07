import Easing from './easing'
import Dispatcher from './dispatcher'

export default class Tween {

	constructor({ target, channel, endValue, duration, easing = 'inOutQuad' }) {

		this.target = target
		this.channel = channel
		this.endValue = endValue
		this.duration = duration / 1000
		this.currentTime = 0
		this.finished = false
		
		this.onComplete = new Dispatcher()
        
		// new Easing(start, end, duration, startTime = 0, type = 'linear')
		this.easing = new Easing(this.target[channel], this.endValue, this.duration, 0, easing)
        
	}
	
	update(dt) {

        if (this.finished) return
        
        this.currentTime += dt
        
        if (this.currentTime >= this.duration) {
			this.target[this.channel] = this.endValue
			this.onComplete.notify()
			this.finished = true
		} else {
			this.target[this.channel] = this.easing.value(this.currentTime)
        }
        
	}
}