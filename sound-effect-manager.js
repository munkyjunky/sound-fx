/*
 SoundEffectManager

 Loads and plays sound effects useing
 HTML5 Web Audio API (as only available in webkit, at the moment).

 By @HenrikJoreteg from &yet
 */

(function(factory) {

	var root = (typeof self == 'object' && self.self === self && self) ||
		(typeof global == 'object' && global.global === global && global);

	if (typeof module !== 'undefined' && typeof exports !== 'undefined') {
		module.exports = factory(root);
	} else {
		root.SoundEffectManager = factory(root);
	}

})(function (root) {

	function SoundEffectManager () {
		this.AudioContext = root.AudioContext || root.webkitAudioContext;

		this.support = !!this.AudioContext;
		if (this.support) {
			this.context = new this.AudioContext();
		}

		this.sounds = {};
		this.sources = {};
	}

	// async load a file at a given URL, store it as 'name'.
	SoundEffectManager.prototype.loadFile = function (url, name, delay, cb) {
		if (this.support) {
			this._loadWebAudioFile(url, name, delay, cb);
		} else {
			this._loadFallbackAudioFile(url, name, delay, 3, cb);
		}
	};

	// async load a file at a given URL, store it as 'name'.
	SoundEffectManager.prototype._loadWebAudioFile = function (url, name, delay, cb) {
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

	SoundEffectManager.prototype._loadFallbackAudioFile = function (url, name, delay, multiplexLimit, cb) {
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

	SoundEffectManager.prototype._playWebAudio = function (soundName, loop) {
		var self = this;
		var buffer = this.sounds[soundName];

		if (!buffer) {
			return;
		}

		if (loop && this.sources[soundName]) {
			// Only start the sound once if it's looping
			return;
		}

		function base64ToArrayBuffer(base64) {
			var binaryString = root.atob(base64);
			var len = binaryString.length;
			var bytes = new Uint8Array(len);
			for (var i = 0; i < len; i++)        {
				bytes[i] = binaryString.charCodeAt(i);
			}
			return bytes.buffer;
		}

		var source = self.context.createBufferSource();
		source.loop = loop;
		if (loop) {
			this.sources[soundName] = source;
		}

		// Base64 data string
		if (typeof buffer === 'string' && buffer.indexOf('data:audio') !== -1) {
			var newBuffer = buffer.replace(/^data:audio\/(?:\w+);base64,/, '');

			this.context.decodeAudioData(base64ToArrayBuffer(newBuffer), function(decodedData) {
				source.buffer = decodedData;
			});
		} else {
			source.buffer = buffer;
		}

		source.connect(self.context.destination);
		source.start(0);
	};

	SoundEffectManager.prototype._playFallbackAudio = function (soundName, loop) {
		var audio = this.sounds[soundName];
		var howMany = audio && audio.length || 0;
		var i = 0;
		var currSound;

		if (!audio) {
			return;
		}

		while (i < howMany) {
			currSound = audio[i++];
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

	SoundEffectManager.prototype.play = function (soundName, loop) {
		if (this.support) {
			this._playWebAudio(soundName, loop);
		} else {
			return this._playFallbackAudio(soundName, loop);
		}
	};

	SoundEffectManager.prototype.stop = function (soundName) {
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

	return SoundEffectManager;

});