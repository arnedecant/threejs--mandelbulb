// -------------------------------------------------------------------
// :: App
// -------------------------------------------------------------------
// http://www.fractal.org/Sphere-mandelbulb.pdf
// https://www.youtube.com/watch?v=VVzWfPqWFHY
// https://en.wikipedia.org/wiki/Mandelbulb
// https://www.taoeffect.com/other/fractals/mandelbulb/

import Engine from './Engine.js'
import { rgbPercent } from './utilities/color.js'
// import { GUI } from 'dat.gui'

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

		const colors = {
			backgroundColor: [0, 0, 0, 1.0],
			diffuseColor: [0, 217, 252, 1.0],
			ambientColor: [170, 217, 255, 1.0],
			lightColor: [122, 150, 168, 1.0]
		}

		this.uniforms = {
			time: { type: 'f', value: 1.0 },
            modelViewProjectMatrixInverse: { type: 'm4', value: [] },
			// resolution: { type: 'v2', value: new THREE.Vector2() }
			iterations: { value: 4 },
			power: { type: 'f', value: 8.0 },
			phong: { type: 'b', value: true },
			shadows: { type: 'f', value: 0.0 },
			ambientOcclusion: { type: 'f', value: 0.9 },
			ambientOcclusionEmphasis: { type: 'f', value: 0.98 },
			bounding: { type: 'f', value: 1.5 },
			bailout: { type: 'f', value: 2.0 },
			colorSpread: { type: 'f', value: 0.2 },
			rimLight: { type: 'f', value: 0.0 },
			specularity: { type: 'f', value: 0.66 },
			specularExponent: { type: 'f', value: 15.0 },
			epsilonScale: { type: 'f', value: 1.0 },
			backgroundColor: { type: 'v4', value: new THREE.Vector4(...rgbPercent([...colors.backgroundColor])) },
			diffuseColor: { type: 'v4', value: new THREE.Vector4(...rgbPercent([...colors.diffuseColor])) },
			ambientColor: { type: 'v4', value: new THREE.Vector4(...rgbPercent([...colors.ambientColor])) },
			lightColor: { type: 'v4', value: new THREE.Vector4(...rgbPercent([...colors.lightColor])) }
		}

		GUI.add(this.uniforms.power, 'value', -20, 20).step(1).name('power')
		GUI.add(this.uniforms.phong, 'value').name('phong')
		GUI.add(this.uniforms.shadows, 'value', 0.0, 1.0).step(0.01).name('shadows')
		GUI.add(this.uniforms.ambientOcclusion, 'value', 0.0, 3.0).step(0.1).name('ambientOcclusion')
		GUI.add(this.uniforms.ambientOcclusionEmphasis, 'value', 0.0, 3.0).step(0.01).name('ambientOcclusionEmphasis')
		GUI.add(this.uniforms.bounding, 'value', 0.5, 2.0).step(0.1).name('bounding')
		GUI.add(this.uniforms.bailout, 'value', 1.0, 5.0).step(0.1).name('bailout')
		GUI.add(this.uniforms.colorSpread, 'value', 0.0, 5.0).step(0.2).name('colorSpread')
		GUI.add(this.uniforms.rimLight, 'value', 0.0, 2.0).step(0.1).name('rimLight')
		GUI.add(this.uniforms.specularity, 'value', 0.0, 2.0).step(0.01).name('specularity')
		GUI.add(this.uniforms.specularExponent, 'value', 0.0, 30.0).step(1.0).name('specularExponent')
		GUI.add(this.uniforms.epsilonScale, 'value', 0.0, 1.0).step(0.01).name('epsilonScale')

		GUI.addColor(colors, 'backgroundColor').onChange((value) => this.onChangeColor('backgroundColor', value))
		GUI.addColor(colors, 'diffuseColor').onChange((value) => this.onChangeColor('diffuseColor', value))
		GUI.addColor(colors, 'ambientColor').onChange((value) => this.onChangeColor('ambientColor', value))
		GUI.addColor(colors, 'lightColor').onChange((value) => this.onChangeColor('lightColor', value))

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

	onChangeColor(key, value) {

		const v = rgbPercent([...value])
		this.uniforms[key].value.set(...v)

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