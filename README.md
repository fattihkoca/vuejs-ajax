# Vue.ajax

A light XHR plugin for Vue 2.x. It has many similar features with `jQuery`'s `ajax()` and `Angular`'s `http`(). In addition to these, it also has its own practical features. For example, `file upload`, `pjax`, and `preventing dublicate request` features.

## Setup

```
npm install vue-ajax-plugin --save
```

You have two ways to setup `vue-ajax-plugin`:

#### CommonJS (Webpack/Browserify)

- ES6

```js
import ajax from 'vue-ajax-plugin'
Vue.use(ajax)
```

- ES5

```js
var ajax = require('vue-ajax-plugin')
Vue.use(ajax)
```

## Example
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

## Methods & Requests

### Get Method
```javascript
Vue.ajax.get(string url[, object data] [,object configurations])
    .then(function success[, function error])
```

### Arguments

**`url:`** _string_   
A string containing the URL to which the request is sent.

**`data:`** _object|null_  
A plain object that is sent to the server with the request.  

**`configurations:`** _object|null_  
A set of key/value pairs that configure the Vue.ajax request.

**Other methods and requests are the same:**

##### Post Method
```javascript
Vue.ajax.post(string url[, object data] [,object configurations])
    .then(function success[, function error])
```

##### Delete Method
```javascript
Vue.ajax.delete(string url[, object data] [,object configurations])
    .then(function success[, function error])
```

##### Head Method
```javascript
Vue.ajax.head(string url[, object data] [,object configurations])
    .then(function success[, function error])
```

##### Jsonp Request
```javascript
Vue.ajax.jsonp(string url[, object data] [,object configurations])
    .then(function success[, function error])
```

##### Patch Method
```javascript
Vue.ajax.patch(string url[, object data] [,object configurations])
    .then(function success[, function error])
```

##### Put Method
```javascript
Vue.ajax.put(string url[, object data] [,object configurations])
    .then(function success[, function error])
```

##### Pjax Request [(Look at for details)](#pjax)
```javascript
Vue.ajax.pjax(string url[, object data] [,object configurations])
    .then(function success[, function error])
```

All of the above methods are a shortcut method of the `Vue.ajax()`:

```javascript
Vue.ajax({
    url: 'http://example.com',
    method: 'get' // post, jsonp, etc
}).then(function(response) {
    console.log('Success', response.data)
}, function() {
    console.log('Error', response.statusText)
})
```

**Response Handling:**

_Success and error together in `then()` method:_
```javascript
Vue.ajax(object configurations)
    .then(function success[, function error])
```

_Success and error together in in separate methods:_
```javascript
Vue.ajax(object configurations)
    .then(function success)
    .catch(function error)
```

## Configurations

### Asynchronous
Asynchronous setting should be a `boolean`. Default is `true`.
```javascript
Vue.ajax.get('http://example.com', [data], {
    async: true
});
```

### Cache
Cache setting should be a `boolean`. Default value is `false`.
```javascript
Vue.ajax.get('http://example.com', [data], {
    cache: false
});
```

### Complete Event
Complete event setting should be a `function`.

```javascript
Vue.ajax.get('http://example.com', [data], {
    complete: function(response) {
        console.log(response.status)
    }
});
```

### CSRF
CSRF setting should be a `boolean`. Default value is `true`. However, in the html head tag it must be `csrf-token meta`. Like this:

```html
<meta name="csrf-token" content="ABCDEFGHIJKLMN">
```

```javascript
Vue.ajax.get('http://example.com', [data], {
    csrf: true
});
```

### Data
Data setting should be an `object`.
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

### File Uploading
File uploading setting should be a `DOM object`. We recommend using the `post` method when uploading files. The important thing here is that you should not forget the `name` attribute.
```html
<input type="file" name="my-input" id="my-input">
```

```javascript
Vue.ajax.post('http://example.com', [data], {
    fileInputs: [
        document.getElementById('my-input'),
        document.getElementById('my-input-2'),
    ]
});
```

You can only add the `accept` attribute to send images.
```html
<input type="file" name="my-input-2" id="my-input-2" accept="image/*">
```

You can add the `accept` attribute to send multiple files with an input element:
```html
<input type="file" name="my-input-3" id="my-input-3" multiple>
```

### HTTP Headers
HTTP headers setting should be an `object`.
```javascript
Vue.ajax.get('http://example.com', [data], {
    headers: [
        {'Content-Type': 'application/json'},
        {'Accept': 'application/json, text/plain, */*'}
    ]
});
```

### Method
URL data setting should be an `string`. Available values are:
* `delete`
* `get`
* `head`
* `jsonp`
* `patch`
* `post`
* `put`

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

### <a name="pjax"></a> Pjax
`pjax` setting should be an `object`. `pjax` is uses `ajax` and `pushState` to deliver a fast browsing experience with real permalinks, page titles, and a working back button. Detailed information is available [here](https://blog.lateral.io/2015/07/the-awesomeness-of-pjax/). 

It need to specify the url (String) and the container element (CSS selector) whose content will change. Also, you can specify the target element (CSS selector) to trigger the operation. If you want, you can choose which event to trigger for the target element. The trigger event default value is `click`. The default method of `pjax` request is `GET`.

**Usage**
```javascript
Vue.ajax.pjax(string url[, object data] [,object configurations]);
```

#### Pjax Data Parameters 
* **container:** [_Required_] `(String)` The container element. (CSS selector)
* **title:** `(Title)` The document title.
* **target:** `(String)` Trigger target element. (CSS selector)
* **event:** `(String)` Trigger event of target element. Default value is `click`.  
_Example values: `click`, `mouseover`, etc_
* **assets:** `(String|Object)` CSS or JS file url.  
_Available values:_
    * _'path/css/style.css'_
    * _['path/css/style.css', 'path/js/script.js']_
* **history:** `(Boolean)` Scrolling the container top after the load.
Default value is `true`
* **scroll:** `(Boolean)` Browser history. Default value is `true`.

**Examples**
```javascript
Vue.ajax.pjax('http://example.com', {
    container: '#container',
    title: 'New title!'
});
```

More specific configurations:
```javascript
Vue.ajax.pjax('http://example.com', {
    container: '#container',
    title: 'New title!',
    target: '#container',
    event: 'click',
    assets: ['path/css/style.css', 'path/js/script.js'],
    scroll: true,
    history: true
});
```

Request with another method:
```javascript
Vue.ajax({
    method : 'post',
    url : 'http://example.com',
    pjax : {
        container: '#container',
        title: 'New title!'
    }
});
```

`Notice`: pjax request does not work with the `jsonp` method.

### Preventing Dublicate
This setting prevents sending dublicate requests to the same address or given key data. 

Preventing dublicate setting should be a `boolean`. Default value is `true`.

The following example prevents sending requests over the same URL:
```javascript
Vue.ajax.get('http://example.com', [data], {
    preventDublicate: true
});
```

The following example prevents sending requests over the same given key data:
```javascript
Vue.ajax.get('http://example.com', [data], {
    preventDublicate: true,
    key: 'ABCDEFGH'
});
```

### Timeout
Timeout setting should be an `number`. Default value is `60000` (60 seconds).   
_(Time in milliseconds)_
```javascript
Vue.ajax.get('http://example.com', [data], {
    timeout: 60000
});
```

### URL Data
URL data setting should be an `object`. With this setting, you can add serialized query string to the URL you are sending.
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

### With Credentials
With credentials setting should be a `boolean`. Default value is `false`. 

There is a detailed explanation [here](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/withCredentials).
```javascript
Vue.ajax.get('http://example.com', [data] {
    withCredentials: false
});
```

## Response Handling
The response returns the `object` on the frontend. The object in general is the following structure:
```javascript
{
    data: [object|null],
    status: [string],
    statusText: [string],
    headers: [string],
    config: [object],
    xhrStatus: [string]
    request: [object],
}
```

#### Response Format

If the content type on the server is "`application/json`", the `response.data` is automatically converted to a `JSON object`. If the content type is anything else, the result is returned as `plain text`.

PHP:
```php
header('Content-type: application/json; charset=utf-8');
echo json_encode($array);
```

Laravel:
```php
Route::get('respone', function () {
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

#### Error Handling

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

# License
[MIT](LICENSE)

Copyright (c) 2018 [Fatih Koca](http://fattih.com)