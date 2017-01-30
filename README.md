# SoundFX

SoundFX is a sound effect manager with support for IE9+, Chrome, Firefox and Safari, which uses the HTML5 Web Audio API where available, and falls back to `<audio>` elements.

Forked from SoundEffectManager, but now includes support for:
- loading files by url
- loading files by data-uri
- any audio codec supported by your target browser(s)

## Installing

`npm install sound-fx`

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

#### `play (<string> name, <boolean> loop, <func> callback)`
- `<String> name` - Name of sound to play
- `<Boolean> loop` - Play the sound on a loop
- `<Function (err, data)> callback` - Callback once the sound has been played

#### `stop (<string> name)`
- `<String> name` - Name of sound to stop playing

#### `has (<string> name)`
- `<String> name` - Check if a sound has been loaded

#### `remove (<string> name)`
- `<String> name` - Name of sound to remove

## License

MIT

## Credits

Built (rather hastily) by [@HenrikJoreteg](http://twitter.com/henrikjoreteg) for use in [And Bang](http://andbang.com). Extended by [@munkyjunky](https://github.com/munkyjunky) for use at [Degree53](https://Degree53.com).
