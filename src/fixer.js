(function ($) {
    'use strict';

    $.Fixer = function (element, options) {
        // Elements
        this.elements = {
            fixer: element,
            container: null
        };

        // Config
        $.extend(true, this.settings = {}, $.Fixer.defaults, options);

        // Variables
        this.state = 'default';
        this.scrollTop = {
            'current': 0,
            'previous': 0
        };
        this.start = 0;
        this.end = 0;
        this.resizeTimeout = undefined;
        this.fixerHeight = 0;

        // Init
        if (this.prepareOptions()) {
            return this.init();
        }

        return this;
    };

    $.Fixer.defaults = {
        container: undefined,
        start: undefined,
        end: undefined,
        offset: 0,
        reverse: false,
        scrollEvent: true,
        resizeEvent: false,
        resizeTimeout: 100,
        autoLoad: true,
        autoUpdate: false,
        autoPadding: true,
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
        debug: false
    };

    $.Fixer.prototype = {
        /**
         * Prepare user options
         *
         * @return boolean
         */
        prepareOptions: function () {
            var self = this;

            // Container
            self.setContainer(self.settings.container !== undefined && self.settings.container.length ? self.settings.container : $('body'));

            // Start/End
            self.setStart(self.settings.start);
            self.setEnd(self.settings.end);

            // Auto-padding seulement sur <body>
            if (self.settings.autoPadding && self.getContainer().is('body')) {
                self.fixerHeight = Math.round(self.getFixer().height());
            }

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
                        console.log('scrollTop: ' + this.fixer.getScrollTop());
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
         * Init Fixer
         */
        init: function () {
            this.getContainer().addClass(this.settings.classes.container);
            this.getFixer().addClass(this.settings.classes.element);

            this.eventsHandler();

            return this;
        },

        /**
         * Destroy Fixer
         */
        destroy: function () {
            this.reset();
            this.setState('default');
            this.getContainer().removeClass(this.settings.classes.container);
            this.getFixer().removeClass(this.settings.classes.element);
            $(window).off('.' + this.settings.classes.prefix);

            return this;
        },

        /**
         * Set current container
         *
         * @param container jQuery object
         */
        setContainer: function (container) {
            this.elements.container = container;

            return this;
        },

        /**
         * Get current container
         */
        getContainer: function () {
            return this.elements.container;
        },

        /**
         * Set fixer element
         *
         * @param element jQuery object
         */
        setFixer: function (element) {
            this.elements.fixer = element;

            return this;
        },

        /**
         * Get fixer element
         */
        getFixer: function () {
            return this.elements.fixer;
        },

        /**
         * Set start position
         *
         * @param position (int)
         */
        setStart: function (position) {
            this.start = parseInt(position === undefined ? this.getFixer().offset().top : this.getContainer().offset().top + position);

            if (this.settings.offset) {
                this.start -= parseInt(this.settings.offset);
            }

            if (this.settings.debug) {
                console.log('start: ' + this.getStart());
            }

            return this;
        },

        /**
         * Get start position
         *
         * @return int
         */
        getStart: function () {
            return this.start;
        },

        /**
         * Set end position
         *
         * @param position (int)
         * @param addStart (boolean)
         */
        setEnd: function (position, addStart) {
            addStart = addStart || true;
            this.end = parseInt(position === undefined ? this.getContainer().height() - this.getFixer().height() : position);

            if (addStart !== undefined && addStart === true) {
                this.end += this.getStart();
            }

            if (this.settings.offset) {
                this.end -= parseInt(this.settings.offset);
            }

            if (this.settings.debug) {
                console.log('end: ' + this.getEnd());
            }

            return this;
        },

        /**
         * Get end position
         *
         * @return int
         */
        getEnd: function () {
            return this.end;
        },

        /**
         * Set current state information
         *
         * @param state (string) default, fixed, bottom
         */
        setState: function (state) {
            this.state = state;

            return this;
        },

        /**
         * Get current state
         *
         * @return string (default, fixed, bottom)
         */
        getState: function () {
            return this.state;
        },

        /**
         * Set current scroll top position
         *
         * @param type (string) current, previous
         * @param position (int)
         */
        setScrollTop: function (type, position) {
            this.scrollTop[type] = parseInt(position);

            return this;
        },

        /**
         * Get current scroll top position
         *
         * @param type (string) current, previous. current per default
         *
         * @return int
         */
        getScrollTop: function (type) {
            type = type || 'current';

            return this.scrollTop[type];
        },

        /**
         * Events
         */
        eventsHandler: function () {
            var self = this;
            var eventsReady = false;

            if (self.settings.scrollEvent) {
                $(window).on('scroll.' + self.settings.classes.prefix, {self: self}, self.scrollHandler);
            }

            $(window).on('touchstart.' + self.settings.classes.prefix, function () {
                if (!eventsReady) {
                    eventsReady = true;

                    self.getContainer().on('focus.' + self.settings.classes.prefix + ' blur.' + self.settings.classes.prefix, ':input', function () {
                        self.getContainer().toggleClass(self.settings.classes.input);
                    });
                }
            });

            if (self.settings.autoLoad) {
                $(window).on('load.' + self.settings.classes.prefix, {self: self}, self.scrollHandler);
            }

            if (self.settings.resizeEvent) {
                $(window).on('resize.' + self.settings.classes.prefix + ' orientationchange.' + self.settings.classes.prefix, {self: self}, self.resizeHandler);
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
         * Event scroll
         *
         * @param event
         */
        scrollHandler: function (event) {
            var self = (event !== undefined && event.data !== undefined && event.data.self !== undefined) ? event.data.self : this;

            window.requestAnimationFrame(function () {
                self.setScrollTop('current', window.pageYOffset);

                // Reverse mode
                if (self.settings.reverse) {
                    // Si le scroll précédent est supérieur à l'actuel, c'est qu'on remonte la page
                    if (self.getScrollTop('previous') > self.getScrollTop() && self.getScrollTop() >= self.getStart()) {
                        self.fixed();
                    }
                    // Si le scroll défile normalement, on remet à l'état par défaut
                    else if (self.getScrollTop('previous') < self.getScrollTop() || self.getScrollTop() < self.getStart()) {
                        self.reset();
                    }

                    self.setScrollTop('previous', self.getScrollTop());
                }
                // Default mode
                else {
                    // Si le scroll est entre le start/end défini, on fixe
                    if (self.getScrollTop() > self.getStart() && self.getScrollTop() <= self.getEnd()) {
                        self.fixed();
                    }
                    // Si le scroll est supérieur à to, on arrête de fixer
                    else if (self.getScrollTop() >= self.getEnd()) {
                        self.bottom();
                    }
                    // Sinon, on remet à l'état par défaut
                    else {
                        self.reset();
                    }
                }

                // User callback
                if (self.settings.onScroll !== undefined) {
                    self.settings.onScroll.call({
                        fixer: self,
                        event: event.data === undefined ? event.event : event,
                        state: self.getState()
                    });
                }
            });

            return self;
        },

        /**
         * Event resize
         *
         * @param event
         */
        resizeHandler: function (event) {
            var self = (event !== undefined && event.data !== undefined && event.data.self !== undefined) ? event.data.self : this;

            clearTimeout(self.resizeTimeout);

            self.resizeTimeout = setTimeout(function () {
                // Update positions
                if (self.settings.autoUpdate) {
                    self.update();
                }

                // User callback
                if (self.settings.onResize !== undefined) {
                    self.settings.onResize.call({
                        fixer: self,
                        event: event.data === undefined ? event.event : event,
                        start: self.getStart(),
                        end: self.getEnd()
                    });
                }
            }, self.settings.resizeTimeout);

            return self;
        },

        /**
         * Update positions
         */
        update: function () {
            this.setStart(0);
            this.setEnd();

            return this;
        },

        /**
         * Stick element
         */
        fixed: function () {
            if (this.getState() !== 'fixed') {
                // User callback
                if (this.settings.onFixed !== undefined) {
                    this.settings.onFixed.call(this);
                }

                // Auto-padding
                if (this.settings.autoPadding && this.fixerHeight !== 0) {
                    this.getContainer().css('padding-top', this.fixerHeight);
                }

                // States
                this.getContainer()
                    .removeClass(this.settings.classes.reset)
                    .removeClass(this.settings.classes.bottom)
                    .addClass(this.settings.classes.fixed);

                this.setState('fixed');

                // User callback
                if (this.settings.onChangeState !== undefined) {
                    this.settings.onChangeState.call({
                        fixer: this,
                        state: this.getState()
                    });
                }
            }

            return this;
        },

        /**
         * Stick element on bottom of the container
         */
        bottom: function () {
            if (this.getState() !== 'bottom') {
                // User callback
                if (this.settings.onBottom !== undefined) {
                    this.settings.onBottom.call(this);
                }

                // States
                this.getContainer()
                    .removeClass(this.settings.classes.reset)
                    .removeClass(this.settings.classes.fixed)
                    .addClass(this.settings.classes.bottom);

                this.setState('bottom');

                // User callback
                if (this.settings.onChangeState !== undefined) {
                    this.settings.onChangeState.call({
                        fixer: this,
                        state: this.getState()
                    });
                }
            }

            return this;
        },

        /**
         * Reset element
         */
        reset: function () {
            if (this.getState() !== 'default') {
                // User callback
                if (this.settings.onReset !== undefined) {
                    this.settings.onReset.call(this);
                }

                // Auto-padding
                if (this.settings.autoPadding && this.fixerHeight !== 0) {
                    this.getContainer().css('padding-top', 0);
                }

                // States
                this.getContainer().removeClass(this.settings.classes.fixed);

                if (this.getState() === 'fixed') {
                    this.getContainer().addClass(this.settings.classes.reset);
                }

                this.setState('default');

                // User callback
                if (this.settings.onChangeState !== undefined) {
                    this.settings.onChangeState.call({
                        fixer: this,
                        state: this.getState()
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