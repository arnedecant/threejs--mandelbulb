// -------------------------------------------------------------------
// :: Audio
// -------------------------------------------------------------------

export default class Audio {

	constructor(options = {}) {

		this.name = options.name
		this.context = options.context || GAME.audioContext

		this._volume = (options.volume != undefined) ? options.volume : 1.0

		this.gainNode = this.context.createGain()
		this.gainNode.gain.setValueAtTime(this._volume, this.context.currentTime)
		this.gainNode.connect(this.context.destination)

		// this.volume = (options.volume != undefined) ? options.volume : 1.0

		this._loop = (options.loop == undefined) ? false : options.loop
		this.fadeDuration = (options.fadeDuration == undefined) ? 0.5 : options.fadeDuration
		this.autoplay = (options.autoplay == undefined) ? false : options.autoplay
		this.buffer = null

		options.src = {}

		const codecs = ['mp3', 'ogg', 'xmp']
		let codec = codecs.find((c) => Audio.supportsAudioType(c))
		
		if (codec) {
			this.path = `assets/audio/${ this.name }.${ codec }`
            this.load(this.path)
		} else {
			console.warn("Browser does not support any of the supplied audio files")
        }
        
	}
	
	static supportsAudioType(type) {

		let audio
		let formats = {
			mp3: 'audio/mpeg',
			wav: 'audio/wav',
			aif: 'audio/x-aiff',
			ogg: 'audio/ogg'
		}

		if (!audio) audio = document.createElement('audio')

        return audio.canPlayType(formats[type] || type)
        
	}
	
	load(path) {
          
        const _this = this
        const request = new XMLHttpRequest() // load buffer asynchronously
          
  		request.open("GET", path, true)
  		request.responseType = 'arraybuffer'

  		request.onload = () => {

            // Asynchronously decode the audio file data in request.response

            let fnError = (error) => console.error('decodeAudioData error', error)
            let fnBuffer = (buffer) => {

                if (!buffer) {
                    console.error('error decoding file data: ' + _this.path)
                    return
                }
                
                _this.buffer = buffer
                if (_this.autoplay) _this.play()

            }
            
            _this.context.decodeAudioData(request.response, fnBuffer, fnError)
            
  		}

  		request.onerror = () => console.error('Audio Loader: XHR error')
        request.send()
          
	}
	
	set loop(value) {

		this._loop = value
        if (this.source != undefined) this.source.loop = value
        
	}
	
	play(volume) {

		if (volume) this.volume = volume

		if (this.buffer == null) return
        if (this.source != undefined) this.source.stop()
        
		this.source = this.context.createBufferSource()
		this.source.loop = this._loop
	  	this.source.buffer = this.buffer
	  	this.source.connect(this.gainNode)
        this.source.start(0)
        
	}
	
	set volume(value) {

		this._volume = value
        this.gainNode.gain.setTargetAtTime(value, this.context.currentTime + this.fadeDuration, 0)
        
	}
	
	pause() {

		if (this.source == undefined) return
        this.source.stop()
        
	}
	
	stop() {

        if (this.source == undefined) return
        
		this.source.stop()
        delete this.source
        
	}
}