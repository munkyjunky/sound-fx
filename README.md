# SoundFX
[![NPM version][npm-image]][npm-url]

SoundFX is a sound effect manager with support for Chrome, Firefox, Safari, Edge & IE9+, using the HTML5 Web Audio API where available, and falls back to `<audio>` elements.

## Using it

```js
// Create an instance of SoundFX
var SoundFX = require('sound-fx');
var sfx = new SoundFX();

// load some files by passing it a url and a name
sfx.load('taps.mp3', 'taps');
sfx.load('rocket.wav', 'rocket');

// then play the sounds like so:
sfx.play('rocket');

// or play a sound in looping mode:
sfx.play('taps', true);

// and to stop a loop:
sfx.stop('taps');

// that's it!
```

## API

#### `load (url, name, delay, callback)`
- `<String> url` - URI or data-encoded string of audio file to load
- `<String> name` - Name to save sound against
- `<Number> delay` - Delay before loading the file (ms)
- `<Function (err, data)> callback` - Callback once the file has been loaded

#### `play (name, loop, callback)`
- `<String> name` - Name of sound to play
- `<Boolean> loop` - Play the sound on a loop
- `<Function (err, data)> callback` - Callback once the sound has been played

#### `stop (name)`
- `<String> name` - Name of sound to stop playing

#### `has (name)`
- `<String> name` - Check if a sound has been loaded

#### `remove (name)`
- `<String> name` - Name of sound to remove

## License

MIT

## Credits
Originally built by [@HenrikJoreteg](http://twitter.com/henrikjoreteg) as [SoundEffectManager][SoundEffectManager]. Extended by [@munkyjunky](https://github.com/munkyjunky)

[SoundEffectManager]: https://github.com/henrikjoreteg/soundeffectmanager
[npm-image]: https://badge.fury.io/js/sound-fx.svg
[npm-url]: https://npmjs.org/package/sound-fx
