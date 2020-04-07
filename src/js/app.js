// -------------------------------------------------------------------
// :: App
// -------------------------------------------------------------------
// http://www.fractal.org/Sphere-mandelbulb.pdf
// https://www.youtube.com/watch?v=VVzWfPqWFHY
// https://en.wikipedia.org/wiki/Mandelbulb
// https://www.taoeffect.com/other/fractals/mandelbulb/

import Engine from './Engine.js'

class App {

	constructor() {

		this.url = new URL(window.location.href)
		this.debug = this.url.searchParams.get('debug') || 0

		// elements

        this.$container = document.getElementById('canvas')

		// create new engine: setup scene, camera & lighting

		window.ENGINE = new Engine({ container: this.$container, assetsPath: 'assets/', debug: this.debug })

		// properties

		this.state = {}
		this.modals = {}
		this.components = {}

		this.shaders = {
			vertex: document.querySelector('[data-shader="vertex"]').textContent,
			fragment: document.querySelector('[data-shader="fragment"]').textContent
		}

		this.uniforms = {
            time: { type: 'f', value: 1.0 },
            modelViewProjectMatrixInverse: { type: 'm4', value: [] },
            // resolution: { type: 'v2', value: new THREE.Vector2() }
		}
		
		this.modelViewProjectMatrixInverse = new THREE.Matrix4()

		// events

		document.body.addEventListener('click', this.click.bind(this))

		// setup

		this.setup()

	}

	setup() {

		this.init()

	}

	clear() {

		ENGINE.clear()
		ENGINE.scene.background = new THREE.Color(0x222222)

	}

	reset() {

		this.clear()

	}

	init() {

		this.clear()

		const geometry = new THREE.PlaneGeometry(2, 2)
		const material = new THREE.ShaderMaterial({
			uniforms: this.uniforms,
			vertexShader: this.shaders.vertex,
			fragmentShader: this.shaders.fragment,
            // depthTest: false,
            // side: THREE.DoubleSide
		})

		this.mesh = new THREE.Mesh(geometry, material)

		// use a billboard instead?
		// this.mesh.frustumCulled = false
		
		ENGINE.add(this.mesh)

		this.render()

	}

	click(e) {

		

	}

	render(timestamp) {

		ENGINE.camera.updateMatrixWorld()
		
		this.uniforms.time.value += CLOCK.getDelta() * 2

		this.modelViewProjectMatrixInverse.multiplyMatrices(ENGINE.camera.projectionMatrix, ENGINE.camera.matrixWorldInverse).multiply(this.mesh.matrixWorld)
		this.modelViewProjectMatrixInverse.getInverse(this.modelViewProjectMatrixInverse)
		this.uniforms.modelViewProjectMatrixInverse.value = this.modelViewProjectMatrixInverse

		// this.mesh.rotation.x += 0.00001
            
        // render ENGINE

		ENGINE.render()

		// add self to the requestAnimationFrame

		window.requestAnimationFrame(this.render.bind(this))

	}

}

export default new App()