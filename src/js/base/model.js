import Dispatcher from "../helpers/dispatcher"

// -------------------------------------------------------------------
// :: Model
// -------------------------------------------------------------------

export default class Model {

	constructor({ name, mesh, path, audio, scale = 1, position = { x: 0, y: 0, z: 0 } }) {

		this.name = name
		this.path = path
		this.scale = scale
		this.position = position
		this.mesh = mesh

		if (audio && typeof audio === 'string') this.audio = new Audio({ name })
		else if (audio) this.audio = audio

		this.audio = audio

		this.onLoadingFinished = new Dispatcher()
        
		if (!this.mesh) ENGINE.loader.load(path, this.setup.bind(this))

		this.init()

	}

	init() {

		

	}

	setup(mesh) {
		
		mesh.scale.set(this.scale, this.scale, this.scale)
		mesh.name = this.name
		mesh.castShadow = true

		for (let key in this.position) mesh.position[key] = this.position[key]

		mesh.traverse((child) => {
			if (!child.isMesh) return
			child.castShadow = true
			child.receiveShadow = true
		})

		this.mesh = mesh
		ENGINE.scene.add(this.mesh)
		this.onLoadingFinished.notify()

    }

	render(dt) {

		

	}

}