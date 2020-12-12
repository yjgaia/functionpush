# functionpush
Just functions. functions are everything.

functionpush is a framework that allows functions to be automatically reflected in the application when they are modified.

---
I am tired of web development. Complex configuration, incidental compilation, all sorts of techniques...

I love JavaScript and functional programming. So I make this web framework that works with just functions.

I hope it makes web development easier...

## functionpush's disadvantages
- You can only make your application SPA. In other words, search engines will not work.
- functionpush does not use the standard modular approach(CommonJS, AMD). Existing Node.js modules must be installed and used first.

## Installing
```
yarn add functionpush
```

## Usage
```
require('functionpush')({
	port : 8212
});
```

## Setting Options
* `httpPort`
* `httpsPort`
* `sslKeyFilePath`
* `sslCertFilePath`

## Roadmap

## License
[MIT](LICENSE)

## Author
[Young Jae Sim](https://github.com/Hanul)

By the way, I can't speak English very well. Thanks for Google Translator!