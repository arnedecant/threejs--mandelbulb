import Dispatcher from "../helpers/dispatcher"
import { isEqual } from "../utilities/object"

export default class Keyboard {

	constructor() {

        this.reset()

        window.addEventListener('keyup', this.keyup.bind(this))
        window.addEventListener('keydown', this.keydown.bind(this))

        this.onKeyUp = new Dispatcher(this)
        this.onKeyDown = new Dispatcher(this)
        this.onDirection = new Dispatcher(this)
        
    }

    reset() {

        // this._key = undefined
        // this._modifier = undefined
        this._direction = { x: 0, y: 0, z: 0 }
        this._prevDirection = { ...this._direction }

    }

    keyup(e) {

        const key = this.getKey(e)

        switch (key) {

            case 'up': this._direction.z = 0
                break
            case 'down': this._direction.z = 0
                break
            case 'right': this._direction.x = 0
                break
            case 'left': this._direction.x = 0
                break

            default: return

        }

        if (isEqual(this._direction, this._prevDirection)) return

        this.onDirection.notify(this._direction)

        this._prevDirection = { ...this._direction }

    }
    
    keydown(e) {

        const key = this.getKey(e)

        switch (key) {

            case 'up': this._direction.z = 1
                break
            case 'down': this._direction.z = -1
                break
            case 'right': this._direction.x = 1
                break
            case 'left': this._direction.x = -1
                break

            default: return

        }

        if (isEqual(this._direction, this._prevDirection)) return

        this.onDirection.notify(this._direction)

        this._prevDirection = { ...this._direction }

    }

    getKey(e) {

        if (e.defaultPrevented) return

        if (e.ctrlKey || e.altKey || e.metaKey || e.shiftKey) return

        switch (e.code || e.key || e.keyCode) {

            // Direction = 'up' when clicking 'W' on QWERTY 
            // keyboards, but 'Z' on AZERTY keyboards

            case 'KeyW': 
            case 'ArrowUp':
            case 38:
                return 'up'

            case 'KeyS': 
            case 'ArrowDown':
                return 'down'

            case 'KeyD': 
            case 'ArrowRight':
                return 'right'

            case 'KeyA': 
            case 'ArrowLeft':
                return 'left'

            default: return

        }

    }

    get direction() {

        return this._direction

    }
	
	
}