// -------------------------------------------------------------------
// :: Modal
// -------------------------------------------------------------------

import Component from '../base/component'
import Dispatcher from '../helpers/dispatcher'

export default class Interface extends Component { 

	constructor(selector) {

        super(selector)

        this.settings = {
            theme: 'grayscale',
            video: 'webcam',
            state: 1
        }

        this.ALLOWED_ELEMENTS = ['BUTTON', 'SELECT', 'ANCHOR', 'INPUT']

    }

    click(e) {

        e.preventDefault()

        if (!this.ALLOWED_ELEMENTS.includes(e.target.nodeName)) return

        const tmpSettings = JSON.stringify(this.settings)
        const name = e.target.name

        switch(e.target.nodeName) {
            case 'SELECT':
                this.settings[name] = e.target.options[e.target.selectedIndex].value
                break
        }

        if (JSON.stringify(this.settings) === tmpSettings) return

        super.click(e)

    }

}