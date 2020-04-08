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

		const config = {
			colors: {
				backgroundColor: [0, 0, 0, 1.0],
				diffuseColor: [148, 0, 252, 1.0],
				ambientColor: [128, 149, 183, 1.0],
				lightColor: [225, 160, 160, 1.0]
			},
			light: {
				x: 40.0,
				y: 30.0,
				z: 40.0
			}
		}

		this.uniforms = {
			time: { type: 'f', value: 1.0 },
            modelViewProjectMatrixInverse: { type: 'm4', value: [] },
			// resolution: { type: 'v2', value: new THREE.Vector2() }
			iterations: { value: 4 },
			power: { type: 'f', value: 7.0 },
			phong: { type: 'b', value: true },
			shadows: { type: 'f', value: 0.0 },
			ambientOcclusion: { type: 'f', value: 0.9 },
			ambientOcclusionEmphasis: { type: 'f', value: 0.98 },
			bounding: { type: 'f', value: 1.5 },
			bailout: { type: 'f', value: 2.0 },
			colorSpread: { type: 'f', value: 2.5 },
			rimLight: { type: 'f', value: 1.5 },
			specularity: { type: 'f', value: 0.66 },
			specularExponent: { type: 'f', value: 15.0 },
			epsilonScale: { type: 'f', value: 1.0 },
			backgroundColor: { type: 'v4', value: new THREE.Vector4(...rgbPercent([...config.colors.backgroundColor])) },
			diffuseColor: { type: 'v4', value: new THREE.Vector4(...rgbPercent([...config.colors.diffuseColor])) },
			ambientColor: { type: 'v4', value: new THREE.Vector4(...rgbPercent([...config.colors.ambientColor])) },
			lightColor: { type: 'v4', value: new THREE.Vector4(...rgbPercent([...config.colors.lightColor])) },
			light: { type: 'v3', value: new THREE.Vector3(config.light.x, config.light.y, config.light.z) }
		}

		this.initGUI(config)

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

	initGUI(config) {

		const folders = {}

		GUI.add(this.uniforms.power, 'value', -20, 20).step(1.0).name('power')
		GUI.add(this.uniforms.phong, 'value').name('phong')

		folders.details = GUI.addFolder('details & performance')

		folders.details.add(this.uniforms.bounding, 'value', 0.5, 2.0).step(0.1).name('bounding')
		folders.details.add(this.uniforms.bailout, 'value', 1.0, 5.0).step(0.1).name('bailout')
		folders.details.add(this.uniforms.specularity, 'value', 0.0, 2.0).step(0.01).name('specularity')
		folders.details.add(this.uniforms.specularExponent, 'value', 0.0, 30.0).step(1.0).name('specularExponent')
		folders.details.add(this.uniforms.epsilonScale, 'value', 0.0, 1.0).step(0.01).name('epsilonScale')

		folders.shadows = GUI.addFolder('shadows')

		folders.shadows.add(this.uniforms.shadows, 'value', 0.0, 1.0).step(0.01).name('shadows')
		folders.shadows.add(this.uniforms.ambientOcclusion, 'value', 0.0, 3.0).step(0.1).name('ambientOcclusion')
		folders.shadows.add(this.uniforms.ambientOcclusionEmphasis, 'value', 0.0, 3.0).step(0.01).name('emphasis')

		folders.colors = GUI.addFolder('colors')

		folders.colors.addColor(config.colors, 'backgroundColor').onChange((value) => this.onChangeColor('backgroundColor', value))
		folders.colors.addColor(config.colors, 'diffuseColor').onChange((value) => this.onChangeColor('diffuseColor', value))
		folders.colors.addColor(config.colors, 'ambientColor').onChange((value) => this.onChangeColor('ambientColor', value))
		folders.colors.addColor(config.colors, 'lightColor').onChange((value) => this.onChangeColor('lightColor', value))
		folders.colors.add(this.uniforms.colorSpread, 'value', 0.0, 5.0).step(0.2).name('colorSpread')

		folders.light = GUI.addFolder('light')

		folders.light.add(config.light, 'x', -100, 100).step(1).onChange((value) => this.uniforms.light.value.x = value)
		folders.light.add(config.light, 'y', -100, 100).step(1).onChange((value) => this.uniforms.light.value.y = value)
		folders.light.add(config.light, 'z', -100, 100).step(1).onChange((value) => this.uniforms.light.value.z = value)
		folders.light.add(this.uniforms.rimLight, 'value', 0.0, 3.0).step(0.1).name('rim')

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

		// this.mesh.rotation.x += Math.PI

		// this.mesh.rotation.x += 0.00001
            
        // render ENGINE

		ENGINE.render()

		// add self to the requestAnimationFrame

		window.requestAnimationFrame(this.render.bind(this))

	}

}

export default new App()