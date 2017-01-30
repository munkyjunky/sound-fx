/**
 * Loads and plays sound effects using HTML5 Web Audio API where available,
 * falling back to using audio elements where not available.
 *
 * Supports loading sounds by URL, or data URI.
 *
 * @module SoundFX
 * @author @munkyjunky
 */
(function(factory) {

	var root = (typeof self == 'object' && self.self === self && self) ||
		(typeof global == 'object' && global.global === global && global);

	if (typeof module !== 'undefined' && typeof exports !== 'undefined') {
		module.exports = factory(root);
	} else {
		root.SoundFX = factory(root);
	}

})(function (root) {

	function SoundFX () {
		this.AudioContext = root.AudioContext || root.webkitAudioContext;

		this.support = !!this.AudioContext;
		if (this.support) {
			this.context = new this.AudioContext();
		}

		this.sounds = {};
		this.sources = {};
	}

	/* Converts base64 audio to buffer */
	SoundFX.prototype._base64ToArrayBuffer = function (base64) {
		var binaryString = root.atob(base64);
		var len = binaryString.length;
		var bytes = new Uint8Array(len);
		for (var i = 0; i < len; i++)        {
			bytes[i] = binaryString.charCodeAt(i);
		}
		return bytes.buffer;
	};

	/* async load a file at a given URL, or decrypt a data encoded string, and store it as 'name' */
	SoundFX.prototype._loadWebAudioFile = function (url, name, delay, cb) {
		if (!this.support) {
			return;
		}

		var self = this;

		if (url.indexOf('data') !== -1 && typeof atob === 'function') {
			self.sounds[name] = url;
			return typeof cb === 'function' ? cb(url) : null;
		}

		var request = new XMLHttpRequest();
		request.open('GET', url, true);
		request.responseType = 'arraybuffer';
		request.onload = function () {
			self.context.decodeAudioData(request.response,
				function (data) { // Success
					self.sounds[name] = data;
					if (cb) {
						cb(null, data);
					}
				},
				function (err) { // Error
					if (cb) {
						cb(err);
					}
				}
			);
		};

		setTimeout(function () {
			request.send();
		}, delay || 0);
	};

	/* Create an audio element and set the src to the passed url */
	SoundFX.prototype._loadFallbackAudioFile = function (url, name, delay, multiplexLimit, cb) {
		var self = this;
		var limit = multiplexLimit || 3;

		setTimeout(function () {
			var a, i = 0;

			self.sounds[name] = [];
			while (i < limit) {
				a = new Audio();
				a.src = url;
				// for our callback
				if (i === 0 && cb) {

					a.addEventListener('canplaythrough', function () {
						cb(null, a);
					}, false);

					a.addEventListener('error', function (e) {

						var err;

						switch (e.target.error.code) {
							case e.target.error.MEDIA_ERR_SRC_NOT_SUPPORTED:
								err = new Error('MEDIA_ERR_SRC_NOT_SUPPORTED');
								break;
							case e.target.error.MEDIA_ERR_ABORTED:
								err = new Error('MEDIA_ERR_ABORTED');
								break;
							case e.target.error.MEDIA_ERR_DECODE:
								err = new Error('MEDIA_ERR_DECODE');
								break;
							case e.target.error.MEDIA_ERR_NETWORK:
								err = new Error('MEDIA_ERR_NETWORK');
								break;
							default:
								err = new Error();
								break;
						}

						cb(err);
					}, false);

				}
				a.load();
				self.sounds[name][i++] = a;
			}
		}, delay || 0);
	};

	/* Play a loaded sound through AudioContext */
	SoundFX.prototype._playWebAudio = function (soundName, loop, cb) {
		var self = this;
		var buffer = this.sounds[soundName];

		if (!buffer) {
			return;
		}

		if (loop && this.sources[soundName]) {
			// Only start the sound once if it's looping
			return;
		}

		var source = self.context.createBufferSource();
		source.loop = loop;
		if (loop) {
			this.sources[soundName] = source;
		}

		// Base64 data string
		if (typeof buffer === 'string' && buffer.indexOf('data:audio') !== -1) {
			var newBuffer = buffer.replace(/^data:audio\/(?:[\-\w]+);(?:[\w\-=]+;)?base64,/, '');

			this.context.decodeAudioData(this._base64ToArrayBuffer(newBuffer), function(decodedData) {
				source.buffer = decodedData;
			});
		} else {
			source.buffer = buffer;
		}

		if (cb) {
			source.onended = cb;
		}

		source.connect(self.context.destination);
		'noteOn' in source ? source.noteOn(0) : source.start(0);
	};

	/* Play a loaded sound through an Audio element */
	SoundFX.prototype._playFallbackAudio = function (soundName, loop, cb) {
		var audio = this.sounds[soundName];
		var howMany = audio && audio.length || 0;
		var i = 0;
		var currSound;

		if (!audio) {
			return;
		}

		while (i < howMany) {
			currSound = audio[i++];

			if (cb) {
				currSound.addEventListener('ended', function () {
					cb();
				});
			}

			// this covers case where we loaded an unplayable file type
			if (currSound.error) {
				return;
			}
			if (currSound.currentTime === 0 || currSound.currentTime === currSound.duration) {
				currSound.currentTime = 0;
				currSound.loop = !!loop;
				i = howMany;
				return currSound.play();
			}
		}
	};

	/**
	 * Load the given URL asynchronously, and store it as 'name'
	 * @param {string} url - URL (or data URI) to load
	 * @param {String} name - Name to store the sound under
	 * @param {number} delay - Delay before attempting to load the file
	 * @param {function} cb - Callback once sound is loaded
	 */
	SoundFX.prototype.load = function (url, name, delay, cb) {
		if (this.support) {
			this._loadWebAudioFile(url, name, delay, cb);
		} else {
			this._loadFallbackAudioFile(url, name, delay, 3, cb);
		}
	};

	/**
	 * Play a sound that has previously been loaded
	 * @param {string} soundName - Name of sound to play
	 * @param {boolean} loop - Play sound on a loop
	 * @param {function} cb - Callback when the sound has ended
	 */
	SoundFX.prototype.play = function (soundName, loop, cb) {
		if (this.support) {
			this._playWebAudio(soundName, loop, cb);
		} else {
			return this._playFallbackAudio(soundName, loop, cb);
		}
	};

	/**
	 * Stop a playing sound
	 * @param {string} soundName - Name of sound to stop
	 */
	SoundFX.prototype.stop = function (soundName) {
		if (this.support) {
			if (this.sources[soundName]) {
				this.sources[soundName].stop(0);
				delete this.sources[soundName];
			}
		} else {
			var soundArray = this.sounds[soundName];
			var howMany = soundArray && soundArray.length || 0;
			var i = 0;
			var currSound;

			while (i < howMany) {
				currSound = soundArray[i++];
				currSound.pause();
				currSound.currentTime = 0;
			}
		}
	};

	/**
	 * Check if a sound has been added
	 * @param {string} soundName - Name of sound to check
	 * @returns {boolean}
	 */
	SoundFX.prototype.has = function (soundName) {
		return this.sounds.hasOwnProperty(soundName);
	};

	/**
	 * Remove a sound from memory
	 * @param {string} soundName - Name of sound to remove
	 */
	SoundFX.prototype.remove = function (soundName) {
		this.stop(soundName);
		delete this.sounds[soundName];
	};

	return SoundFX;

});
