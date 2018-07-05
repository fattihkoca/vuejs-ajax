/*!
 * VueAjax
 * Copyright 2018, Fatih Koca
 * Released under the MIT License
 * https://github.com/fattihkoca/vue.ajax
 */

// ES6
// import ajax from 'vue-ajax-plugin'
// Vue.use(ajax)
//
// ES5
// var ajax = require('vue-ajax-plugin')
// Vue.use(ajax)

var VueAjax = {
    install: function(Vue, options) {
        var
            // XHR response status types
            xhrStatuses = ['Uninitialized', 'Opened', 'Headers Received', 'Loading', 'Complete'],

            // Static names
            names = {
                version: 'X-History-Version',
                component: 'x-component-item',
                componentState: 'x-history-state',
            },

            urlEncodedMethods = ['POST', 'PUT', 'PATCH', 'DELETE'],

            defaultMethod = 'GET',

            // Getting current history version
            historyVersion = function () {
                var 
                name = names.version.toLowerCase(),
                meta = document.head.querySelector('meta[http-equiv=' + name + '][content]');

                if(!meta) {
                    meta = document.createElement("meta");
                    meta.setAttribute('http-equiv', name);
                    meta.content = randomString(40);
                    document.head.appendChild(meta);
                }

                return meta ? meta.getAttribute('content') : false;
            },

            getComponentState = function () {
                return document.head.querySelector('meta[http-equiv=' + names.componentState + ']');
            },
            
            componentState = function (status) {
                var meta = getComponentState();

                if (!meta) {
                    meta = document.createElement("meta");
                    meta.setAttribute('http-equiv', names.componentState);
                    document.head.appendChild(meta);
                }

                meta.content = status;
            },

            // Timestamp method
            timestamp = function () {
                return String((new Date().getTime()));
            },

            // Random string creator
            randomString = function (charSize) {
                var m = charSize || 9;
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

            // Location redirect
            locationRedirect = function (url, hardReloadOnError) {
                if(hardReloadOnError != undefined && !hardReloadOnError) {
                    return;
                }

                window.history.replaceState(null, "", url);

                if (!url) {
                    window.location.reload();
                    return;
                }

                window.location.replace(url);
            },

            // Getting file extension
            getFileExtension = function (filename) {
                return filename.split('.').pop();
            },

            // Adding assets 
            pushAssets = function (asset) {
                if (typeof asset == 'object') {
                    for (var i in asset) {
                        pushAssets(asset[i]);
                    }
                    return;
                } else if (!asset ||  typeof asset != 'string') {
                    return;
                }

                var extension = getFileExtension(asset),
                    newElement = null,
                    findElement = function(selector) {
                        return document.head.querySelector(selector);
                    };

                switch (extension) {
                    case 'css':
                        if (findElement('link[href="' + asset + '"]')) {
                            return;
                        }

                        newElement = document.createElement("link");
                        newElement.rel = 'stylesheet';
                        newElement.type = 'text/css';
                        newElement.href = asset;
                        break;

                    case 'js':
                        if (findElement('script[src="' + asset + '"]')) {
                            return;
                        }

                        newElement = document.createElement("script");
                        newElement.type = 'text/javascript';
                        newElement.src = asset;
                        break;
                }

                if (newElement) {
                    document.head.appendChild(newElement);
                }
            },

            // Checking to history feature
            availableHistory = function (url) {
                var state = window.history.state || {},
                    pushState = window.history.pushState || {};
                return pushState && (!state || !state.url || state.url != url);
            },

            // Parsing received configures
            parseConfigures = function (method, url, data, config) {
                var parsed = {};

                if (typeof config == 'object') {
                    parsed = config;
                }

                if (typeof data == 'object') {
                    parsed.data = data;
                }

                parsed.method = method;
                parsed.url = url;

                return parsed;
            },

            updateTitle = function (title) {
                if (title) {
                    document.title = title;
                }
            },

            scrollToTop = function (scroll) {
                if (scroll) {
                    window.scrollTo(0, 0);
                }
            },
            
            isUrlEncodedMethod = function(method) {
                return urlEncodedMethods.indexOf(method) != -1;
            },

            // XHR send method
            xhrSend = function (config) {
                if (!config.url) {
                    return false;
                }

                // Receiving configures
                var assets = config.assets || null,
                    async = config.async !== undefined ? config.async : true,
                    cache = config.cache || false,
                    csrf = config.csrf !== undefined ? config.csrf : true,
                    currentHistoryVersion = historyVersion(),
                    data = null,
                    postData = null,
                    fileInputs = config.fileInputs,
                    history = config.history || false,
                    key = config.key || config.url,
                    method = config.method || defaultMethod,
                    title = config.title || false,
                    url = config.url,
                    preventDublicate = config.preventDublicate !== undefined ? config.preventDublicate : true,
                    scrollTop = config.scrollTop || false,
                    stateCallName = randomString(8) + timestamp(),
                    timeout = typeof config.timeout == 'number' || (!isNaN(parseFloat(config.timeout)) && isFinite(config.timeout)) ? config.timeout : 60000,
                    withCredentials = config.withCredentials || false,
                    hardReloadOnError = config.hardReloadOnError || false;

                method = method.toUpperCase();

                // Preventing dublicate requests
                if (preventDublicate && config.method != 'JSONP' && requestAttemps.hasOwnProperty(key)) {
                    requestAttemps[key].abort();
                }

                // File uploading
                if (typeof fileInputs == 'object' && fileInputs.length) {
                    postData = new FormData();

                    for (var i in fileInputs) {
                        if (fileInputs[i].files) {
                            var files = fileInputs[i].files,
                                fileName = fileInputs[i].hasAttribute('name') ?
                                fileInputs[i].getAttribute('name') : 'file_' + i;

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
                        for (var o in config.data) {
                            postData.append(o, config.data[o]);
                        }
                    }
                } else if (typeof config.data == 'object' && Object.keys(config.data).length) {
                    data = serialize(config.data);

                    if(isUrlEncodedMethod(method)) {
                        postData = data;
                        data = null;
                    } else {
                        url = addQueryString(url, data);
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
                    return jsonpRequest(config);
                }

                // Starting XHR
                var xhr = new XMLHttpRequest();

                // Pushing request key
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

                // Adding http headers
                if (typeof config.headers == 'object') {
                    for (var h in config.headers) {
                        xhr.setRequestHeader(h, config.headers[h]);
                    }
                }

                // Ajax request header
                xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

                if (isUrlEncodedMethod(method) && typeof fileInputs != 'object') {
                    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                }

                // Adding http headers for history
                if (history && currentHistoryVersion) {
                    xhr.setRequestHeader(names.version, currentHistoryVersion);
                }

                // WithCredentials option for Cross-Site
                if (withCredentials) {
                    xhr.withCredentials = true;
                }

                // XHR responsing
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
                        xhrStatus: xhrStatuses.hasOwnProperty(this.readyState) ?
                            xhrStatuses[this.readyState] : 'Unknown'
                    };

                    // If connection is done
                    if (this.readyState == 4) {
                        delete requestAttemps[key];

                        // Complete callback
                        if (typeof config.complete == 'function') {
                            config.complete(response);
                        }

                        // Success callback
                        if (this.status == 200) {
                            if (typeof config.success == 'function') {
                                window[stateCallName] = function () {
                                    return config.success(response);
                                };

                                window[stateCallName]();
                            } else {
                                window[stateCallName] = function () {
                                    return response;
                                };
                            }

                            // Pjax commits
                            if (history) {
                                var latestHistoryVersion = xhr.getResponseHeader(names.version);

                                // If version mismatching
                                if (currentHistoryVersion && latestHistoryVersion && currentHistoryVersion !== latestHistoryVersion) {
                                    return locationRedirect(config.url, hardReloadOnError);
                                }

                                if (availableHistory(config.url)) {
                                    window.history.pushState({
                                        assets: assets,
                                        callName: stateCallName,
                                        title: title,
                                        history: history,
                                        method: method,
                                        scrollTop: scrollTop,
                                        url: config.url
                                    }, title, config.url);
                                }
                            }

                            // Update document title
                            updateTitle(title);

                            // Has scroll feature
                            scrollToTop(scrollTop);

                            // Push assets
                            pushAssets(assets);
                        }
                        // Error callback
                        else if (preventDublicate && this.status != 0) {
                            if (typeof config.error == 'function') {
                                config.error(response);
                            }

                            if (history) {
                                // History fallback
                                locationRedirect(url);
                            }
                        }
                    }
                };

                // Sending XHR
                xhr.send(postData);

                return xhr;
            },

            // JSONP request
            jsonpRequest = function (config) {
                var async = config.async || true,
                    callbackParam = config.jsonpCallbackParam || 'callback',
                    key = config.key,
                    name = randomString(10) + '_' + jsonpAttempSize++,
                    url = config.url;

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
                            response.data = data;
                            response.status = 1;
                            response.statusText = 'OK';
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
                            response.request = e;
                            response.status = 1;
                            response.statusText = 'OK';
                            config.complete(response);
                        }
                    };

                    script.onerror = function (e) {
                        if (typeof config.error == 'function') {
                            response.status = 0;
                            response.statusText = 'Error';
                            response.request = e;
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

        var
            // Request attemps for previnting dublicate requests
            requestAttemps = {},

            // Jsonp attemp size for naming jsonp callbaks
            jsonpAttempSize = 0;

        // Pjax history (Benefits of HTML5 histroy api)
        window.addEventListener('popstate', function (e) {
            // Set true to meta for component updating
            componentState(true);

            // If browser doesn't has state in history
            if (!e.state) {
                // History fallback
                return locationRedirect();
            }

            // Pjax configurations
            var state = e.state,
                assets = state.assets,
                callName = state.callName || false,
                history = state.history || false,
                method = state.method || 'GET',
                scrollTop = state.scrollTop,
                title = state.title || null,
                url = state.url || null;

            // If url does not exists or window reloaded
            if (!url || !callName || typeof window[callName] != 'function') {
                // History fallback
                return locationRedirect();
            }

            // Send ajax request and run previous callback
            Vue.ajax({
                assets: assets,
                history: history,
                method: method,
                scrollTop: scrollTop,
                title: title,
                url: url
            }).then(function (response) {
                // Run previous callback
                window[callName](response);
            }, function () {
                // History fallback
                return locationRedirect(url);
            });
        });

        Vue.mixin({
            methods: {
                /**
                 * Dynamic & async Vue components
                 * @param {Object} config Vue.ajax configurations
                 * @param {Function} success On success callback
                 * @param {Function} error On error callback
                 */
                componentShifter: function(config, success, error) {
                    config.method = config.method || 'GET';
                    var componentName = config.is || names.component,
                        self = this;

                    // Set component state to false
                    componentState(false);

                    // Load template by xhr
                    Vue.ajax(config).then(function (response) {
                        if (getComponentState().content == 'false') {
                            var template = response.data;

                            // Run Vue.component
                            Vue.component(componentName, function (resolve) {
                                // Resolve response data
                                resolve({
                                    template: template
                                });
                            });

                            // Run callback after success
                            if (typeof success == 'function') {
                                success(response);
                            }

                            // Update component name
                            self[componentName] = null;
                            self[componentName] = componentName;

                            return;
                        }

                        // If on popstate set component from history
                        self.componentShifter(config, success);
                    }, function(response) {
                        // If has error callback
                        if (typeof error == 'function') {
                            error(response);
                        }
                    });
                }
            },
            created: function() {
                historyVersion();
                componentState(false);
            },
            mounted: function() {
                if (typeof options == 'object' && typeof options.mounted == 'function') {
                    return options.mounted();
                }
            }
        });

        /**
         * Vue.ajax()
         * @param {Object} config
         */
        Vue.ajax = function (config) {
            Vue.ajax.config = config;
            xhrSend(Vue.ajax.config);
            return Vue.ajax;
        };

        // Configurations
        Vue.ajax.config = {};

        /**
         * Vue.ajax.get()
         * @param {String} url 
         * @param {Object} data
         * @param {Object} config 
         */
        Vue.ajax.get = function (url, data, config) {
            this.config = parseConfigures('GET', url, data, config);
            xhrSend(this.config);
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
            xhrSend(this.config);
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
            xhrSend(this.config);
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
            xhrSend(this.config);
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
            xhrSend(this.config);
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
            xhrSend(this.config);
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
            xhrSend(this.config);
            return this;
        };

        /**
         * Vue.ajax.then()
         * @param {Function} success
         * @param {Function} error
         */
        Vue.ajax.then = function (success, error) {
            this.config.success = success;
            this.config.error = error;
            return this;
        };

        /**
         * Vue.ajax.catch()
         * @param {Function} error
         */
        Vue.ajax.catch = function (error) {
            this.config.error = error;
            return this;
        };
    }
};

module.exports = VueAjax;