(function ($) {
    'use strict';

    $.Fixer = function (element, options) {
        // Élements
        this.elements = {
            fixer: element,
            container: null
        };

        // Config
        $.extend(true, (this.settings = {}), $.Fixer.defaults, options);

        // Variables
        this.state = 'default';
        this.scrollTop = 0;
        this.previousScrollTop = 0;
        this.start = 0;
        this.end = 0;

        // Init
        if (this.prepareOptions()) {
            return this.init();
        }

        return false;
    };

    $.Fixer.defaults = {
        container: undefined,
        start: undefined,
        end: undefined,
        offset: 0,
        reverse: false,
        scrollEvent: true,
        resizeEvent: true,
        autoLoad: true,
        classes: {
            prefix: 'fixer',
            container: '{prefix}-container',
            element: '{prefix}-element',
            input: 'is-input',
            fixed: 'is-fixed',
            bottom: 'is-bottom',
            reset: 'is-reset'
        },
        afterEventsHandler: undefined,
        onScroll: undefined,
        onResize: undefined,
        onFixed: undefined,
        onBottom: undefined,
        onReset: undefined,
        onChangeState: undefined,
        debug: true
    };

    $.Fixer.prototype = {
        /**
         * Préparation des options utilisateur
         *
         * @return bool
         */
        prepareOptions: function () {
            let self = this;

            // Container
            self.elements.container = (self.settings.container !== undefined && self.settings.container.length) ? self.settings.container : $('body');

            // From/to
            self.setStart(self.settings.start);
            self.setEnd(self.settings.end);

            // Classes
            $.each(self.settings.classes, function (key, value) {
                if (typeof value === 'string') {
                    self.settings.classes[key] = value.replace(/{prefix}/, self.settings.classes.prefix);
                }
            });

            // Debug
            if (self.settings.debug) {
                if (self.settings.onScroll === undefined) {
                    self.settings.onScroll = function () {
                        console.log('scrollTop: ' + this.fixer.scrollTop);
                    }
                }
                if (self.settings.onChangeState === undefined) {
                    self.settings.onChangeState = function () {
                        console.log('state: ' + this.state);
                    }
                }
            }

            return true;
        },

        /**
         * Initialisation
         */
        init: function () {
            // Add classes
            this.elements.container.addClass(this.settings.classes.container);
            this.elements.fixer.addClass(this.settings.classes.element);

            // Event
            // this.requestAnimationFramePolyfill();
            this.eventsHandler();

            return this;
        },

        /**
         * Destruction de Fixer
         */
        destroy: function () {
            let self = this;

            self.state = 'default';
            self.reset();

            $(window).off('.' + self.settings.classes.prefix);

            return self;
        },

        /**
         * Polyfill requestAnimationFrame
         */
        requestAnimationFramePolyfill: function () {
            var lastTime = 0;
            var vendorIndex = 0;
            var vendors = ['o', 'ms', 'moz', 'webkit'];

            for (vendorIndex = 0; vendorIndex < vendors.length && !window.requestAnimationFrame; ++vendorIndex) {
                window.requestAnimationFrame = window[vendors[vendorIndex] + 'RequestAnimationFrame'];
                window.cancelAnimationFrame = window[vendors[vendorIndex] + 'CancelAnimationFrame'] || window[vendors[vendorIndex] + 'CancelRequestAnimationFrame'];
            }

            if (!window.requestAnimationFrame) {
                window.requestAnimationFrame = function (callback) {
                    var currTime = new Date().getTime();
                    var timeToCall = Math.max(0, 16 - (currTime - lastTime));
                    var id = window.setTimeout(function () {
                        callback(currTime + timeToCall);
                    }, timeToCall);

                    lastTime = currTime + timeToCall;

                    return id;
                };
            }

            if (!window.cancelAnimationFrame) {
                window.cancelAnimationFrame = function (id) {
                    clearTimeout(id);
                };
            }
        },

        /**
         * Détermine le départ du scroll pour fixer l'élement
         */
        setStart: function (pos) {
            if (pos !== undefined) {
                this.start = parseInt(pos);

            } else {
                this.start = parseInt(this.elements.fixer.offset().top);
            }

            if (this.settings.debug) {
                console.log('start: ' + this.start);
            }

            return this;
        },
        getStart: function () {
            return this.start;
        },

        /**
         * Détermine la fin du scroll pour arrêter de fixer l'élément
         */
        setEnd: function (pos, addStart = true) {
            if (pos !== undefined) {
                this.end = parseInt(pos);

            } else {
                this.end = parseInt(this.elements.container.height() - this.elements.fixer.height());
            }

            if (addStart !== undefined && addStart === true) {
                this.end += this.getStart();
            }

            if (this.settings.debug) {
                console.log('end: ' + this.end);
            }

            return this;
        },
        getEnd: function () {
            return this.end;
        },

        update: function () {
            this.setStart();
            this.setEnd();
        },

        /**
         * Gestionnaire d'événements
         */
        eventsHandler: function () {
            let self = this;
            let eventsReady = false;

            if (self.settings.scrollEvent) {
                $(window).on('scroll.' + self.settings.classes.prefix, {self: self}, self.scrollHandler);
            }

            $(window).on('touchstart.' + self.settings.classes.prefix, function () {
                if (!eventsReady) {
                    eventsReady = true;

                    self.elements.container.find(':input').on('focus.' + self.settings.classes.prefix + ' blur.' + self.settings.classes.prefix, function () {
                        self.elements.container.toggleClass(self.settings.classes.input);
                    });
                }
            });

            if (self.settings.autoLoad) {
                $(window).on('load.' + self.settings.classes.prefix, {self: self}, self.scrollHandler);
            }

            if (self.settings.resizeEvent) {
                $(window).on('resize.' + self.settings.classes.prefix, {self: self}, self.resizeHandler);
            }

            // User callback
            if (self.settings.afterEventsHandler !== undefined) {
                self.settings.afterEventsHandler.call({
                    fixer: self,
                    elements: self.elements
                });
            }

            return self;
        },

        /**
         * Gestionnaire de scroll
         */
        scrollHandler: function (event) {
            let self = (event !== undefined && event.data !== undefined && event.data.self !== undefined) ? event.data.self : this;

            window.requestAnimationFrame(function () {
                self.scrollTop = window.pageYOffset;

                // En mode inverse
                if (self.settings.reverse) {

                    // Si le scroll précédent est supérieur à l'actuel, c'est qu'on remonte la page
                    if (self.previousScrollTop > self.scrollTop && self.scrollTop >= self.getStart()) {
                        self.fixed();

                    // Si le scroll défile normalement, on remet à l'état par défaut
                    } else if (self.previousScrollTop < self.scrollTop || self.scrollTop < self.getStart()) {
                        self.reset();
                    }

                    self.previousScrollTop = self.scrollTop;

                } else {
                    // Si le scroll est entre le from/to défini, on fixe
                    if (self.scrollTop > self.getStart() && self.scrollTop <= self.getEnd()) {
                        self.fixed();

                    // Si le scroll est supérieur à to, on arrête de fixer
                    } else if (self.scrollTop >= self.getEnd()) {
                        self.bottom();

                    // Sinon, on remet à l'état par défaut
                    } else {
                        self.reset();
                    }
                }

                // User callback
                if (self.settings.onScroll !== undefined) {
                    self.settings.onScroll.call({
                        fixer: self,
                        event: (event.data === undefined) ? event.event : event,
                        state: self.state
                    });
                }
            });

            return self;
        },

        resizeHandler: function (event) {
            let self = (event !== undefined && event.data !== undefined && event.data.self !== undefined) ? event.data.self : this;

            self.update();
        },

        /**
         * Fixe l'élément
         */
        fixed: function () {
            if (this.state !== 'fixed') {
                // User callback
                if (this.settings.onFixed !== undefined) {
                    this.settings.onFixed.call(this);
                }

                // État
                this.elements.container
                    .removeClass(this.settings.classes.reset)
                    .removeClass(this.settings.classes.bottom)
                    .addClass(this.settings.classes.fixed);

                this.state = 'fixed';

                // User callback
                if (this.settings.onChangeState !== undefined) {
                    this.settings.onChangeState.call({
                        fixer: this,
                        state: this.state
                    });
                }
            }

            return this;
        },

        /**
         * Place l'élément à la position de fin
         */
        bottom: function () {
            if (this.state !== 'bottom') {
                // User callback
                if (this.settings.onBottom !== undefined) {
                    this.settings.onBottom.call(this);
                }

                // État
                this.elements.container
                    .removeClass(this.settings.classes.reset)
                    .removeClass(this.settings.classes.fixed)
                    .addClass(this.settings.classes.bottom);

                this.state = 'bottom';

                // User callback
                if (this.settings.onChangeState !== undefined) {
                    this.settings.onChangeState.call({
                        fixer: this,
                        state: this.state
                    });
                }
            }

            return this;
        },

        /**
         * Remet l'élément à la normale
         */
        reset: function () {
            if (this.state !== 'default') {
                // User callback
                if (this.settings.onReset !== undefined) {
                    this.settings.onReset.call(this);
                }

                // État
                this.elements.container.removeClass(this.settings.classes.fixed);

                if (this.state === 'fixed') {
                    this.elements.container.addClass(this.settings.classes.reset);
                }

                this.state = 'default';

                // User callback
                if (this.settings.onChangeState !== undefined) {
                    this.settings.onChangeState.call({
                        fixer: this,
                        state: this.state
                    });
                }
            }

            return this;
        }
    };

    $.fn.fixer = function (options) {
        return new $.Fixer($(this), options);
    };
})(jQuery);