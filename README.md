![vuejs-ajax](https://user-images.githubusercontent.com/1655312/41012120-c9f6f6de-6948-11e8-8afa-582e33c2eb54.png)

[![Travis Build](https://img.shields.io/travis/fattihkoca/vuejs-ajax.svg)](https://travis-ci.org/fattihkoca/vuejs-ajax)
[![Version](https://img.shields.io/npm/v/vuejs-ajax.svg)](https://www.npmjs.com/package/vuejs-ajax)
[![Downloads](https://img.shields.io/npm/dm/vuejs-ajax.svg)](https://www.npmjs.com/package/vuejs-ajax)

A light XHR plugin for Vue 2.x and and above versions. It has many similar features with `jQuery`'s `ajax()` and `Angular`'s `$http()`. In addition to these, it also has its own important features: 
* [`Assets`](#assets)
* [`Component shifter`](#component-shifter)
* [`File uploading`](#file-uploading)
* [`History`](#history)
* [`Title`](#title)
* [`Serialized query string`](#urldata)
* [`Preventing dublicate requests`](#preventing-dublicate)

## Setup

```
npm install vuejs-ajax --save
```

You have two ways to setup `vuejs-ajax`:

#### CommonJS (Webpack/Browserify)

- ES6

```js
import ajax from 'vuejs-ajax'
Vue.use(ajax)
```

- ES5

```js
var ajax = require('vuejs-ajax')
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

#### Get Method
```javascript
Vue.ajax.get(string url[, object data] [,object configurations])
    .then(function success[, function error])
```

##### Post Method
```javascript
Vue.ajax.post(string url[, object data] [,object configurations])
    .then(function success[, function error])
```

### Arguments

| Property         | Type             | Description                                                   |
| ---------------- | ---------------- | ------------------------------------------------------------- |
| url              | String           | A string containing the URL to which the request is sent.     |
| data             | Object           | A plain object that is sent to the server with the request.   |
| configurations   | Object           | A set of key/value pairs that configure the Vue.ajax request. |

**Other methods and requests are the same:**

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

## <a name="component-shifter"></a> Component Shifter
With componentShifter() you can load (with `Vue.ajax`) and render your `Vue template` (html) in your application by dynamic & async `Vue.component()`. You can also add components and run them nested.

It also supports `Vue.ajax`'s `history` feature. And the component is automatically update when navigating to the previous - next page.

```
vm.componentShifter(object configurations[, function success] [,function error])
```

### Settings:
| Property         | Required | Value     | Description                        |
| ---------------- | -------- | --------- | ---------------------------------- |
| is               | Yes      | String    | Unique dynamic component name      |
| url              | Yes      | String    | Component resources url            |
| success          | No       | Function  | Your custom callback on success    |
| error            | No       | Function  | Your custom callback on error      |


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

## <a name="configurations"></a> Vue Ajax Configurations

| Configuration         | Type             | Default | Available                                  |
| --------------------- | ---------------- | ------- | ------------------------------------------ |
| assets                | String \| Object | -       | -                                          |
| async                 | Boolean          | true    | true, false                                |
| cache                 | Boolean          | false   | true, false                                |
| complete              | Function         | -       | -                                          |
| csrf                  | Boolean          | true    | true, false                                |
| data                  | Object           | -       | -                                          |
| fileInputs            | Element Object   | -       | Input file upload objects                   |
| history               | Boolean          | false   | true, false                                |
| headers               | Object           | -       | -                                          |
| headers               | Object           | -       | -                                          |
| method                | String           | get     | delete, get, head, jsonp, patch, post, put |
| preventDublicate      | Boolean          | true    | true, false                                |
| scrollTop             | Boolean          | false   | true, false                                |
| timeout               | Integer          | 60000   | Time in milliseconds                       |
| title                 | String           | -       | -                                          |
| url                   | String           | -       | -                                          |
| urlData               | Object           | -       | -                                          |
| withCredentials       | Boolean          | false   | true, false                                |

## <a name="examples"></a> Vue Ajax Configuration Examples

### <a name="assets"></a> Assets
Assets setting is used to push new asset files (CSS or JS) in the document.

#### Pushing single asset file
```javascript
Vue.ajax.get('http://example.com', [data], {
    assets: 'path/css/style.css'
});
```

#### Pushing multiple asset files
```javascript
Vue.ajax.get('http://example.com', [data], {
    assets: ['assets/css/style.css', 'assets/js/script.js']
});
```

### Asynchronous
By default, all requests are sent asynchronously (i.e. this is set to true by default). If you need synchronous requests, set this option to `false`.
```javascript
Vue.ajax.get('http://example.com', [data], {
    async: true
});
```

### Cache
```javascript
Vue.ajax.get('http://example.com', [data], {
    cache: false
});
```

### Complete Event
A function to be called when the request finishes (Success or error).

```javascript
Vue.ajax.get('http://example.com', [data], {
    complete: function(response) {
        console.log(response.status)
    }
});
```

### CSRF
```javascript
Vue.ajax.get('http://example.com', [data], {
    csrf: true
});
```

In the html head tag it must be `csrf-token meta`. Like this:

```html
<meta name="csrf-token" content="ABCDEFGHIJKLMN">
```

### Data
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


### <a name="file-uploading"></a> File Uploading
File uploading setting should be `DOM object`. We recommend using the `post` method when uploading files. The important thing here is that you should not forget the `name` attribute.

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

### <a name="history"></a> History
History setting is usage of PushState (HTML history API).

PushState (changing the URL of the page without refreshing the page) to create a faster browsing experience.  This means less elements to load and therefore faster browsing.

```javascript
Vue.ajax.get('http://example.com', [data], {
    history: true
});
```

**Adding version for history**  
Layouts can be forced to do a hard reload when assets or html changes. First set the initial layout version in your header with a custom `meta` tag.

HTML:
```html
<meta http-equiv="x-history-version" content="ABCDEFGH">
```

### HTTP Headers
```javascript
Vue.ajax.get('http://example.com', [data], {
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/plain, */*'
    }
});
```

### Method
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
scrollTop setting is used to scroll to top of the document when loading the request.
```javascript
Vue.ajax.get('http://example.com', [data], {
    scrollTop: true
});
```

### Timeout
Set a timeout (in milliseconds) for the request.

```javascript
Vue.ajax.get('http://example.com', [data], {
    timeout: 60000
});
```

### <a name="title"></a> Title
Title setting is used to change the document title value.
```javascript
Vue.ajax.get('http://example.com', [data], {
    title: 'New title'
});
```


### <a name="urldata"></a>URL Data
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

### With Credentials
There is a detailed explanation [here](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/withCredentials).
```javascript
Vue.ajax.get('http://example.com', [data] {
    withCredentials: false
});
```

## Response Handling
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

#### Response Format

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
