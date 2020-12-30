# functionpush
*Just functions. functions are everything.*

functionpush is a framework that allows functions to be automatically reflected in the application when they are modified.

## functionpush's advantages
- You can write a continuous service. (No Downtime, Hot Swapping Code)
- Since it forces functional programming, there are no memory issues.

## functionpush's disadvantages
- You can only make your application SPA. In other words, search engines will not work.
- functionpush does not use the standard modular approach(CommonJS, AMD). Existing Node.js modules must be installed and used first.
- All functions are called with the same name as the file name.
- Due to functionpush's unique modular system, Typescript is not available. (JavaScript Forever!)

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