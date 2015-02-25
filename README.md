# mac

> "Never break the chain." - Fleetwood Mac

A tiny library designed to parallel or series chain streams, promises or functions with callbacks.

## Installing

```
npm install mac
```

## Including

```
var mac = require('mac');
```

## Usage

Mac is designed to work with any combination of streams, promises or functions that define a single argument and will ensrue that they are called in parallel or series. Since Mac returns promises, you can pass it into itself.

### Streams

Working with streams allows it to work with a multitude of libraries, most notably of these is probably Gulp, but it can be used with any sort of stream.

The following would ensure that your JS is transpiled from ES6 to ES5 and when that is finished it would then minify the `dist`.

```js
var js = mac.series(
  gulp.src('src/*.js').pipe(gulpBabelify).dest('dist'),
  gulp.src('dist/*.js').pipe(gulpUglify).dest('dist')
);
```

If you want to run some tasks in paralell you can do that too. For example, if you wanted to take your JavaScript task and run it in parallel with your Less task, go for it:

```js
var dist = mac.parallel(
  js,
  gulp.src('src/*.less').pipe(gulpLess).dest('dist')
);
```

Gulp is probably the shining example of this as most people will know it, but it can work with any stream that emits the `finish` event.

### Promises

If you wanted to run two `fetch` (returns a promise, see: https://github.com/github/fetch) requests ensuring the first one is called before the second one:

```js
mac.series(
  fetch('some/endpoint'),
  fetch('something/else')
);
```

### Functions

If you wanted to execute a series of functions ensuring one finishes before the other, you should define a single argument. This argument is a callback that you call in order to say that you're done doing whatever you're doing. Once called, it will proceed to the next.

```js
mac.series(
  function (done) {
	setTimeout(done, 100);
  },

  function (done) {
	updateSomething();
	done();
  }
);
```

If your task doesn't need to report back, then you don't have to define a callback and call it and it will be called and passed through.

```js
mac.series(
  function (done) {
	setTimeout(done, 100);
  },

  function () {
	updateSomething();
  }
);
```
```
