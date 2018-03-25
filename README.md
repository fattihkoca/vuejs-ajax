# Vue.ajax

A light XHR plugin for Vue 2x. It has many similar features with `jQuery`'s `ajax()` and `Angular`'s `http`(). In addition to these, it also has its own practical features. For example, file upload feature.

## Example
```javascript
Vue.ajax.get('http://mydomain.com').then(function(response) {
    console.log('Success', response.data)
}, function(response) {
    console.log('Error', response.statusText)
})
```

If you want to send data to the backend:

```javascript
Vue.ajax.get('http://mydomain.com', {
    param1: 'First parameter',
    param2: 'Second parameter'
}).then(function(response) {
    console.log('Success', response.data)
}, function() {
    console.log('Error', response.statusText)
})
```

## Arguments
```javascript
Vue.ajax.get(string url[, object data] [,object configures])
    .then(function success[, function error])
```

`url:` _string_   
A string containing the URL to which the request is sent.

`data:` _object|null_  
A plain object that is sent to the server with the request.

`configures:` _object|null_  
A set of key/value pairs that configure the Vue.ajax request.

## Configures
The example above uses the `.get` method of the `Vue.ajax` service.

The `.get` method is a shortcut method of the `Vue.ajax` service. There are several shortcut methods:

* `Vue.ajax.delete()`
* `Vue.ajax.get()`
* `Vue.ajax.head()`
* `Vue.ajax.jsonp()`
* `Vue.ajax.patch()`
* `Vue.ajax.post()`
* `Vue.ajax.put()`

The methods above are all shortcuts of calling the `Vue.ajax` service:

```javascript
Vue.ajax({
    url: 'http://mydomain.com',
    method: 'GET'
}).then(function(response) {
    console.log('Success', response.data)
}, function() {
    console.log('Error', response.statusText)
})
```

```javascript
Vue.ajax(object configures)
    .then(function success[, function error])
```

## Configurations

### Setting Asynchronous
Asynchronous setting should be a `boolean`. Default is `true`.
```javascript
Vue.ajax.get('http://mydomain.com', [data], {
    async: true
});
```

### Setting Cache
Cache setting should be a `boolean`. Default value is `true`.
```javascript
Vue.ajax.get('http://mydomain.com', [data], {
    async: false
});
```

### Setting Complete Event
Complete event setting should be a `function`.

```javascript
Vue.ajax.get('http://mydomain.com', [data], {
    complete: function(response) {
        console.log(response.status)
    }
});
```

### Setting CSRF
CSRF setting should be a `boolean`. Default value is `true`. 

However, in the html head tag it must be `csrf-token meta`. Like this: `<meta name="csrf-token" content="ABCDEFGHIJKLMN">`.
```javascript
Vue.ajax.get('http://mydomain.com', [data], {
    csrf: true
});
```

### Setting Data
Data setting should be an `object`.
```javascript
Vue.ajax.get('http://mydomain.com', [data], {
    data: {
        param1: 'First parameter',
        param2: 'Second parameter'
    }
});
```

### Setting File Uploading
File uploading setting should be a `DOM object`. We recommend using the `post` method when uploading files.
```html
<form>
    <input type="file" name="my-input" id="my-input">
    <input type="file" name="my-input-2" id="my-input-2" accept="image/*">
</form>
```

```javascript
Vue.ajax.post('http://mydomain.com', [data], {
    fileInputs: [
        document.getElementById('my-input'),
        document.getElementById('my-input-2'),
    ]
});
```

You can also send multiple files with an input:
```html
<input type="file" name="my-input-3" id="my-input-3" multiple>
```

### Setting HTTP Headers
HTTP headers setting should be an `object`.
```javascript
Vue.ajax.get('http://mydomain.com', [data], {
    headers: [
        {'Content-Type': 'application/json'},
        {'Accept': 'application/json, text/plain, */*'}
    ]
});
```

### Setting Method
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
    url: 'http://mydomain.com',
    method: 'post'
});
```

Instead, you might prefer to use the following shorthand:
```javascript
Vue.ajax.post('http://mydomain.com', [data]);
```

### Setting Preventing Dublicate
The duplicate prevention setting prevents sending requests to the same address or given key data. 

Preventing dublicate setting should be a `boolean`. Default value is `true`.

The following example prevents sending requests over the same URL:
```javascript
Vue.ajax.get('http://mydomain.com', [data], {
    preventDublicate: true
});
```

The following example prevents sending requests over the same given key data:
```javascript
Vue.ajax.get('http://mydomain.com', [data], {
    preventDublicate: true,
    key: 'ABCDEFGH'
});
```

### Setting Timeout
Timeout setting should be an `number`. Default value is `60`.
```javascript
Vue.ajax.get('http://mydomain.com', [data], {
    timeout: 60
});
```

### Setting URL Data
URL data setting should be an `object`. With this setting, you can add serialized query string to the URL you are sending.
```javascript
Vue.ajax.get('http://mydomain.com', [data], {
    urlData: [
        {page: 15},
        {category: 'Accessories'}
    ]
});
```

The URL will be like this when sending the request:  
`http://mydomain.com?page=15&category=Accessories`

### Setting With Credentials
With credentials setting should be a `boolean`. Default value is `true`. 

There is a detailed explanation [here](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/withCredentials).
```javascript
Vue.ajax.get('http://mydomain.com', [data] {
    withCredentials: true
});
```

## Response
The response returns the `object` on the frontend. The object in general is the following structure:
```json
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

### Data

If the content type on the server is "`application/json`", the response.data is automatically converted to a `JSON object`. If the content type is anything else, the result is returned as `plain text`.

PHP:
```php
header('Content-type: application/json; charset=utf-8');
echo json_encode($array);
```

Laravel:
```php
return response(json_encode($array), 200)->header('Content-Type', 'application/json; charset=utf-8');
```

# License
[MIT](LICENSE)

Copyright (c) 2018 Fatih Koca