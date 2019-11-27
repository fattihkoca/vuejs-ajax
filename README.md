![vuejs-ajax](https://user-images.githubusercontent.com/1655312/41012120-c9f6f6de-6948-11e8-8afa-582e33c2eb54.png)

[![Travis Build](https://img.shields.io/travis/fattihkoca/vuejs-ajax.svg)](https://travis-ci.org/fattihkoca/vuejs-ajax)
[![Version](https://img.shields.io/npm/v/vuejs-ajax.svg)](https://www.npmjs.com/package/vuejs-ajax)
[![Downloads](https://img.shields.io/npm/dm/vuejs-ajax.svg)](https://www.npmjs.com/package/vuejs-ajax)

It is a XHR plugin that works in specific features for Vue.js 2.x and and above versions. It has many similar features with `jQuery`'s `ajax()` and `Angular`'s `$http()`.

It allows you to write more tidy code by solving many of the most common features used by developers in the core. **Here are a few examples**:

#### Prevent Duplicate Requests
One of the most common problems is the problem of sending dublicate requests at the same time. Vue.js Ajax solve it easily. You can find more information [here](https://github.com/fattihkoca/vuejs-ajax/wiki/Prevent-Duplicate-Requests).

#### File Uploading
File uploading with `Ajax` (`XMLHttpRequest`) can sometimes require you to write extra code. But it's very simple to do it with `Vue.js Ajax`. You can find more information [here](https://github.com/fattihkoca/vuejs-ajax/wiki/File-Uploading).

#### History
History feature to create a faster browsing experience. This means less elements to load and therefore faster browsing. But it's very simple to do it with `Vue.js Ajax`. There is a detailed explanation to [here](https://github.com/fattihkoca/vuejs-ajax/wiki/History).

#### CSRF
This setting provides protection against CSRF attacks. You can find more information [here](https://github.com/fattihkoca/vuejs-ajax/wiki/CSRF).

#### Component Shifter
There is also `Component Shifter` which solves a different task. With componentShifter() you can load (with `Vue.ajax`) and render your `Vue template` (html) in your application by dynamic & async `Vue.component()`. You can also add components and run them nested. You can find more information [here](https://github.com/fattihkoca/vuejs-ajax/wiki/Component-Shifter).

***

# Setup

```npm
npm install vuejs-ajax --save
```

# Usage

```javascript
// ES6
import ajax from "vuejs-ajax"
Vue.use(ajax)

// ES5
var ajax = require("vuejs-ajax")
Vue.use(ajax)
```

***

# Getting Started
The general shorthand version is as follows:

```javascript
Vue.ajax.get(string url[, object data] [,object configurations])
    .then(function success[, function error])
```

## Arguments

| Property         | Required | Type             | Description                                                   |
| ---------------- | -------- | ---------------- | ------------------------------------------------------------- |
| url              | Yes      | String           | A string containing the URL to which the request is sent.     |
| data             | No       | Object           | A plain object that is sent to the server with the request.   |
| configurations   | No       | Object           | A set of key/value pairs that configure the Vue.ajax request. |

All of the above methods are a shorthand method of the `Vue.ajax()`: 

```javascript
Vue.ajax({
    url: "http://example.com",
    method: "get" // post, put, patch, delete, head, jsonp
}).then(function(response) {
    console.log("Success", response.data)
}, function(response) {
    console.log("Error", response.statusText)
})
```

You can find detailed information about the `Methods` [here](https://github.com/fattihkoca/vuejs-ajax/wiki/Methods).

## Configurations

| Configuration                                 | Type             | Default | Available                                  |
| --------------------------------------------- | ---------------- | ------- | ------------------------------------------ |
| [`assets`](https://github.com/fattihkoca/vuejs-ajax/wiki/Assets)                          | String Or Object | -       | -                                          |
| [`async`](https://github.com/fattihkoca/vuejs-ajax/wiki/Asynchronous)                            | Boolean          | true    | true, false                                |
| [`cache`](https://github.com/fattihkoca/vuejs-ajax/wiki/Cache)                            | Boolean          | false   | true, false                                |
| [`complete`](https://github.com/fattihkoca/vuejs-ajax/wiki/Complete)                      | Function         | -       | -                                          |
| [`csrf`](https://github.com/fattihkoca/vuejs-ajax/wiki/CSRF)                              | Boolean          | true    | true, false                                |
| [`data`](https://github.com/fattihkoca/vuejs-ajax/wiki/Sending-With-Data)                              | Object           | -       | -                                          |
| [`fileInputs`](https://github.com/fattihkoca/vuejs-ajax/wiki/File-Uploading)              | Element Object   | -       | Input file upload objects                  |
| [`hardReloadOnError`](https://github.com/fattihkoca/vuejs-ajax/wiki/Hard-Reload) | Boolean          | false   | true, false                                |
| [`history`](https://github.com/fattihkoca/vuejs-ajax/wiki/History)                        | Boolean          | false   | true, false                                |
| [`headers`](https://github.com/fattihkoca/vuejs-ajax/wiki/HTTP-Headers)                        | Object           | -       | -                                          |
| [`method`](https://github.com/fattihkoca/vuejs-ajax/wiki/Methods)                          | String           | get     | delete, get, head, jsonp, patch, post, put |
| [`preventDuplicate`](https://github.com/fattihkoca/vuejs-ajax/wiki/Prevent-Duplicate-Requests)     | Boolean          | true    | true, false                                |
| [`scrollTop`](https://github.com/fattihkoca/vuejs-ajax/wiki/Scroll-Top)                   | Boolean          | false   | true, false                                |
| [`timeout`](https://github.com/fattihkoca/vuejs-ajax/wiki/Timeout)                        | Integer          | 60000   | Time in milliseconds                       |
| [`title`](https://github.com/fattihkoca/vuejs-ajax/wiki/Title)                            | String           | -       | -                                          |
| [`url`](https://github.com/fattihkoca/vuejs-ajax/wiki/Methods)                             | String           | -       | -                                          |
| [`urlData`](https://github.com/fattihkoca/vuejs-ajax/wiki/Query-String)                       | Object           | -       | -                                          |
| [`withCredentials`](https://github.com/fattihkoca/vuejs-ajax/wiki/With-Credentials)       | Boolean          | false   | true, false                                |

***

# License
[MIT](https://github.com/fattihkoca/vuejs-ajax/blob/master/LICENSE)

Copyright (c) 2019 [Fatih Koca](http://fattih.com)