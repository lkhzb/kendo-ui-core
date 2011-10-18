(function($, undefined) {
    var location            = window.location,
        history             = window.history,
        _checkUrlInterval    = 50,
        hashStrip           = /^#*/,
        documentMode        = window.document.documentMode,
        oldIE               = $.browser.msie && (!documentMode || documentMode <= 8),
        hashChangeSupported = ("onhashchange" in window) && !oldIE,
        document            = window.document;


    var History = kendo.Observable.extend({

        start: function(options) {
            options = options || {};

            var that = this;

            that._pushStateRequested = !!options["pushState"];
            that._pushState = that._pushStateRequested && that._pushStateSupported();
            that.current = "";
            that.root = options["root"] || "/";


            if (that._normalizeUrl()) {
                return true;
            }

            that._listenToLocationChange();
            that._checkUrl();
        },

        _normalizeUrl: function() {
            var that = this,
                pushStateUrl,
                atRoot = that.root == location.pathname,
                pushStateUrlNeedsTransform = that._pushStateRequested && !that._pushStateSupported() && !atRoot,
                hashUrlNeedsTransform = that._pushState && atRoot && location.hash;

            if (pushStateUrlNeedsTransform) {
                location.replace(that.root + '#' + that._stripRoot(location.pathname));
                return true;
            } else if (hashUrlNeedsTransform) {
                pushStateUrl = that._makePushStateUrl(location.hash.replace(hashStrip, ''));
                history.replaceState({}, document.title, pushStateUrl);
                return false;
            }
            return false;
        },

        _listenToLocationChange: function() {
            var that = this, _checkUrlProxy = $.proxy(that._checkUrl, that);

            if (this._pushState) {
                $(window).bind("popstate", _checkUrlProxy);
            } else if (hashChangeSupported) {
                $(window).bind("hashchange", _checkUrlProxy);
            } else {
                setInterval(_checkUrlProxy, _checkUrlInterval);
            }
        },

        _pushStateSupported: function() {
            return window.history && window.history.pushState;
        },

        _checkUrl: function(e) {
            var that = this, current = that._currentLocation();

            if (current != that.current) {
                that.navigate(current);
            }
        },

        _stripRoot: function(url) {
            var that = this;

            if (url.indexOf(that.root) === 0) {
                return ('/' + url.substr(that.root.length)).replace(/\/\//g, '/');
            } else {
                return url;
            }
        },


        _makePushStateUrl: function(address) {
            var that = this;

            if (address.indexOf(that.root) != 0) {
                address = (that.root + address).replace(/\/\//g, '/');
            }

            return location.protocol + '//' + location.host + address;
        },

        _currentLocation: function() {
            var that = this, current;

            if (that._pushState) {
                current = location.pathname;

                if (location.search) {
                    current += location.search;
                }

                return that._stripRoot(current);
            } else {
                return location.hash.replace(hashStrip, '') || '/';
            }
        },

        change: function(callback) {
            this.bind('change', callback);
        },

        navigate: function(to, silent) {
            var that = this;

            to = to.replace(hashStrip, '');

            if (that.current === to || that.current === decodeURIComponent(to)) {
                return;
            }

            if (that._pushState) {
                history.pushState({}, document.title, that._makePushStateUrl(to));
                that.current = to;
            } else {
                location.hash = that.current = to;
            }

            if (!silent) {
                that.trigger("change", { location: that.current });
            }
        }
    });

    kendo.history = new History();
})(jQuery);
