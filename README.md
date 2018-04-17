# Vue.ajax

A light XHR plugin for Vue 2.x and and above versions. It has many similar features with `jQuery`'s `ajax()` and `Angular`'s `$http()`. In addition to these, it also has its own important features: 
* [`Assets`](#assets)
* [`Dynamic & async Vue components`: (_**`componentShifter`**_)](#component-shifter)
* [`File uploading`](#file-uploading)
* [`History`](#history)
* [`Title`](#title)
* [`Preventing dublicate requests`](#preventing-dublicate)

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
```
Vue.ajax.post(string url[, object data] [,object configurations])
    .then(function success[, function error])
```

##### Delete Method
```
Vue.ajax.delete(string url[, object data] [,object configurations])
    .then(function success[, function error])
```

##### Head Method
```
Vue.ajax.head(string url[, object data] [,object configurations])
    .then(function success[, function error])
```

##### Jsonp Request
```
Vue.ajax.jsonp(string url[, object data] [,object configurations])
    .then(function success[, function error])
```

##### Patch Method
```
Vue.ajax.patch(string url[, object data] [,object configurations])
    .then(function success[, function error])
```

##### Put Method
```
Vue.ajax.put(string url[, object data] [,object configurations])
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

## <a name="component-shifter"></a> Component Shifter
With componentShifter() you can load (with `Vue.ajax`) and render your `Vue template` (html) in your application by dynamic & async `Vue.component()`. You can also add components and run them nested.

It also supports `Vue.ajax`'s `history` feature. And the component is automatically update when navigating to the previous - next page.

```
vm.componentShifter(object configurations[, function success] [,function error])
```

* __configurations__: _Object_  
`Vue.ajax` configurations. For detailed information, [see](#configurations).  
Required properties:
    * is: (_String_) Component name
    * url: (_String_) Request url
* __success__: _function_  
Your custom callback on success.
* __error__: _function_  
Your custom callback on error.

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
                is: 'myPage', // Component name (Must be in quotes)
                url: url,
                title: title,
                history: true
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

## <a name="configurations"></a> Vue Ajax Configurations

### <a name="assets"></a> Assets
Assets setting is used to push new asset files (CSS or JS) in the document. Available values, `string` or `object`.

**Pushing single asset file**
```javascript
Vue.ajax.get('http://example.com', [data], {
    assets: 'path/css/style.css'
});
```

**Pushing multiple asset files**
```javascript
Vue.ajax.get('http://example.com', [data], {
    assets: ['assets/css/style.css', 'assets/js/script.js']
});
```

### Asynchronous
Asynchronous setting should be `boolean`. Default is `true`.
```javascript
Vue.ajax.get('http://example.com', [data], {
    async: true
});
```

### Cache
Cache setting should be `boolean`. Default value is `false`.
```javascript
Vue.ajax.get('http://example.com', [data], {
    cache: false
});
```

### Complete Event
Complete event setting should be `function`.

```javascript
Vue.ajax.get('http://example.com', [data], {
    complete: function(response) {
        console.log(response.status)
    }
});
```

### CSRF
CSRF setting should be `boolean`. Default value is `true`. However, in the html head tag it must be `csrf-token meta`. Like this:

```html
<meta name="csrf-token" content="ABCDEFGHIJKLMN">
```

```javascript
Vue.ajax.get('http://example.com', [data], {
    csrf: true
});
```

### Data
Data setting should be `object`.
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

### <a name="file-uploading"></a> File Uploading
File uploading setting should be `DOM object`. We recommend using the `post` method when uploading files. The important thing here is that you should not forget the `name` attribute.
```html
<input type="file" name="my-input" id="my-input">
```

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

### <a name="history"></a> History
History setting is usage of PushState (HTML history API). History setting should be  `boolean`. Default value is `false`. 

PushState (changing the URL of the page without refreshing the page) to create a faster browsing experience.  This means less elements to load and therefore faster browsing.

```javascript
Vue.ajax.get('http://example.com', [data], {
    history: true
});
```

**Adding version for history**  
Layouts can be forced to do a hard reload when assets or html changes. First set the initial layout version in your header with a custom `meta` tag.
```html
<meta http-equiv="x-history-version" content="ABCDEFGH">
```

### HTTP Headers
HTTP headers setting should be `object`.
```javascript
Vue.ajax.get('http://example.com', [data], {
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/plain, */*'
    }
});
```

### Method
URL data setting should be `string`. Available values are:
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

### <a name="preventing-dublicate"></a> Preventing Dublicate
This setting prevents sending dublicate requests to the same address or given key data. 

Preventing dublicate setting should be `boolean`. Default value is `true`.

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

### Scroll Top
scrollTop setting is used to scroll to top of the document when loading the request. Default value is `false`.
```javascript
Vue.ajax.get('http://example.com', [data], {
    scrollTop: true
});
```

### Timeout
Timeout setting should be `numeric`. Default value is `60000` (60 seconds). 
_(Time in milliseconds)_
```javascript
Vue.ajax.get('http://example.com', [data], {
    timeout: 60000
});
```

### <a name="title"></a> Title
Title setting is used to change the document title value. It should be `string`.
```javascript
Vue.ajax.get('http://example.com', [data], {
    title: 'New title'
});
```


### URL Data
URL data setting should be `object`. With this setting, you can add serialized query string to the URL you are sending.
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
With credentials setting should be `boolean`. Default value is `false`. 

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