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
            xhrStatuses = ['Uninitialized', 'Opened', 'Headers Received', 'Loading', 'Complete'],
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
            // Location redirect for pjax
            locationRedirect = function (url) {
                window.history.replaceState(null, "", url);

                if (!url) {
                    window.location.reload();
                    return;
                }

                window.location.replace(url);
            },
            // Scrolling when pjax loaded
            scrollTop = function(item) {
                if(item && item.scrollTop) {
                    item.scrollTo (0, 0);
                    return;
                }
                
                window.scrollTo (0, 0);
            },
            fileExtension = function(filename) {
                return filename.split('.').pop();
            },
            // Adding assets for pjax 
            pushAssets = function(asset) {
                if(typeof asset == 'object') {
                    for(var i in asset) {
                        pushAssets(asset[i]);
                    }
                    return;
                } else if(typeof asset != 'string') {
                    return;
                }

                var extension = fileExtension(asset),
                    newElement = null;

                switch (extension) {
                    case 'css':
                        if(document.head.querySelector('link[href="'+ asset +'"]')){
                            return
                        }
                        newElement = document.createElement("link");
                        newElement.rel = 'stylesheet';
                        newElement.type = 'text/css';
                        newElement.href = asset;
                        break;
                
                    case 'js':
                        if(document.head.querySelector('script[src="'+ asset +'"]')){
                            return
                        }
                        newElement = document.createElement("script");
                        newElement.type = 'text/javascript';
                        newElement.src = asset;
                        break;
                }

                if(newElement) {
                    document.head.appendChild(newElement);
                }
            },
            pjaxVersion = function() {
                var meta = document.head.querySelector('meta[http-equiv=x-pjax-version][content]');
                return meta ? meta.getAttribute('content') : false;
            },
            availableHistory = function(pjax) {
                var state = window.history.state || {};
                return (pjax.history == undefined || pjax.history) && 
                    window.history.pushState && (!state || !state.url || state.url != pjax.url);
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
                    pjax = config.pjax !== undefined && typeof config.pjax == 'object' ? config.pjax : false,
                    data = null,
                    postData = null,
                    csrf = config.csrf !== undefined ? config.csrf : true,
                    preventDublicate = config.preventDublicate !== undefined ? config.preventDublicate : true,
                    withCredentials = config.withCredentials !== undefined ? config.withCredentials : false,
                    fileInputs = config.fileInputs,

                    // time in milliseconds
                    timeout = typeof config.timeout == 'number' || 
                    (!isNaN(parseFloat(config.timeout)) && isFinite(config.timeout)) ? config.timeout : 60000,
                    currentPjaxVersion = pjaxVersion();

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
                if (!cache && !pjax) {
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

                // Adding request key
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
                    for (var i in config.headers) {
                        xhr.setRequestHeader(i, config.headers[i]);
                    }
                }

                // Ajax request header
                xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

                if (method == 'POST' && typeof fileInputs != 'object') {
                    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                }

                // Adding http headers for pjax
                if (pjax) {
                    xhr.setRequestHeader('X-PJAX', 'true');

                    if(currentPjaxVersion) {
                        xhr.setRequestHeader('X-PJAX-Version', currentPjaxVersion);
                    }
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
                        },
                        stateCallName = randomString(8) + timestamp();

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
                            if (pjax) {
                                var latestPjaxVersion = xhr.getResponseHeader('X-PJAX-Version');
                                if(currentPjaxVersion && latestPjaxVersion && 
                                    currentPjaxVersion !== latestPjaxVersion) {
                                    return locationRedirect(url);
                                }

                                // For push state object
                                var stateObj = {
                                    url: url,
                                    method: method,
                                    container: pjax.container,
                                    title: pjax.title,
                                    target: pjax.target,
                                    event: pjax.event,
                                    assets: pjax.assets,
                                    history: pjax.history,
                                    scroll: pjax.scroll,
                                    callName: stateCallName
                                },
                                container = pjax.container && document.body.querySelector(pjax.container);

                                if (availableHistory(pjax)) {
                                    window.history.pushState(stateObj, pjax.title, url);
                                }

                                if (container) {
                                    container.innerHTML = responseData;
                                } else {
                                    locationRedirect(url);
                                }

                                if (pjax.title) {
                                    document.title = pjax.title;
                                }

                                if(pjax.assets) {
                                    pushAssets(pjax.assets);
                                }

                                if (!pjax.scroll || pjax.scroll) {
                                    scrollTop(container);
                                }
                            }
                        }
                        // Error callback
                        else if (preventDublicate && this.status != 0) {
                            if (typeof config.error == 'function') {
                                config.error(response);
                            }

                            if (pjax) {
                                locationRedirect(url);
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
                    async = config.async || true,
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

        window.addEventListener('popstate', function (e) {
            if (!e.state) {
                return locationRedirect();
            }

            var pjax = e.state,
                url = pjax.url || null,
                method = pjax.method || 'GET',
                containerSel = pjax.container || false,
                container = containerSel ? document.body.querySelector(containerSel) : false,
                title = pjax.title || null,
                targetSel = pjax.target || false,
                target = targetSel ? document.body.querySelector(targetSel) : false,
                event = pjax.event || 'click',
                assets = pjax.assets,
                scroll = pjax.scroll,
                callName = pjax.callName || false,
                history = pjax.history || false;

            // If url does not exists
            if (!url || !container) {
                return locationRedirect();
            }

            // If window reloaded
            else if (!callName || typeof window[callName] != 'function') {
                // If target element does not exists
                if (!target || !event) {
                    return locationRedirect(url);
                }

                // Element event trigger
                return target[event]();
            }

            // If window not reloaded
            Vue.ajax({
                url: url,
                method: method,
                pjax: {
                    container: containerSel,
                    title: title,
                    target: targetSel,
                    event: event,
                    assets: assets,
                    history: history,
                    scroll: scroll
                }
            }).then(function (response) {
                window[callName](response);
            }, function () {
                return locationRedirect(url);
            });
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
         * Vue.ajax.pjax()
         * @param {String} url
         * @param {String} container
         * @param {String} title
         */
        Vue.ajax.pjax = function (url, data, config) {
            var config = {
                pjax: data || {}
            };

            this.config = parseConfigures('GET', url, {}, config);
            xhrSend(this.config);
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
            return this;
        };

        /**
         * Vue.ajax.catch()
         * @param {Function} error
         */
        Vue.ajax.catch = function (error) {
            this.config['error'] = error;
            return this;
        };
    }
};

export default VueAjax;