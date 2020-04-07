'use strict'

// import * as THREE from 'three'
import { safeEval } from './math.js'

export const shadow = (subject, opacity) => {
	
	let material = new THREE.ShadowMaterial({opacity: opacity})
	let mesh = new THREE.Mesh(subject.geometry, material)
	
	// mesh.position.set({...subject.position})
	mesh.position.set(subject.position.x, subject.position.y, subject.position.z)
	mesh.receiveShadow = true
	
	return mesh

}

export const hcfp = (percent) => {

	return `#${new THREE.Color().setHSL(safeEval(percent), 0.5, 0.5).getHexString()}`

}