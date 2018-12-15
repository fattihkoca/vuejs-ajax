![vuejs-ajax](https://user-images.githubusercontent.com/1655312/41012120-c9f6f6de-6948-11e8-8afa-582e33c2eb54.png)

[![Travis Build](https://img.shields.io/travis/fattihkoca/vuejs-ajax.svg)](https://travis-ci.org/fattihkoca/vuejs-ajax)
[![Version](https://img.shields.io/npm/v/vuejs-ajax.svg)](https://www.npmjs.com/package/vuejs-ajax)
[![Downloads](https://img.shields.io/npm/dm/vuejs-ajax.svg)](https://www.npmjs.com/package/vuejs-ajax)

It is a XHR plugin that works in specific features for Vue.js 2.x and and above versions. It has many similar features with `jQuery`'s `ajax()` and `Angular`'s `$http()`. In addition to these, it also has its own important features: 
* [`Assets`](/#assets)
* [`Component shifter`](/#component-shifter)
* [`Event handlers`](/#event-handlers)
* [`File uploading`](/#file-uploading)
* [`History`](/#history)
* [`Title`](/#title)
* [`Serialized query string`](/#url-data)
* [`Prevent duplicate requests`](/#prevent-duplicate)

# Setup

```npm
npm install vuejs-ajax --save
```

You have two ways to setup `vuejs-ajax`:

#### CommonJS (Webpack/Browserify)

##### 1 - ES6

```javascript
import ajax from "vuejs-ajax"
Vue.use(ajax)
```

##### 2 - ES5

```javascript
var ajax = require("vuejs-ajax")
Vue.use(ajax)
```

***

# <a name="component-shifter"></a> componentShifter()
With componentShifter() you can load (with `Vue.ajax`) and render your `Vue template` (html) in your application by dynamic & async `Vue.component()`. You can also add components and run them nested.

Important benefits:
1. You can organize the `async and dynamic components` by typing less. Check out the [events](/#component-shifter-events) for listeners.
2. You can easily prepare common `callbacks` and `listeners` for dynamic components.
3. With the `keepAlive` option caches the active components. Thus, when inactive components are called, they are loaded quickly without consuming data.
4. With the `library` option you can create dynamic options for dynamic component instances (`data`, `props`, `computed`, ..., etc).
5. And supports `Vue.ajax`'s all features (`history`, `data`, `title`, ..., etc).

```
this.componentShifter(object configurations[, function success] [,function error])
```

##### Basic Example 
```javascript
this.componentShifter({
    is: {componentHolder: componentName},
    url: url,
}, function() {
    console.log("Component changed!");
});
```

## Options

| Property       | Required | Type     | Description                                                      |
| -------------- | -------- | -------- | ---------------------------------------------------------------- |
| **`is`**       | Yes      | Object   | Component holder (key) and unique component name (value).        |
| **`url`**      | Yes      | String   | Component resources url.                                         |
| **`keepAlive`**| No       | Boolean or object  | Caches the inactive components. `Default: false`       |
| **`library`**  | No       | Object   | Options of the new component instance (`data`, `props`, ..., etc)|

#### `keepAlive` options

| Property       | Required | Type                                     | Description                                               |
| -------------- | -------- | ---------------------------------------- | --------------------------------------------------------- |
| **`include`**  | No       | Array, string _(comma-delimited)_, regex | Only components with matching names will be cached.       |
| **`exclude`**  | No       | Array, string _(comma-delimited)_, regex | Any component with a matching name will not be cached.    |
| **`max`**      | No       | Number                                   | The maximum number of component instances to cache.       |

## Callbacks
| Property     | Required | Type     | Description                                                      |
| ------------ | -------- | -------- | ---------------------------------------------------------------- |
| _`success`_  | No       | Function | Your custom callback on success. _(Second argument)_             |
| _`error`_    | No       | Function | Your custom callback on error. _(Third argument)_                |

##### Detailed example

_HTML_
```html
<div id="app">
    <a href="/page-1" @click.prevent="openPage('page1', '/page-1', 'Page 1')">Page 1</a>
    <a href="/page-2" @click.prevent="openPage('page2', '/page-2', 'Page 2')">Page 2</a>
    <a href="/page-3" @click.prevent="openPage('page3', '/page-3', 'Page 3')">Page 3</a>

    <!-- Your container component -->
    <component :is="pageComponent"></component>
</div>
```

_Vue.js_
```javascript
new Vue({
    el: "#app",
    data() {
        return {
            pageComponent: null, // Component holder
            pageLoaded: false
        }
    },
    methods: {
        openPage(componentName, url, title) {
            
            // Calling componentShifter
            this.componentShifter({
                is: {pageComponent: componentName},
                url: url,
                keepAlive: {
                    max: 10,
                    
                    // Another usages: "page1,page2" and /page1|page2/
                    include: ["page1", "page2"],
                    
                    // Another usages: "page3,page4" and /page3|page4/
                    exclude: ["page3", "page4"]
                },
                library: {
                    data() {
                        return {
                            hasFooter: true
                        } 
                    },
                    props: ["custom"]
                }
            }, function() {
                console.log("Component changed!");
                this.pageLoaded = true;
            }, function(response) {
                console.log("Component could not be changed!", response);
                this.pageLoaded = false;
            });
            
        }
    },
    mounted() {
        if(!pageLoaded) {
            this.openPage("page1", "/page-1", "Page 1")
        }
    }
});
```

## <a name="component-shifter-events"></a> Component Shifter Events

#### `componentshiftercomplete`
Register a handler to be called when `componentShifter()` requests complete.
```javascript
window.addEventListener("vueajaxhistorycomplete", function(e) {
    console.log(e);
});
```

#### `componentshiftererror`
Register a handler to be called when `componentShifter()` requests complete with an error.
```javascript
window.addEventListener("componentshiftererror", function(e) {
    console.log(e);
});
```

#### `componentshifterstart`
Register a handler to be called when `componentShifter()` requests begins.
```javascript
window.addEventListener("componentshifterstart", function(e) {
    console.log(e);
});
```

#### `componentshiftersuccess`
Attach a function to be executed whenever an `componentShifter()` request completes successfully.
```javascript
window.addEventListener("componentshiftersuccess", function(e) {
    console.log(e);
});
```

***

# Vue.ajax()

### Examples
```javascript
Vue.ajax.get("http://example.com").then(function(response) {
    console.log("Success", response.data)
}, function(response) {
    console.log("Error", response.statusText)
});
```

If you want to send data to the backend:

```javascript
Vue.ajax.get("http://example.com", {
    param1: "First parameter",
    param2: "Second parameter"
}).then(function(response) {
    console.log("Success", response.data)
}, function(response) {
    console.log("Error", response.statusText)
})
```

Or if you want to make some configurations:

```javascript
Vue.ajax.get("http://example.com", {
    param: "Send parameter"
}, {
    history: true,
    scrollTop: true,
}).then(function(response) {
    console.log("Success", response.data)
}, function(response) {
    console.log("Error", response.statusText)
})
```

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

| Property         | Required | Type             | Description                                                   |
| ---------------- | -------- | ---------------- | ------------------------------------------------------------- |
| url              | Yes      | String           | A string containing the URL to which the request is sent.     |
| data             | No       | Object           | A plain object that is sent to the server with the request.   |
| configurations   | No       | Object           | A set of key/value pairs that configure the Vue.ajax request. |

##### All ajax request methods and uses are the same:

* Delete method: `Vue.ajax.delete(...);`
* Get method: `Vue.ajax.get(...);`
* Head method: `Vue.ajax.head(...);`
* Jsonp method: `Vue.ajax.jsonp(...);`
* Patch method: `Vue.ajax.patch(...);`
* Post method: `Vue.ajax.post(...);`
* Put method: `Vue.ajax.put(...);`

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

***

# <a name="configurations"></a> Ajax Configurations

| Configuration                                 | Type             | Default | Available                                  |
| --------------------------------------------- | ---------------- | ------- | ------------------------------------------ |
| [`assets`](/#assets)                          | String Or Object | -       | -                                          |
| [`async`](/#async)                            | Boolean          | true    | true, false                                |
| [`cache`](/#cache)                            | Boolean          | false   | true, false                                |
| [`complete`](/#complete)                      | Function         | -       | -                                          |
| [`csrf`](/#csrf)                              | Boolean          | true    | true, false                                |
| [`data`](/#data)                              | Object           | -       | -                                          |
| [`fileInputs`](/#file-uploading)              | Element Object   | -       | Input file upload objects                  |
| [`hardReloadOnError`](/#hard-reload-on-error) | Boolean          | false   | true, false                                |
| [`history`](/#history)                        | Boolean          | false   | true, false                                |
| [`headers`](/#headers)                        | Object           | -       | -                                          |
| [`method`](/#method)                          | String           | get     | delete, get, head, jsonp, patch, post, put |
| [`preventDuplicate`](/#prevent-duplicate)     | Boolean          | true    | true, false                                |
| [`scrollTop`](/#scroll-top)                   | Boolean          | false   | true, false                                |
| [`timeout`](/#timeout)                        | Integer          | 60000   | Time in milliseconds                       |
| [`title`](/#title)                            | String           | -       | -                                          |
| [`url`](/#method)                             | String           | -       | -                                          |
| [`urlData`](/#url-data)                       | Object           | -       | -                                          |
| [`withCredentials`](/#with-credentials)       | Boolean          | false   | true, false                                |

# <a name="examples"></a> Ajax Configuration Examples

## <a name="assets"></a> Assets
Assets setting is used to push new asset files (CSS or JS) in the document.

##### Pushing single asset file
```javascript
Vue.ajax.get([url], [data], {
    assets: "path/css/style.css"
});
```

##### Pushing multiple asset files
```javascript
Vue.ajax.get("http://example.com", {}, {
    assets: ["assets/css/style.css", "assets/js/script.js"]
});
```

## <a name="async"></a> Asynchronous
By default, all requests are sent asynchronously (i.e. this is set to true by default). If you need synchronous requests, set this option to `false`. Default value is `true`.
```javascript
Vue.ajax.get("http://example.com", {}, {
    async: true
});
```

## <a name="cache"></a> Cache
If set to false, it will force requested pages not to be cached by the browser. Default value is `false`.
```javascript
Vue.ajax.get("http://example.com", {}, {
    cache: false
});
```

## <a name="complete"></a> Complete
A function to be called when the request finishes (`Success` or `error` callbacks are executed).

```javascript
Vue.ajax.get("http://example.com", {}, {
    complete: function(response) {
        console.log(response.status)
    }
});
```

## <a name="csrf"></a> CSRF
This setting provides protection against CSRF attacks. There is a detailed explanation [`here`](https://en.wikipedia.org/wiki/Cross-site_request_forgery). Default value is `true`.
```javascript
Vue.ajax.get("http://example.com", {}, {
    csrf: true
});
```

In the html head tag it must be `csrf-token` `meta`. Like this:

```html
<meta name="csrf-token" content="[TOKEN]">
```

## <a name="data"></a> Data
Data to be sent to the server.

```javascript
Vue.ajax("http://example.com", {
    url: "http://example.com",
    method: "get",
    data: {
        param1: "First parameter",
        param2: "Second parameter"
    }
});
```


## <a name="file-uploading"></a> File Uploading
`fileInputs` setting should be `DOM object` *`<input type="file">`*. We recommend using the `post` method when uploading files. 
The important thing here is that you should not forget the `name` attribute.

HTML:
```html
<input type="file" name="my-input" id="my-input">
```

Vue.js:
```javascript
Vue.ajax.post("http://example.com", {}, {
    fileInputs: [
        document.getElementById("my-input")
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

## <a name="hard-reload-on-error"></a> Hard Reload
Option to hard reloading when page can not be loaded. Default value is `false`.

```javascript
Vue.ajax.get("http://example.com", {}, {
    hardReloadOnError: true
});
```

## <a name="history"></a> History
History setting is usage of PushState (HTML history API). Default value is `false`.

PushState (changing the URL of the page without refreshing the page) to create a faster browsing experience.  This means less elements to load and therefore faster browsing.

```javascript
Vue.ajax.get("http://example.com", {}, {
    history: true
});
```

#### Adding version for history  
Layouts can be forced to do a hard reload when assets or html changes. First set the initial layout version in your header with a custom `meta` tag.

HTML:
```
<meta http-equiv="x-history-version" content="ABCDEFGH">
```

## <a name="headers"></a> HTTP Headers
An object of additional header key/value pairs to send along with requests using the XMLHttpRequest transport.

```javascript
Vue.ajax.get("http://example.com", {}, {
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/json, text/plain, */*"
    }
});
```

## <a name="method"></a> Method
The HTTP method to use for the request (e.g. "get", "post", "put"). Default value is `get`.
```javascript
Vue.ajax({
    url: "http://example.com",
    method: "post"
});
```

_Instead, you might prefer to use the following shorthand:_
```javascript
Vue.ajax.post("http://example.com", {});
```

## <a name="prevent-duplicate"></a> Prevent Duplicate Requests
This setting prevents sending duplicate requests to the same address or given key data. Default value is `true`.  
The following example prevents sending requests over the same URL:
```javascript
Vue.ajax.get("http://example.com", {}, {
    preventDuplicate: true
});
```

The following example prevents sending requests over the same given key data:
```javascript
Vue.ajax.get("http://example.com", {}, {
    preventDuplicate: true,
    key: "ABCDEFGH"
});
```

## <a name="scroll-top"></a> Scroll Top
This setting is used to scroll to top of the document when after loading the request. Default value is `true`.
```javascript
Vue.ajax.get("http://example.com", {}, {
    scrollTop: true
});
```

## <a name="timeout"></a> Timeout
Set a timeout (in milliseconds) for the request. Default value is `60000`.

```javascript
Vue.ajax.get("http://example.com", {}, {
    timeout: 60000
});
```

## <a name="title"></a> Title
Title setting is used to change the document title value.
```javascript
Vue.ajax.get("http://example.com", {}, {
    title: "New title"
});
```

## <a name="url-data"></a> URL Data
With this setting, you can add serialized query string to the URL you are sending.
```javascript
Vue.ajax.get("http://example.com", {}, {
    urlData: [
        {category: "Accessories"},
        {page: 15}
    ]
});
```

The URL will be like this when sending the request:  
```http request
http://example.com?category=Accessories&page=15
```

## <a name="with-credentials"></a> With Credentials
There is a detailed explanation 
[here](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/withCredentials). 
Default value is `false`.
```javascript
Vue.ajax.get("http://example.com", data, {
    withCredentials: false
});
```

# <a name="response-handling"></a> Response Handling
The response returns the Object on the frontend. 

_Success and error together in `then()` method:_
```javascript
Vue.ajax({url: "http://example.com"})
    .then(function(response) {
        console.log(response.data);
    }, function(response) {
        console.log(response);
    })
```

_Success and error together in in separate methods:_
```javascript
Vue.ajax({url: "http://example.com"})
    .then(function(response) {
        console.log(response.data);
    })
    .catch(function(response) {
        console.log(response);
    })
```

The object in general is the following structure:

```javascript
Vue.ajax.post("http://example.com", {pageNumber: 5})
    .then(function(response) {
        console.log(response.data)
    });
```

| Response Property | Type             |
| ----------------- | ---------------- |
| data              | Object Or String |
| status            | String           |
| statusText        | String           |
| headers           | String           |
| config            | Object           |
| xhrStatus         | String           |
| request           | Object           |

## <a name="response-format"></a> Response Format

If the content type on the server is "`application/json`", the `response.data` is automatically converted to a `JSON object`. If the content type is anything else, the result is returned as `plain text`.

PHP:
```php
header("Content-type: application/json; charset=utf-8");
echo json_encode($array);
```

PHP (Laravel):
```php
Route::get("http://example.com", function () {
    return json_encode($array);
});
```

Vue.js
```javascript
Vue.ajax.get("http://example.com", {})
    .then(function(response) {
        console.log(response.data)
    });
```

## <a name="error-handling"></a> Error Handling
There are two ways to use:

##### 1 - In `then()` method
```javascript
Vue.ajax.get("http://example.com/not-existing-path", [data])
    .then(function(response) {
        console.log(response.data)
    }, function(response) {
        console.log("Error: ", response.statusText);
    }); // "Error: Not Found"
```

##### 2 - In `catch()` method
```javascript
Vue.ajax.get("http://example.com/not-existing-path", [data])
    .then(function(response) {
        console.log(response.data)
    }).catch(function(response) {
        console.log("Error: ", response.statusText);
    }); // "Error: Not Found"
```

***

# <a name="event-handlers"></a> Event Handlers

## Common Events

#### `vueajaxabort`
Register a handler to be called when `Vue.ajax` requests abort.
```javascript
window.addEventListener("vueajaxabort", function(e) {
    console.log(e);
});
```

#### `vueajaxcomplete`
Register a handler to be called when `Vue.ajax` requests complete.
```javascript
window.addEventListener("vueajaxsuccess", function(e) {
    console.log(e);
});
```

#### `vueajaxerror`
Register a handler to be called when `Vue.ajax` requests complete with an error.
```javascript
window.addEventListener("vueajaxerror", function(e) {
    console.log(e);
});
```

#### `vueajaxstart`
Register a handler to be called when `Vue.ajax` requests begins.
```javascript
window.addEventListener("vueajaxstart", function(e) {
    console.log(e);
});
```

#### `vueajaxsuccess`
Attach a function to be executed whenever an `Vue.ajax` request completes successfully.
```javascript
window.addEventListener("vueajaxsuccess", function(e) {
    console.log(e);
});
```

## History Events

#### `vueajaxhistorycomplete`
Register a handler to be called when `Vue.ajax history` requests complete.
```javascript
window.addEventListener("vueajaxhistorycomplete", function(e) {
    console.log(e);
});
```

#### `vueajaxhistoryerror`
Register a handler to be called when `Vue.ajax history` requests complete with an error.
```javascript
window.addEventListener("vueajaxhistoryerror", function(e) {
    console.log(e);
});
```

#### `vueajaxhistorystart`
Register a handler to be called when `Vue.ajax history` requests begins.
```javascript
window.addEventListener("vueajaxhistorystart", function(e) {
    console.log(e);
});
```

#### `vueajaxhistorysuccess`
Attach a function to be executed whenever an `Vue.ajax history` request completes successfully.
```javascript
window.addEventListener("vueajaxhistorysuccess", function(e) {
    console.log(e);
});
```

# License
[MIT](LICENSE)

Copyright (c) 2018 [Fatih Koca](http://fattih.com)
