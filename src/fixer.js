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
        this.fixerTop = 0;
        this.fixerBottom = 0;

        // Init
        if (this.prepareOptions()) {
            return this.init();
        }

        return false;
    };

    $.Fixer.defaults = {
        container: undefined,
        from: undefined,
        to: undefined,
        offset: 0,
        reverse: false,
        scrollerDependency: false,
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
        onFixed: undefined,
        onBottom: undefined,
        onReset: undefined
    };

    $.Fixer.prototype = {
        /**
         * Préparation des options utilisateur
         *
         * @return bool
         */
        prepareOptions: function () {
            var self = this;

            // Classes
            $.each(self.settings.classes, function (key, value) {
                if (typeof value === 'string') {
                    self.settings.classes[key] = value.replace(/{prefix}/, self.settings.classes.prefix);
                }
            });

            return true;
        },

        /**
         * Initialisation
         */
        init: function () {
            // Container
            this.elements.container = (this.settings.container !== undefined && this.settings.container.length) ? this.settings.container : this.elements.fixer.parent();

            // Add classes
            this.elements.container.addClass(this.settings.classes.container);
            this.elements.fixer.addClass(this.settings.classes.element);

            // Fixer element
            this.update();

            // Event
            this.requestAnimationFramePolyfill();
            this.eventsHandler();

            return this;
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
         * Update fixer position
         */
        update: function () {
            this.setFixerTop();
            this.setFixerBottom();

            return this;
        },

        /**
         * Détermine le départ du scroll pour fixer l'élement
         */
        setFixerTop: function () {
            if (this.settings.from === undefined) {
                this.fixerTop = parseInt(this.elements.fixer.offset().top);
            } else if (this.settings.from < 0) {
                this.fixerTop = parseInt(this.elements.fixer.offset().top + this.settings.from);
            } else {
                this.fixerTop = parseInt(this.settings.from);
            }

            this.fixerTop -= parseInt(this.settings.offset);

            return this;
        },

        /**
         * Détermine la fin du scroll pour arrêter de fixer l'élément
         */
        setFixerBottom: function () {
            if (this.settings.to === undefined) {
                this.fixerBottom = parseInt(this.elements.container.outerHeight() - this.elements.fixer.outerHeight());
            } else if (this.settings.to < 0) {
                this.fixerBottom = parseInt((this.elements.container.outerHeight() - this.elements.fixer.outerHeight()) + this.settings.to);
            } else {
                this.fixerBottom = parseInt(this.settings.to);
            }

            this.fixerBottom += this.fixerTop;

            return this;
        },

        /**
         * Gestionnaire d'événements
         */
        eventsHandler: function () {
            var self = this;
            var eventsReady = false;

            if (!self.settings.scrollerDependency) {
                $(window).on('scroll.fixer', {self: self}, self.scrollHandler);
            }

            $(window).on('touchstart.fixer', function () {
                if (eventsReady === false) {
                    eventsReady = true;

                    self.elements.container.find(':input').on('focus blur', function () {
                        self.elements.container.toggleClass(self.settings.classes.input);
                    });
                }
            });

            $(window).on('load', function () {
                self.update();
            });

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
            var self = (event.data !== undefined && event.data.self !== undefined) ? event.data.self : this;

            window.requestAnimationFrame(function () {
                self.scrollTop = window.pageYOffset;

                // En mode inverse
                if (self.settings.reverse) {

                    // Si le scroll précédent est supérieur à l'actuel, c'est qu'on remonte la page
                    if (self.previousScrollTop > self.scrollTop && self.scrollTop >= self.fixerTop) {
                        self.toFixed();

                    // Si le scroll défile normalement, on remet à l'état par défaut
                    } else if (self.previousScrollTop < self.scrollTop || self.scrollTop < self.fixerTop) {
                        self.toReset();
                    }

                    self.previousScrollTop = self.scrollTop;

                } else {
                    // Si le scroll est entre le from/to défini, on fixe
                    if (self.scrollTop >= self.fixerTop && self.scrollTop < self.fixerBottom) {
                        self.toFixed();

                    // Si le scroll est supérieur à to, on arrête de fixer
                    } else if (self.scrollTop >= self.fixerBottom) {
                        self.toBottom();

                    // Sinon, on remet à l'état par défaut
                    } else {
                        self.toReset();
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

        /**
         * Fixe l'élément
         */
        toFixed: function () {
            // User callback
            if (this.settings.onFixed !== undefined && this.state !== 'fixed') {
                this.settings.onFixed.call(this);
            }

            // État
            this.elements.container
                .removeClass(this.settings.classes.reset)
                .removeClass(this.settings.classes.bottom)
                .addClass(this.settings.classes.fixed);

            this.state = 'fixed';

            return this;
        },

        /**
         * Place l'élément au bas du conteneur
         */
        toBottom: function () {
            // User callback
            if (this.settings.onBottom !== undefined && this.state !== 'bottom') {
                this.settings.onBottom.call(this);
            }

            // État
            this.elements.container
                .removeClass(this.settings.classes.reset)
                .removeClass(this.settings.classes.fixed)
                .addClass(this.settings.classes.bottom);

            this.state = 'bottom';

            return this;
        },

        /**
         * Remet l'élément à la normale
         */
        toReset: function () {
            // User callback
            if (this.settings.onReset !== undefined && this.state !== 'default') {
                this.settings.onReset.call(this);
            }

            // État
            this.elements.container.removeClass(this.settings.classes.fixed);

            if (this.state === 'fixed') {
                this.elements.container.addClass(this.settings.classes.reset);
            }
            
            this.state = 'default';

            return this;
        }
    };

    $.fn.fixer = function (options) {
        return new $.Fixer($(this), options);
    };
})(jQuery);