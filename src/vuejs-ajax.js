/*!
 * VueAjax
 * (c) 2018, Fatih Koca
 * Released under the MIT License
 * https://github.com/fattihkoca/vue.ajax
 */
const VueAjax = {
    install: (Vue, options) => {
        let // Request attempt for preventing duplicated requests
            requestAttempt = {},

            // Jsonp attempt size for naming jsonp callback
            jsonpAttemptSize = 0;

        const utils = {
            // XHR response status types
            xhrStatuses: ["Uninitialized", "Opened", "Headers Received", "Loading", "Complete"],

            // Static names
            names: {
                version: "X-History-Version",
                component: "x-component-item",
                componentState: "x-history-state",
                csrfMeta: "csrf-token",
                csrfToken: "X-CSRF-TOKEN",
                ajaxRequestKey: "X-Requested-With",
                ajaxRequestValue: "XMLHttpRequest",
                contentUrlEncoded: "application/x-www-form-urlencoded",
            },

            event: {
                abort: "vueajaxabort",
                ajaxcomplete: "vueajaxcomplete",
                ajaxsuccess: "vueajaxsuccess",
                ajaxerror: "vueajaxerror",
                ajaxstart: "vueajaxstart",
                historystart: "vueajaxhistorystart",
                historycomplete: "vueajaxhistorycomplete",
                historysuccess: "vueajaxhistorysuccess",
                historyerror: "vueajaxhistoryerror",
                shiftercomplete: "componentshiftercomplete",
                shifterstart: "componentshifterstart",
                shiftersuccess: "componentshiftersuccess",
                shiftererror: "componentshiftererror",
            },

            urlEncodedMethods: ["POST", "PUT", "PATCH", "DELETE"],
            defaultMethod: "GET",

            /**
             * Timestamp method
             * @returns {string}
             */
            timestamp() {
                return String((new Date().getTime()));
            },

            /**
             * Random string creator
             * @param charSize
             * @returns {string}
             */
            randomString(charSize) {
                let m = charSize || 9,
                    s = "",
                    r = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

                for (let i = 0; i < m; i++) {
                    s += r.charAt(Math.floor(Math.random() * r.length));
                }

                return s;
            },

            /**
             * Getting current history version
             */
            historyVersion() {
                let name = utils.names.version.toLowerCase(),
                    meta = document.head.querySelector("meta[http-equiv=" + name + "][content]");

                if (!meta) {
                    meta = document.createElement("meta");
                    meta.setAttribute("http-equiv", name);
                    meta.content = utils.randomString(40);
                    document.head.appendChild(meta);
                }

                return meta ? meta.getAttribute("content") : false;
            },

            /**
             * Get component style
             * @returns {Element}
             */
            getComponentState() {
                return document.head.querySelector("meta[http-equiv=" + utils.names.componentState + "]");
            },

            /**
             *
             * @param status
             */
            componentState(status) {
                let meta = utils.getComponentState();

                if (!meta) {
                    meta = document.createElement("meta");
                    meta.setAttribute("http-equiv", utils.names.componentState);
                    document.head.appendChild(meta);
                }

                meta.content = status;
            },

            /**
             * Random query string for preventing cache
             * @returns {string}
             */
            nonCacheQs() {
                return utils.randomString(5) + utils.timestamp() + "=" + utils.timestamp();
            },

            /**
             * Serialize objects
             * @param obj
             * @param prefix
             * @returns {string}
             */
            serialize(obj, prefix = false) {
                let str = [],
                    p;
                for (p in obj) {
                    if (obj.hasOwnProperty(p)) {
                        let k = prefix ? prefix + "[" + p + "]" : p,
                            v = obj[p];
                        str.push((v !== null && typeof v === "object") ?
                            utils.serialize(v, k) :
                            encodeURIComponent(k) + "=" + encodeURIComponent(v));
                    }
                }
                return str.join("&");
            },

            /**
             * Adding query string to url
             * @param url
             * @param qs
             * @returns {string}
             */
            addQueryString(url, qs) {
                let prefix = url.indexOf("?") !== -1 ? "&" : "?";
                return url + prefix + qs;
            },

            /**
             * Location redirect
             * @param url
             * @param hardReloadOnError
             */
            locationRedirect(url, hardReloadOnError) {
                if (hardReloadOnError !== undefined && !hardReloadOnError) {
                    return;
                }

                window.history.replaceState(null, "", url);

                if (!url) {
                    window.location.reload();
                    return;
                }

                window.location.replace(url);
            },

            /**
             * Getting file extension
             * @param filename
             * @return string
             */
            getFileExtension(filename) {
                return filename.split(".").pop();
            },

            /**
             * Adding assets
             * @param asset
             */
            pushAssets(asset) {
                if (typeof asset === "object") {
                    for (let i in asset) {
                        utils.pushAssets(asset[i]);
                    }
                    return;
                } else if (!asset || typeof asset !== "string") {
                    return;
                }

                let extension = utils.getFileExtension(asset),
                    newElement = null,
                    findElement = selector => {
                        return document.head.querySelector(selector);
                    };

                switch (extension) {
                    case "css":
                        if (findElement('link[href="' + asset + '"]')) {
                            return;
                        }

                        newElement = document.createElement("link");
                        newElement.rel = "stylesheet";
                        newElement.type = "text/css";
                        newElement.href = asset;
                        break;

                    case "js":
                        if (findElement('script[src="' + asset + '"]')) {
                            return;
                        }

                        newElement = document.createElement("script");
                        newElement.type = "text/javascript";
                        newElement.src = asset;
                        break;
                }

                if (newElement) {
                    document.head.appendChild(newElement);
                }
            },

            /**
             * Checking to window history support
             * @param url
             * @returns boolean
             */
            isSupportPushState(url) {
                let state = window.history.state || {},
                    pushState = window.history.pushState || {};
                return pushState && (!state || !state.url || state.url !== url);
            },

            /**
             * Push window history state
             * @param data
             */
            pushState(data) {
                if (!data.history) {
                    return;
                }

                let latestHistoryVersion = data.xhr.getResponseHeader(utils.names.version);

                // If version mismatching
                if (data.currentHistoryVersion && latestHistoryVersion
                    && data.currentHistoryVersion !== latestHistoryVersion) {
                    return utils.locationRedirect(data.url, data.hardReloadOnError);
                }

                if (utils.isSupportPushState(data.url)) {
                    window.history.pushState({
                        assets: data.assets,
                        callName: data.stateCallName,
                        title: data.title,
                        history: data.history,
                        method: data.method,
                        scrollTop: data.scrollTop,
                        url: data.url,
                        hardReloadOnError: data.hardReloadOnError
                    }, data.title, data.url);
                }
            },

            /**
             * Parsing received configures
             * @param method
             * @param url
             * @param data
             * @param config
             */
            parseConfigures(method, url, data, config) {
                let parsed = {};

                if (typeof config === "object") {
                    parsed = config;
                }

                if (typeof data === "object") {
                    parsed.data = data;
                }

                parsed.method = method;
                parsed.url = url;

                return parsed;
            },

            /**
             * Update document title element
             * @param title
             */
            updateTitle(title) {
                if (title) {
                    document.title = title;
                }
            },

            /**
             * Window scroll top
             * @param scroll
             */
            scrollToTop(scroll) {
                if (scroll) {
                    window.scrollTo(0, 0);
                }
            },

            /**
             *
             * @param method
             * @returns {boolean}
             */
            isUrlEncodedMethod(method) {
                return utils.urlEncodedMethods.indexOf(method) !== -1;
            },

            /**
             *
             * @param type
             * @param state
             */
            customEventDispatcher(type, state) {
                const evt = new CustomEvent(type, {
                    detail: state,
                });

                window.dispatchEvent(evt);
            },

            /**
             * JSONP request
             * @param config
             * @returns {HTMLElement}
             */
            jsonpRequest: function (config) {
                let async = config.async || true,
                    callbackParam = config.jsonpCallbackParam || "callback",
                    key = config.key,
                    name = utils.randomString(10) + "_" + (jsonpAttemptSize++),
                    url = config.url;

                // Adding callback query string
                url = utils.addQueryString(url, callbackParam + "=" + name);

                if (config.preventDuplicate && requestAttempt.hasOwnProperty(key)) {
                    if (requestAttempt[key].hasOwnProperty("src")) {
                        let src = requestAttempt[key].src,
                            prevScript = document.head.querySelector('script[src="' + src + '"]"');

                        prevScript.src = "";
                        prevScript.remove();
                    }
                }

                // Create script
                let script = document.createElement("script");

                script.type = "text/javascript";
                script.src = url;

                // For prevent dublicate requests
                requestAttempt[key] = script;

                // Asynchronous request
                if (async) {
                    script.async = true;
                }

                try {
                    let response = {
                        config: config,
                        data: null,
                        headers: null,
                        request: this,
                        status: null,
                        statusText: null,
                        xhrStatus: "JSONP"
                    };

                    window[name] = data => {
                        response.data = data;
                        response.status = 1;
                        response.statusText = "OK";

                        utils.customEventDispatcher(utils.event.ajaxsuccess, response);

                        if (typeof config.success === "function") {
                            config.success(response);
                        }

                        if (script) {
                            script.remove();
                        }

                        delete window[name];
                        delete requestAttempt[key];
                    };

                    document.head.appendChild(script);

                    script.onload = e => {
                        response.request = e;
                        response.status = 1;
                        response.statusText = "OK";

                        utils.customEventDispatcher(utils.event.ajaxcomplete, response);

                        if (typeof config.complete === "function") {
                            config.complete(response);
                        }
                    };

                    script.onerror = e => {
                        response.status = 0;
                        response.statusText = "Error";
                        response.request = e;

                        utils.customEventDispatcher(utils.event.ajaxerror, response);

                        if (typeof config.error === "function") {
                            config.error(response);
                        }

                        if (script) {
                            script.remove();
                        }
                    };
                } catch (error) {
                    utils.customEventDispatcher(utils.event.ajaxerror, error);

                    if (typeof config.error === "function") {
                        config.error(error);
                    }
                }

                return script;
            },

            prepareJsonpRequest(config, data, preventDuplicate, key) {
                config.url = utils.addQueryString(url, data);
                config.key = key;
                config.preventDuplicate = preventDuplicate;
                config.data = data;
                return utils.jsonpRequest(config);
            },

            /**
             * Prevent cache for url
             * @param url
             * @param cache
             * @returns {*}
             */
            preventCacheForUrl(url, cache) {
                if (cache) {
                    return config.url;
                }

                return utils.addQueryString(url, utils.nonCacheQs());
            },

            /**
             * Push data to url (GET requests)
             * @param url
             * @param data
             * @returns {*}
             */
            pushDataToUrl(url, data) {
                if (typeof data !== "object") {
                    return url;
                }

                return utils.addQueryString(url, utils.serialize(data));
            },

            /**
             * @param xhr
             * @param key
             */
            pushKeyToRequest(xhr, key) {
                if (key) {
                    requestAttempt[key] = xhr;
                }
            },

            /**
             *
             * @param config
             * @param preventDuplicate
             * @param key
             */
            preventDuplicateRequests(config, preventDuplicate, key) {
                if (preventDuplicate && config.method !== "JSONP" && requestAttempt.hasOwnProperty(key)) {
                    utils.customEventDispatcher(utils.event.abort, {
                        config: config,
                        timeStamp: utils.timestamp(),
                        xhrStatus: "Abort"
                    });

                    requestAttempt[key].abort();
                }
            },

            /**
             * Execute callback
             * @param callback
             * @param response
             */
            execCallback(callback, response = true) {
                if (typeof callback === "function") {
                    callback(response);
                }
            },

            /**
             * XHR send method
             * @param config
             * @returns {*}
             */
            xhrSend: function (config) {
                if (!config.url) {
                    return false;
                }

                // Receiving configures
                let assets = config.assets || null,
                    async = config.async !== undefined ? config.async : true,
                    csrf = config.csrf !== undefined ? config.csrf : true,
                    cache = config.cache || false,
                    currentHistoryVersion = utils.historyVersion(),
                    data = null,
                    postData = null,
                    fileInputs = config.fileInputs,
                    history = config.history || false,
                    key = config.key || config.url,
                    method = config.method || utils.defaultMethod,
                    title = config.title || false,
                    url = config.url,
                    rawUrl = config.url,
                    preventDuplicate = config.preventDuplicate !== undefined ? config.preventDuplicate : true,
                    scrollTop = config.scrollTop || false,
                    stateCallName = utils.randomString(8) + utils.timestamp(),
                    timeout = typeof config.timeout === "number" || (!isNaN(parseFloat(config.timeout))
                        && isFinite(config.timeout)) ? config.timeout : 60000,
                    withCredentials = config.withCredentials || false,
                    hardReloadOnError = config.hardReloadOnError || false;

                method = method.toUpperCase();

                // Preventing duplicate requests
                utils.preventDuplicateRequests(config, preventDuplicate, key);

                // File uploading
                if (typeof fileInputs === "object" && fileInputs.length) {
                    postData = new FormData();

                    for (let i in fileInputs) {
                        if (fileInputs.hasOwnProperty(i) && fileInputs[i].files) {
                            let files = fileInputs[i].files,
                                fileName = fileInputs[i].hasAttribute("name") ?
                                    fileInputs[i].getAttribute("name") : "file_" + i;

                            if (files.length > 1) {
                                fileName += "[]";
                            }

                            for (let f in files) {
                                if (files.hasOwnProperty(f)) {
                                    postData.append(fileName, files[f]);
                                }
                            }
                        }
                    }

                    if (typeof config.data === "object") {
                        for (let o in config.data) {
                            if (config.data.hasOwnProperty(o)) {
                                postData.append(o, config.data[o]);
                            }
                        }
                    }
                } else if (typeof config.data === "object" && Object.keys(config.data).length) {
                    data = utils.serialize(config.data);

                    if (utils.isUrlEncodedMethod(method)) {
                        postData = data;
                        data = null;
                    } else {
                        url = utils.addQueryString(url, data);
                    }
                }

                // Prevent cache
                url = utils.preventCacheForUrl(url, cache);

                // Push data to url
                url = utils.pushDataToUrl(url, config.urlData);

                // Before callback
                utils.execCallback(config.before);

                // Jsonp
                if (config.method === "JSONP") {
                    return utils.prepareJsonpRequest(config, data, preventDuplicate, key);
                }

                // Starting XHR
                let xhr = new XMLHttpRequest();

                // Pushing request key
                utils.pushKeyToRequest(xhr, key);

                // Timeout
                xhr.timeout = timeout;

                // Opening XHR
                xhr.open(method, url, async);

                // Adding CSRF Token
                if (csrf) {
                    let meta = document.head.querySelector("meta[name=" + utils.names.csrfMeta + "]");
                    csrf = meta && meta.hasAttribute("content") ? meta.content : false;

                    if (csrf) {
                        if (typeof config.headers === "object") {
                            config.headers[utils.names.csrfToken] = csrf;
                        } else {
                            config.headers = {
                                [utils.names.csrfToken]: csrf
                            };
                        }
                    }
                }

                // Adding http headers
                if (typeof config.headers === "object") {
                    for (let h in config.headers) {
                        if (config.headers.hasOwnProperty(h)) {
                            xhr.setRequestHeader(h, config.headers[h]);
                        }
                    }
                }

                // Ajax request header
                xhr.setRequestHeader(utils.names.ajaxRequestKey, utils.names.ajaxRequestValue);

                if (utils.isUrlEncodedMethod(method) && typeof fileInputs !== "object") {
                    xhr.setRequestHeader("Content-type", utils.names.contentUrlEncoded);
                }

                // Adding http headers for history
                if (history && currentHistoryVersion) {
                    xhr.setRequestHeader(utils.names.version, currentHistoryVersion);
                }

                // WithCredentials option for Cross-Site
                if (withCredentials) {
                    xhr.withCredentials = true;
                }

                // XHR response
                xhr.onreadystatechange = function () {
                    let responseData = this.response,
                        contentType = xhr.getResponseHeader("content-type");

                    // Parsing json responses
                    if (this.readyState === 4 && responseData &&
                        contentType && contentType.indexOf("json") !== -1) {
                        let responseJson = JSON.parse(this.responseText);
                        if (typeof responseJson === "object") {
                            responseData = responseJson;
                        }
                    }

                    // Preparing response object
                    let response = {
                        config: config,
                        data: responseData,
                        headers: xhr.getAllResponseHeaders(),
                        request: this,
                        status: this.status,
                        statusText: this.statusText,
                        timeStamp: utils.timestamp(),
                        xhrStatus: utils.xhrStatuses.hasOwnProperty(this.readyState) ?
                            utils.xhrStatuses[this.readyState] : "Unknown"
                    };

                    // If connection is done
                    if (this.readyState === 4) {
                        delete requestAttempt[key];

                        utils.customEventDispatcher(utils.event.ajaxcomplete, response);

                        // Complete callback
                        utils.execCallback(config.complete);

                        // Success callback
                        if (this.status === 200) {
                            if (typeof config.success === "function") {
                                utils.customEventDispatcher(utils.event.ajaxsuccess, response);

                                window[stateCallName] = () => {
                                    return config.success(response);
                                };

                                window[stateCallName]();
                            } else {
                                window[stateCallName] = () => {
                                    return response;
                                };
                            }

                            // Push history state
                            utils.pushState({
                                history: history,
                                currentHistoryVersion: currentHistoryVersion,
                                hardReloadOnError: hardReloadOnError,
                                method: method,
                                title: title,
                                scrollTop: scrollTop,
                                assets: assets,
                                stateCallName: stateCallName,
                                url: rawUrl,
                                xhr: xhr,
                            });

                            // Update document title
                            utils.updateTitle(title);

                            // Has scroll feature
                            utils.scrollToTop(scrollTop);

                            // Push assets
                            utils.pushAssets(assets);
                        }
                        // Error callback
                        else if (preventDuplicate && this.status !== 0) {
                            utils.customEventDispatcher(utils.event.ajaxerror, response);

                            // Error callback
                            utils.execCallback(config.error, response);

                            if (history) {
                                // History fallback
                                utils.locationRedirect(url, hardReloadOnError);
                            }
                        }
                    }
                };

                utils.customEventDispatcher(utils.event.ajaxstart, {
                    config: config,
                    timeStamp: utils.timestamp(),
                    xhrStatus: "Uninitialized"
                });

                // Sending XHR
                xhr.send(postData);

                return xhr;
            }
        };

        // Pjax history (Benefits of HTML5 history api)
        window.addEventListener("popstate", e => {
            // Set true to meta for component updating
            utils.componentState(true);

            // If browser doesn't has state in history
            if (!e.state) {
                // History fallback
                return utils.locationRedirect();
            }

            // Pjax configurations
            let state = e.state,
                assets = state.assets,
                callName = state.callName || false,
                hardReloadOnError = state.hardReloadOnError,
                history = state.history || false,
                method = state.method || "GET",
                scrollTop = state.scrollTop,
                title = state.title || null,
                url = state.url || null;

            // If url does not exists or window reloaded
            if (!url || !callName || typeof window[callName] !== "function") {
                // History fallback
                return utils.locationRedirect();
            }

            utils.customEventDispatcher(utils.event.historystart, {
                timeStamp: utils.timestamp(),
                xhrStatus: "Uninitialized"
            });

            // Send ajax request and run previous callback
            Vue.ajax({
                assets: assets,
                history: history,
                method: method,
                scrollTop: scrollTop,
                title: title,
                url: url,
                hardReloadOnError: hardReloadOnError,
                complete: response => {
                    utils.customEventDispatcher(utils.event.historycomplete, response);
                }
            }).then(response => {
                utils.customEventDispatcher(utils.event.historysuccess, response);

                // Run previous callback
                window[callName](response);
            }, response => {
                utils.customEventDispatcher(utils.event.historyerror, response);

                // History fallback
                return utils.locationRedirect(url);
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
                componentShifter: function (config, success, error) {
                    config.method = config.method || "GET";
                    let completeCallback = config.complete;

                    config.complete = response => {
                        utils.customEventDispatcher(utils.event.shiftercomplete, response);
                        utils.execCallback(completeCallback);
                    };

                    let componentName = config.is || utils.names.component;

                    // Set component state to false
                    utils.componentState(false);

                    utils.customEventDispatcher(utils.event.shifterstart, {
                        timeStamp: utils.timestamp(),
                        xhrStatus: "Uninitialized"
                    });

                    // Load template by xhr
                    Vue.ajax(config).then(response => {
                        if (utils.getComponentState().content !== "false") {
                            // If on popstate set component from history
                            this.componentShifter(config, success, error);
                            return;
                        }

                        let template = response.data;

                        // Run Vue.component
                        Vue.component(componentName, resolve => {
                            // Resolve response data
                            resolve({
                                template: template
                            });
                        });

                        utils.customEventDispatcher(utils.event.shiftersuccess, response);

                        // Run callback after success
                        utils.execCallback(success, response);

                        // Update component name
                        this[componentName] = null;
                        this[componentName] = componentName;
                    }, response => {
                        utils.customEventDispatcher(utils.event.shiftererror, response);

                        // If has the error callback
                        utils.execCallback(error, response);
                    });
                }
            },
            created: () => {
                utils.historyVersion();
                utils.componentState(false);
            },
            mounted: () => {
                if (typeof options === "object" && typeof options.mounted === "function") {
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
            utils.xhrSend(Vue.ajax.config);
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
            this.config = utils.parseConfigures("GET", url, data, config);
            utils.xhrSend(this.config);
            return this;
        };

        /**
         * Vue.ajax.post()
         * @param {String} url
         * @param {Object} data
         * @param {Object} config
         */
        Vue.ajax.post = function (url, data, config) {
            this.config = utils.parseConfigures("POST", url, data, config);
            utils.xhrSend(this.config);
            return this;
        };

        /**
         * Vue.ajax.head()
         * @param {String} url
         * @param {Object} data
         * @param {Object} config
         */
        Vue.ajax.head = function (url, data, config) {
            this.config = utils.parseConfigures("HEAD", url, data, config);
            utils.xhrSend(this.config);
            return this;
        };

        /**
         * Vue.ajax.put()
         * @param {String} url
         * @param {Object} data
         * @param {Object} config
         */
        Vue.ajax.put = function (url, data, config) {
            this.config = utils.parseConfigures("PUT", url, data, config);
            utils.xhrSend(this.config);
            return this;
        };

        /**
         * Vue.ajax.patch()
         * @param {String} url
         * @param {Object} data
         * @param {Object} config
         */
        Vue.ajax.patch = function (url, data, config) {
            this.config = utils.parseConfigures("PATCH", url, data, config);
            utils.xhrSend(this.config);
            return this;
        };

        /**
         * Vue.ajax.delete()
         * @param {String} url
         * @param {Object} data
         * @param {Object} config
         */
        Vue.ajax.delete = function (url, data, config) {
            this.config = utils.parseConfigures("DELETE", url, data, config);
            utils.xhrSend(this.config);
            return this;
        };

        /**
         * Vue.ajax.jsonp()
         * @param {String} url
         * @param {Object} data
         * @param {Object} config
         */
        Vue.ajax.jsonp = function (url, data, config) {
            this.config = utils.parseConfigures("JSONP", url, data, config);
            utils.xhrSend(this.config);
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