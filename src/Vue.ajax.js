/**
 * VueAjax
 */
const VueAjax = {
    install(Vue, options) {
        Vue.mixin({
            /**
             * mounted: Called after the instance has been mounted
             */
            mounted() {
                if (typeof options == 'object' && typeof options.mounted == 'function') {
                    return options.mounted();
                }
            }
        });

        var requestAttemps = {},
            jsonpAttempSize = 0;

        const
            // Timestamp method
            timestamp = function () {
                return String((new Date().getTime()))
            },
            // Random string creator
            randomString = function (m) {
                var m = m || 9;
                var s = '',
                    r = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
                for (var i = 0; i < m; i++) {
                    s += r.charAt(Math.floor(Math.random() * r.length));
                }
                return s;
            },
            // Random query string for preventing cache
            nonCacheQs = function () {
                return randomString(5) + timestamp() + '=' + timestamp();
            },
            // Serialize objects
            serialize = function (obj, prefix) {
                var str = [],
                    p;
                for (p in obj) {
                    if (obj.hasOwnProperty(p)) {
                        var k = prefix ? prefix + "[" + p + "]" : p,
                            v = obj[p];
                        str.push((v !== null && typeof v === "object") ?
                            serialize(v, k) :
                            encodeURIComponent(k) + "=" + encodeURIComponent(v));
                    }
                }
                return str.join("&");
            },
            // Adding query string to url
            addQueryString = function (url, qs) {
                var prefix = url.indexOf('?') !== -1 ? '&' : '?';
                return url + prefix + qs;
            },
            // Parsing received configures
            parseConfigures = function (method, url, data, config) {
                var parsed = {};

                if (typeof config == 'object') {
                    parsed = config;   
                }

                if (typeof data == 'object') {
                    parsed['data'] = data;
                }

                parsed['method'] = method;
                parsed['url'] = url;

                return parsed;
            },
            // XHR send method
            xhrSend = function (config) {
                if (!config.url) {
                    return false;
                }

                // Receiving configures
                var key = config.key || config.url,
                    method = config.method || 'GET',
                    async = config.async !== undefined ? config.async : true,
                    cache = config.cache !== undefined ? config.cache : false,
                    url = config.url,
                    data = null,
                    postData = null,
                    csrf = config.csrf !== undefined ? config.csrf : true,
                    preventDublicate = config.preventDublicate !== undefined ? config.preventDublicate : true,
                    withCredentials = config.withCredentials !== undefined ? config.withCredentials : false,
                    readyStates = ['Uninitialized', 'Opened', 'Headers Received', 'Loading', 'Complete'],
                    fileInputs = config.fileInputs,
                    timeout = typeof config.timeout == 'number' || (!isNaN(parseFloat(config.timeout)) && isFinite(config.timeout)) ? config.timeout : 60000; // time in milliseconds

                method = method.toUpperCase();

                // Mükerrer işlem engellenmişse, artarda gelen işlemleri iptal eder
                if (preventDublicate && config.method != 'JSONP' && requestAttemps.hasOwnProperty(key)) {
                    requestAttemps[key].abort();
                }

                // File uploading
                if (typeof fileInputs == 'object' && fileInputs.length) {
                    var postData = new FormData();

                    for (var i in fileInputs) {
                        if (fileInputs[i].files) {
                            var files = fileInputs[i].files,
                                fileName = fileInputs[i].hasAttribute('name') ? fileInputs[i].getAttribute('name') : 'file_' + i;

                            if (files.length > 1) {
                                fileName += '[]';
                            }

                            for (var f in files) {
                                var file = files[f];
                                postData.append(fileName, file);
                            }
                        }
                    }

                    if (typeof config.data == 'object') {
                        for (var i in config.data) {
                            postData.append(i, config.data[i]);
                        }
                    }
                } else if (typeof config.data == 'object' && Object.keys(config.data).length) {
                    data = serialize(config.data);

                    if (method == 'GET') {
                        url = addQueryString(url, data);
                    } else if (method == 'POST' || method == 'PUT' || method == 'DELETE' || method == 'PATCH') {
                        data = null;
                        postData = data;
                    }
                }

                // Noncaching
                if (!cache) {
                    url = addQueryString(url, nonCacheQs());
                }

                // Before callback
                if (typeof config.before == 'function') {
                    config.before();
                }

                // urlData
                if (typeof config.urlData == 'object') {
                    var urlSerializeData = serialize(config.urlData);
                    url = addQueryString(url, urlSerializeData);
                }

                // Jsonp
                if (config.method == 'JSONP') {
                    config.url = addQueryString(url, data);
                    config.key = key;
                    config.preventDublicate = preventDublicate;
                    config.data = data;
                    return jsonpSend(config);
                }

                // Starting XHR
                var xhr = new XMLHttpRequest();

                if (key) {
                    requestAttemps[key] = xhr;
                }

                // Timeout
                xhr.timeout = timeout;

                // Opening XHR
                xhr.open(method, url, async);

                // Adding CSRF Token
                if (csrf) {
                    var meta = document.head.querySelector('meta[name=csrf-token]');
                    csrf = meta && meta.hasAttribute('content') ? meta.content : false;

                    if (csrf) {
                        if (typeof config.headers == 'object') {
                            config.headers['X-CSRF-TOKEN'] = csrf;
                        } else {
                            config.headers = {
                                'X-CSRF-TOKEN': csrf
                            };
                        }
                    }
                }

                if (typeof config.headers == 'object') {
                    for (var i in config.headers) {
                        xhr.setRequestHeader(i, config.headers[i]);
                    }
                }

                // Ajax request header
                xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

                if (method == 'POST' && typeof fileInputs != 'object') {
                    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                }

                // withCredentials for Cross-Site
                if (withCredentials) {
                    xhr.withCredentials = true;
                }

                xhr.onreadystatechange = function () {
                    var responseData = this.response,
                        contentType = xhr.getResponseHeader("content-type");

                    // Parsing json responses
                    if (this.readyState == 4 && responseData &&
                        contentType && contentType.indexOf('json') !== -1) {
                        var responseJson = JSON.parse(this.responseText);
                        if (typeof responseJson == "object") {
                            responseData = responseJson;
                        }
                    }

                    // Preparing response object
                    var response = {
                        config: config,
                        data: responseData,
                        headers: xhr.getAllResponseHeaders(),
                        request: this,
                        status: this.status,
                        statusText: this.statusText,
                        xhrStatus: readyStates.hasOwnProperty(this.readyState) ? readyStates[this.readyState] : 'Unknown'
                    };

                    // Connection done
                    if (this.readyState == 4) {
                        delete requestAttemps[key];

                        // Complete callback
                        if (typeof config.complete == 'function') {
                            config.complete(response);
                        }

                        // Success callback
                        if (this.status == 200) {
                            if (typeof config.success == 'function') {
                                config.success(response);
                            }
                        }
                        // Error callback
                        else if (preventDublicate && this.status != 0) {
                            if (typeof config.error == 'function') {
                                config.error(response);
                            }
                        }
                    }
                };

                // Sending XHR
                xhr.send(postData);

                return xhr;
            },

            // JSONP send method
            jsonpSend = function (config) {
                var method = 'GET',
                    name = randomString(10) + '_' + jsonpAttempSize++,
                    url = config.url,
                    async = config.async !== undefined ? config.async : true,
                    callbackParam = config.jsonpCallbackParam || 'callback',
                    key = config.key;

                // Adding callback query string
                url = addQueryString(url, callbackParam + '=' + name);

                if (config.preventDublicate && requestAttemps.hasOwnProperty(key)) {
                    if (requestAttemps[key].hasOwnProperty('src')) {
                        var src = requestAttemps[key].src,
                            prevScript = document.head.querySelector('script[src="' + src + '"]');
                        prevScript.src = '';
                        prevScript.remove();
                    }
                }

                // Create script
                var script = document.createElement('script');
                script.type = 'text/javascript';
                script.src = url;

                // For prevent dublicate requests
                requestAttemps[key] = script;

                // Asynchronous request
                if (async) {
                    script.async = true;
                }

                try {
                    var response = {
                        config: config,
                        data: null,
                        headers: null,
                        request: this,
                        status: null,
                        statusText: null,
                        xhrStatus: 'JSONP'
                    };

                    window[name] = function (data) {
                        if (typeof config.success == 'function') {
                            response['data'] = data;
                            response['status'] = 1;
                            response['statusText'] = 'OK';
                            config.success(response);
                        }

                        if (script) {
                            script.remove();
                        }

                        delete window[name];
                        delete requestAttemps[key];
                    };

                    document.head.appendChild(script);

                    script.onload = function (e) {
                        if (typeof config.complete == 'function') {
                            response['request'] = e;
                            response['status'] = 1;
                            response['statusText'] = 'OK';
                            config.complete(response);
                        }
                    };

                    script.onerror = function (e) {
                        if (typeof config.error == 'function') {
                            response['status'] = 0;
                            response['statusText'] = 'Error';
                            response['request'] = e;
                            config.error(response);
                        }

                        if (script) {
                            script.remove();
                        }
                    };
                } catch (error) {
                    if (typeof config.error == 'function') {
                        config.error(error);
                    }
                }

                return script;
            };

        /**
         * Vue.ajax()
         * @param {Object} config
         */
        Vue.ajax = function (config) {
            Vue.ajax.config = config;
            return Vue.ajax;
        };

        Vue.ajax.config = {};

        /**
         * Vue.ajax.get()
         * @param {String} url 
         * @param {Object} data
         * @param {Object} config 
         */
        Vue.ajax.get = function (url, data, config) {
            this.config = parseConfigures('GET', url, data, config);
            return this;
        };

        /**
         * Vue.ajax.post()
         * @param {String} url 
         * @param {Object} data
         * @param {Object} config
         */
        Vue.ajax.post = function (url, data, config) {
            this.config = parseConfigures('POST', url, data, config);
            return this;
        };

        /**
         * Vue.ajax.head()
         * @param {String} url 
         * @param {Object} data
         * @param {Object} config
         */
        Vue.ajax.head = function (url, data, config) {
            this.config = parseConfigures('HEAD', url, data, config);
            return this;
        };

        /**
         * Vue.ajax.put()
         * @param {String} url 
         * @param {Object} data
         * @param {Object} config
         */
        Vue.ajax.put = function (url, data, config) {
            this.config = parseConfigures('PUT', url, data, config);
            return this;
        };

        /**
         * Vue.ajax.delete()
         * @param {String} url 
         * @param {Object} data
         * @param {Object} config
         */
        Vue.ajax.delete = function (url, data, config) {
            this.config = parseConfigures('DELETE', url, data, config);
            return this;
        };

        /**
         * Vue.ajax.patch()
         * @param {String} url 
         * @param {Object} data
         * @param {Object} config
         */
        Vue.ajax.patch = function (url, data, config) {
            this.config = parseConfigures('PATCH', url, data, config);
            return this;
        };

        /**
         * Vue.ajax.jsonp()
         * @param {String} url 
         * @param {Object} config|data
         * @param {Object} config
         */
        Vue.ajax.jsonp = function (url, data, config) {
            this.config = parseConfigures('JSONP', url, data, config);
            return this;
        };

        /**
         * Vue.ajax.then()
         * @param {Function} success
         * @param {Function} error
         */
        Vue.ajax.then = function (success, error) {
            this.config['success'] = success;
            this.config['error'] = error;
            return xhrSend(this.config);
        };
    }
};

export default VueAjax;