'use strict'

export const random = (v0, v1) => {

	if (Array.isArray(v0)) return v0[Math.floor(Math.random() * v0.length)]

	if (!v1) {
		v0 = 0 - v0
		v1 = v0
	}

	return Math.random() * (v1 - v0) + v0

}

export const normalize = (v, vmin, vmax, tmin, tmax) => {

	let nv = Math.max(Math.min(v, vmax), vmin)
	let dv = vmax - vmin
	let pc = (nv - vmin) / dv
	let dt = tmax - tmin
	let tv = tmin + (pc * dt)

	return tv;

}

export const clamp = (value, min, max) => {

	if (value < min) return min
	if (value > max) return max
	
	return value

}

export const lerp = (v0, v1, t) => {

	return v0 * (1 - t) + v1 * t
	
}

export const safeEval = (exp) => {

	// if it's already an int, return the value

	if (typeof exp !== 'string') return exp

	// regular expression

	var reg = /(?:[a-z$_][a-z0-9$_]*)|(?:[;={}\[\]"'!&<>^\\?:])/ig,
	valid = true;

	// detect valid JS identifier names and replace them

	exp = exp.replace(reg, (prop) => {

		// if the name is a direct member of Math, allow
		// otherwise the expression is invalid

		if (Math.hasOwnProperty(prop)) return 'Math.' + prop
		else valid = false

	})

	// don't eval if our replace function flagged as invalid

	if (!valid) alert('Invalid arithmetic expression')

	try { 
		return eval(exp)
	} catch (e) { 
		alert('Invalid arithmetic expression');
	}

}

Array.prototype.random = () => random(this)
Number.prototype.normalize = (vmin, vmax, tmin, tmax) => normalize(this, vmin, vmax, tmin, tmax)
Number.prototype.clamp = (min, max) => clamp(this, min, max)