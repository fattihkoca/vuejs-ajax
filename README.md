![vuejs-ajax](https://user-images.githubusercontent.com/1655312/41012120-c9f6f6de-6948-11e8-8afa-582e33c2eb54.png)

[![Travis Build](https://img.shields.io/travis/fattihkoca/vuejs-ajax.svg)](https://travis-ci.org/fattihkoca/vuejs-ajax)
[![Version](https://img.shields.io/npm/v/vuejs-ajax.svg)](https://www.npmjs.com/package/vuejs-ajax)
[![Downloads](https://img.shields.io/npm/dm/vuejs-ajax.svg)](https://www.npmjs.com/package/vuejs-ajax)

A light XHR plugin for Vue 2.x and and above versions. It has many similar features with `jQuery`'s `ajax()` and `Angular`'s `$http()`. In addition to these, it also has its own important features: 
* [`Assets`](#assets)
* [`Component shifter`](#component-shifter)
* [`Event Handlers`](#event-handlers)
* [`File uploading`](#file-uploading)
* [`History`](#history)
* [`Title`](#title)
* [`Serialized query string`](#urlData)
* [`Prevent duplicate requests`](#preventDuplicate)

# Setup

```
npm install vuejs-ajax --save
```

You have two ways to setup `vuejs-ajax`:

#### CommonJS (Webpack/Browserify)

- ES6

```
import ajax from 'vuejs-ajax'
Vue.use(ajax)
```

- ES5

```
var ajax = require('vuejs-ajax')
Vue.use(ajax)
```

# Example
```javascript
Vue.ajax.get('http://example.com').then(function(response) {
    console.log('Success', response.data)
}, function(response) {
    console.log('Error', response.statusText)
})
```

If you want to send data to the backend:

```javascript
Vue.ajax.get('http://example.com', {
    param1: 'First parameter',
    param2: 'Second parameter'
}).then(function(response) {
    console.log('Success', response.data)
}, function() {
    console.log('Error', response.statusText)
})
```

# Methods & Requests

### Get Method
```
Vue.ajax.get(string url[, object data] [,object configurations])
    .then(function success[, function error])
```

#### Post Method
```
Vue.ajax.post(string url[, object data] [,object configurations])
    .then(function success[, function error])
```

## Arguments

| Property         | Type             | Description                                                   |
| ---------------- | ---------------- | ------------------------------------------------------------- |
| url              | String           | A string containing the URL to which the request is sent.     |
| data             | Object           | A plain object that is sent to the server with the request.   |
| configurations   | Object           | A set of key/value pairs that configure the Vue.ajax request. |

**Other methods and requests are the same:**

#### Delete Method
```
Vue.ajax.delete(string url[, object data] [,object configurations])
    .then(function success[, function error])
```

#### Head Method
```
Vue.ajax.head(string url[, object data] [,object configurations])
    .then(function success[, function error])
```

#### Jsonp Request
```
Vue.ajax.jsonp(string url[, object data] [,object configurations])
    .then(function success[, function error])
```

#### Patch Method
```
Vue.ajax.patch(string url[, object data] [,object configurations])
    .then(function success[, function error])
```

#### Put Method
```
Vue.ajax.put(string url[, object data] [,object configurations])
    .then(function success[, function error])
```

All of the above methods are a shorthand method of the `Vue.ajax()`:

```javascript
Vue.ajax({
    url: 'http://example.com',
    method: 'get' // post, put, patch, delete, head, jsonp
}).then(function(response) {
    console.log('Success', response.data)
}, function() {
    console.log('Error', response.statusText)
})
```

# <a name="component-shifter"></a> Component Shifter
With componentShifter() you can load (with `Vue.ajax`) and render your `Vue template` (html) in your application by dynamic & async `Vue.component()`. You can also add components and run them nested.

It also supports `Vue.ajax`'s `history` feature. And the component is automatically update when navigating to the previous - next page.

```
vm.componentShifter(object configurations[, function success] [,function error])
```

## Settings

| Property | Required | Value    | Description                      |
| -------- | -------- | -------- | -------------------------------- |
| is       | Yes      | String   | Unique dynamic component name.   |
| url      | Yes      | String   | Component resources url.         |
| success  | No       | Function | Your custom callback on success. |
| error    | No       | Function | Your custom callback on error.   |

**Example**

_index.html_
```html
<div id="app">
    <a href="/page" @click.prevent="openPage('/page', 'New page')">Link</a>

    <!-- Your container component -->
    <component :is="myPage"></component>
</div>
```

_app.js_
```javascript
var vm = new Vue({
    el: '#classest',
    data() {
        return {
            myPage: null, // Component name
            pageLoaded: false
        }
    },
    methods: {
        openPage(url, title) {
            // Calling componentShifter
            this.componentShifter({
                is: 'myPage', // [String] Component name
                url: url,
                title: title,
                history: true,
            }, function (response) {
                console.log("Component changed!");
                pageLoaded = true;
            }, function (response) {
                console.log("Component could not be changed!", response);
                pageLoaded = false;
            });
        }
    },
    created() {
        if(!pageLoaded) {
            this.openPage('/page', 'New page')
        }
    }
});
```

# <a name="configurations"></a> Vue Ajax Configurations

| Configuration                             | Type             | Default | Available                                  |
| ----------------------------------------- | ---------------- | ------- | ------------------------------------------ |
| [`assets`](#assets)                       | String \| Object | -       | -                                          |
| [`async`](#async)                         | Boolean          | true    | true, false                                |
| [`cache`](#cache)                         | Boolean          | false   | true, false                                |
| [`complete`](#complete)                   | Function         | -       | -                                          |
| [`csrf`](#csrf)                           | Boolean          | true    | true, false                                |
| [`data`](#data)                           | Object           | -       | -                                          |
| [`fileInputs`](#file-uploading)           | Element Object   | -       | Input file upload objects                  |
| [`hardReloadOnError`](#hardReloadOnError) | Boolean          | false   | true, false                                |
| [`history`](#history)                     | Boolean          | false   | true, false                                |
| [`headers`](#headers)                     | Object           | -       | -                                          |
| [`method`](#method)                       | String           | get     | delete, get, head, jsonp, patch, post, put |
| [`preventDuplicate`](#preventDuplicate)   | Boolean          | true    | true, false                                |
| [`scrollTop`](#scrollTop)                 | Boolean          | false   | true, false                                |
| [`timeout`](#timeout)                     | Integer          | 60000   | Time in milliseconds                       |
| [`title`](#title)                         | String           | -       | -                                          |
| [`url`](#method)                          | String           | -       | -                                          |
| [`urlData`](#urlData)                     | Object           | -       | -                                          |
| [`withCredentials`](#withCredentials)     | Boolean          | false   | true, false                                |

# <a name="examples"></a> Vue Ajax Configuration Examples

## <a name="assets"></a> Assets
Assets setting is used to push new asset files (CSS or JS) in the document.

### Pushing single asset file
```javascript
Vue.ajax.get('http://example.com', [data], {
    assets: 'path/css/style.css'
});
```

### Pushing multiple asset files
```javascript
Vue.ajax.get('http://example.com', [data], {
    assets: ['assets/css/style.css', 'assets/js/script.js']
});
```

## <a name="async"></a> Asynchronous
By default, all requests are sent asynchronously (i.e. this is set to true by default). If you need synchronous requests, set this option to `false`. Default value is `true`.
```javascript
Vue.ajax.get('http://example.com', [data], {
    async: true
});
```

## <a name="cache"></a> Cache
Default value is `false`.
```javascript
Vue.ajax.get('http://example.com', [data], {
    cache: false
});
```

## <a name="complete"></a> Complete Event
A function to be called when the request finishes (Success or error).

```javascript
Vue.ajax.get('http://example.com', [data], {
    complete: function(response) {
        console.log(response.status)
    }
});
```

## <a name="csrf"></a> CSRF
Default value is `true`.
```javascript
Vue.ajax.get('http://example.com', [data], {
    csrf: true
});
```

In the html head tag it must be `csrf-token meta`. Like this:

```html
<meta name="csrf-token" content="ABCDEFGHIJKLMN">
```

## <a name="data"></a> Data
Data to be sent to the server.

```javascript
Vue.ajax('http://example.com', {
    url: 'http://example.com',
    method: 'get',
    data: {
        param1: 'First parameter',
        param2: 'Second parameter'
    }
});
```


## <a name="file-uploading"></a> File Uploading
`fileInputs` setting should be `DOM object`. We recommend using the `post` method when uploading files. The important thing here is that you should not forget the `name` attribute.

HTML:
```html
<input type="file" name="my-input" id="my-input">
```

Javascript:
```javascript
Vue.ajax.post('http://example.com', [data], {
    fileInputs: [
        document.getElementById('my-input')
    ]
});
```

You can only add the `accept` attribute to send images.
```html
<input type="file" name="my-input-2" id="my-input-2" accept="image/*">
```

You can add the `multiple` attribute to send multiple files with an input element:
```html
<input type="file" name="my-input-3" id="my-input-3" multiple>
```

## <a name="hardReloadOnError"></a> Hard Reload On Error
Option to hard reloading when page can not be loaded. Default value is `false`.

```javascript
Vue.ajax.get('http://example.com', [data], {
    hardReloadOnError: true
});
```

## <a name="history"></a> History
History setting is usage of PushState (HTML history API). Default value is `false`.

PushState (changing the URL of the page without refreshing the page) to create a faster browsing experience.  This means less elements to load and therefore faster browsing.

```javascript
Vue.ajax.get('http://example.com', [data], {
    history: true
});
```

**Adding version for history**  
Layouts can be forced to do a hard reload when assets or html changes. 
First set the initial layout version in your header with a custom `meta` tag.

HTML:
```html
<meta http-equiv="x-history-version" content="ABCDEFGH">
```

## <a name="headers"></a> HTTP Headers
```javascript
Vue.ajax.get('http://example.com', [data], {
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/plain, */*'
    }
});
```

## <a name="method"></a> Method
Default value is `get`.
```javascript
Vue.ajax({
    url: 'http://example.com',
    method: 'post'
});
```

Instead, you might prefer to use the following shorthand:
```javascript
Vue.ajax.post('http://example.com', [data]);
```

## <a name="preventDuplicate"></a> Prevent Duplicate Requests
This setting prevents sending duplicate requests to the same address or given key data. Default value is `true`.  
The following example prevents sending requests over the same URL:
```javascript
Vue.ajax.get('http://example.com', [data], {
    preventDuplicate: true
});
```

The following example prevents sending requests over the same given key data:
```javascript
Vue.ajax.get('http://example.com', [data], {
    preventDuplicate: true,
    key: 'ABCDEFGH'
});
```

### <a name="scrollTop"></a> Scroll Top
This setting is used to scroll to top of the document when loading the request. Default value is `true`.
```javascript
Vue.ajax.get('http://example.com', [data], {
    scrollTop: true
});
```

## <a name="timeout"></a> Timeout
Set a timeout (in milliseconds) for the request. Default value is `60000`.

```javascript
Vue.ajax.get('http://example.com', [data], {
    timeout: 60000
});
```

## <a name="title"></a> Title
Title setting is used to change the document title value.
```javascript
Vue.ajax.get('http://example.com', [data], {
    title: 'New title'
});
```


## <a name="urlData"></a> URL Data
With this setting, you can add serialized query string to the URL you are sending.
```javascript
Vue.ajax.get('http://example.com', [data], {
    urlData: [
        {page: 15},
        {category: 'Accessories'}
    ]
});
```

The URL will be like this when sending the request:  
`http://example.com?page=15&category=Accessories`

## <a name="withCredentials"></a> With Credentials
There is a detailed explanation [here](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/withCredentials). Default value is `false`.
```
Vue.ajax.get('http://example.com', data {
    withCredentials: false
});
```

# Response Handling
The response returns the Object on the frontend. 

_Success and error together in `then()` method:_
```
Vue.ajax(object configurations)
    .then(function success[, function error])
```

_Success and error together in in separate methods:_
```
Vue.ajax(object configurations)
    .then(function success)
    .catch(function error)
```

The object in general is the following structure:

```javascript
Vue.ajax.get('http://example.com', [data])
    .then(function(response) {
        console.log(response.data)
    });
```

| Response Property | Value Type      |
| ----------------- | --------------- |
| data              | Object\|String  |
| status            | String          |
| statusText        | String          |
| headers           | String          |
| config            | Object          |
| xhrStatus         | String          |
| request           | Object          |

## Response Format

If the content type on the server is "`application/json`", the `response.data` is automatically converted to a `JSON object`. If the content type is anything else, the result is returned as `plain text`.

PHP:
```php
header('Content-type: application/json; charset=utf-8');
echo json_encode($array);
```

Laravel:
```php
Route::get('http://example.com', function () {
    return response(json_encode($array), 200)
        ->header('Content-Type', 'application/json; charset=utf-8');
});
```

VueJS
```javascript
Vue.ajax.get('http://example.com', [data])
    .then(function(response) {
        console.log(response.data)
    });
```

## Error Handling

In `then()` method
```javascript
Vue.ajax.get('http://example.com/not-existing-path', [data])
    .then(function(response) {
        console.log(response.data)
    }, function(response) {
        console.log('Error: ', response.statusText);
    }); // "Error: Not Found"
```

In `catch()` method
```javascript
Vue.ajax.get('http://example.com/not-existing-path', [data])
    .then(function(response) {
        console.log(response.data)
    }).catch(function(response) {
        console.log('Error: ', response.statusText);
    }); // "Error: Not Found"
```

# <a name="event-handlers"></a> Event Handlers

## Common Events

### vueajaxabort
Register a handler to be called when `Vue.ajax` requests abort.
```javascript
window.addEventListener('vueajaxabort', function(e) {
    console.log(e);
});
```

### vueajaxcomplete
Register a handler to be called when `Vue.ajax` requests complete.
```javascript
window.addEventListener('vueajaxsuccess', function(e) {
    console.log(e);
});
```

### vueajaxerror
Register a handler to be called when `Vue.ajax` requests complete with an error.
```javascript
window.addEventListener('vueajaxerror', function(e) {
    console.log(e);
});
```

### vueajaxstart
Register a handler to be called when `Vue.ajax` requests begins.
```javascript
window.addEventListener('vueajaxstart', function(e) {
    console.log(e);
});
```

### vueajaxsuccess
Attach a function to be executed whenever an `Vue.ajax` request completes successfully.
```javascript
window.addEventListener('vueajaxsuccess', function(e) {
    console.log(e);
});
```

## History Events

### vueajaxhistorycomplete
Register a handler to be called when `Vue.ajax history` requests complete.
```javascript
window.addEventListener('vueajaxhistorycomplete', function(e) {
    console.log(e);
});
```

### vueajaxhistoryerror
Register a handler to be called when `Vue.ajax history` requests complete with an error.
```javascript
window.addEventListener('vueajaxhistoryerror', function(e) {
    console.log(e);
});
```

### vueajaxhistorystart
Register a handler to be called when `Vue.ajax history` requests begins.
```javascript
window.addEventListener('vueajaxhistorystart', function(e) {
    console.log(e);
});
```

### vueajaxhistorysuccess
Attach a function to be executed whenever an `Vue.ajax history` request completes successfully.
```javascript
window.addEventListener('vueajaxhistorysuccess', function(e) {
    console.log(e);
});
```
## Component Shifter Events

### componentshiftercomplete
Register a handler to be called when `Component Shifter` requests complete.
```javascript
window.addEventListener('vueajaxhistorycomplete', function(e) {
    console.log(e);
});
```

### componentshiftererror
Register a handler to be called when `Component Shifter` requests complete with an error.
```javascript
window.addEventListener('componentshiftererror', function(e) {
    console.log(e);
});
```

### componentshifterstart
Register a handler to be called when `Component Shifter` requests begins.
```javascript
window.addEventListener('componentshifterstart', function(e) {
    console.log(e);
});
```

### componentshiftersuccess
Attach a function to be executed whenever an `Component Shifter` request completes successfully.
```javascript
window.addEventListener('componentshiftersuccess', function(e) {
    console.log(e);
});
```

# License
[MIT](LICENSE)

Copyright (c) 2018 [Fatih Koca](http://fattih.com)
