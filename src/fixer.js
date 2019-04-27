(function ($) {
    'use strict';

    /**
     * Fixer
     *
     * @param {object} element
     * @param {object=undefined} options
     *
     * @return {$.Fixer}
     */
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
        this.fixerWidth = 0;
        this.fixerPosition = 0;
        this.windowSize = {
            'width': 0,
            'height': 0
        };

        // Init
        if (this.prepareOptions()) {
            this.init();
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
        autoDisable: true,
        autoUpdate: false,
        autoPadding: false,
        autoWidth: false,
        autoPosition: false,
        classes: {
            prefix: 'fixer',
            container: '{prefix}-container',
            element: '{prefix}-element',
            input: 'is-input',
            fixed: 'is-fixed',
            bottom: 'is-bottom',
            reset: 'is-reset',
            disabled: 'is-disabled'
        },
        afterEventsHandler: undefined,
        onScroll: undefined,
        onResize: undefined,
        onFixed: undefined,
        onBottom: undefined,
        onReset: undefined,
        onDisable: undefined,
        onChangeState: undefined
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

            // Classes
            $.each(self.settings.classes, function (key, value) {
                if (typeof value === 'string') {
                    self.settings.classes[key] = value.replace(/{prefix}/, self.settings.classes.prefix);
                }
            });

            return true;
        },

        /**
         * Set current container
         *
         * @param {object} container jQuery object
         */
        setContainer: function (container) {
            this.elements.container = container;

            return this;
        },

        /**
         * Get current container
         *
         * @return {object}
         */
        getContainer: function () {
            return this.elements.container;
        },

        /**
         * Set fixer element
         *
         * @param {object} element jQuery object
         */
        setFixer: function (element) {
            this.elements.fixer = element;

            return this;
        },

        /**
         * Get fixer element
         *
         * @return {object}
         */
        getFixer: function () {
            return this.elements.fixer;
        },

        /**
         * Set start position
         *
         * @param {int} position
         */
        setStart: function (position) {
            this.start = parseInt(position === undefined ? this.getFixer().offset().top : this.getContainer().offset().top + position);

            if (this.settings.offset) {
                this.start -= parseInt(this.settings.offset);
            }

            return this;
        },

        /**
         * Get start position
         *
         * @return {int}
         */
        getStart: function () {
            return this.start;
        },

        /**
         * Set end position
         *
         * @param {int} position
         * @param {boolean=true} addStart
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

            return this;
        },

        /**
         * Get end position
         *
         * @return {int}
         */
        getEnd: function () {
            return this.end;
        },

        /**
         * Set current height
         */
        setHeight: function () {
            this.fixerHeight = this.getFixer().height();

            return this;
        },

        /**
         * Get current height
         *
         * @return {number}
         */
        getHeight: function () {
            return this.fixerHeight;
        },

        /**
         * Set current width
         */
        setWidth: function () {
            if (this.getState() === 'fixed') {
                this.getFixer().css({
                    'position': '',
                    'width': ''
                });
            }

            this.fixerWidth = this.getFixer().width();

            if (this.getState() === 'fixed') {
                this.getFixer().css({
                    'width': this.getWidth()
                });
            }

            return this;
        },

        /**
         * Get current width
         *
         * @return {number}
         */
        getWidth: function () {
            return this.fixerWidth;
        },

        /**
         * Set current position from left or right
         */
        setPosition: function () {
            if (this.getState() === 'fixed') {
                this.getFixer().css({
                    'position': '',
                    'left': ''
                });
            }

            this.fixerPosition = this.getFixer().offset().left;

            if (this.getState() === 'fixed') {
                this.getFixer().css({
                    'left': this.getPosition()
                });
            }

            return this;
        },

        /**
         * Get current position
         *
         * @return {number}
         */
        getPosition: function () {
            return this.fixerPosition;
        },

        /**
         * Set current window size
         */
        setWindowSize: function () {
            return this.windowSize = {
                'width': window.innerWidth,
                'height': window.innerHeight
            };
        },

        /**
         * Get current window size
         *
         * @return {object}
         */
        getWindowSize: function () {
            return this.windowSize;
        },

        /**
         * Set current state information
         *
         * @param {string} state default, fixed, bottom, disabled
         */
        setState: function (state) {
            this.state = state;

            return this;
        },

        /**
         * Get current state
         *
         * @return {string}
         */
        getState: function () {
            return this.state;
        },

        /**
         * Set current scroll top position
         *
         * @param {string} type current, previous
         * @param {int|string} position
         */
        setScrollTop: function (type, position) {
            this.scrollTop[type] = parseInt(position);

            return this;
        },

        /**
         * Get current scroll top position
         *
         * @param {string} type current, previous. current per default
         *
         * @return {int}
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
         * @param {object=undefined} event
         */
        scrollHandler: function (event) {
            var self = (event !== undefined && event.data !== undefined && event.data.self !== undefined) ? event.data.self : this;

            window.requestAnimationFrame(function () {
                if (self.getState() !== 'disabled') {
                    self.setScrollTop('current', window.pageYOffset);

                    // Check resize fixer
                    if (self.settings.autoUpdate && self.getHeight() !== self.getFixer().height()) {
                        self.resizeHandler();
                    }

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
                }
            });

            return self;
        },

        /**
         * Event resize
         *
         * @param {object=undefined} event
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
         * Handle for auto disable fixer
         */
        disableHandler: function () {
            this.setWindowSize();

            if (this.getHeight() >= this.getWindowSize().height) {
                this.disable();

            } else if (this.getState() === 'disabled') {
                this.reset();
                this.scrollHandler();
            }

            return this;
        },

        /**
         * Init Fixer
         */
        init: function () {
            this.getContainer()
                .addClass(this.settings.classes.container)
                .removeClass(this.settings.classes.disabled);
            this.getFixer().addClass(this.settings.classes.element);

            // Start/End
            this.setStart(this.settings.start);
            this.setEnd(this.settings.end);
            this.setHeight();

            // Auto
            if (this.settings.autoWidth) {
                this.setWidth();
            }
            if (this.settings.autoPosition) {
                this.setPosition();
            }
            if (this.settings.autoDisable) {
                this.disableHandler();
            }

            // Events
            this.eventsHandler();

            return this;
        },

        /**
         * Update positions
         */
        update: function () {
            this.setStart(this.settings.start);
            this.setEnd(this.settings.end);
            this.setHeight();

            // Auto
            if (this.settings.autoWidth) {
                this.setWidth();
            }
            if (this.settings.autoPosition) {
                this.setPosition();
            }
            if (this.settings.autoDisable) {
                this.disableHandler();
            }

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

                // Auto
                if (this.settings.autoPadding && this.getHeight() !== 0) {
                    this.getContainer().css('padding-top', this.getHeight());
                }
                if (this.settings.autoWidth && this.getWidth() !== 0) {
                    this.getFixer().css('width', this.getWidth());
                }
                if (this.settings.autoPosition) {
                    this.getFixer().css('left', this.getPosition());
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

                // Auto
                if (this.settings.autoWidth) {
                    this.getFixer().css('width', '');
                }
                if (this.settings.autoPosition) {
                    this.getFixer().css('left', '');
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

                // Auto
                if (this.settings.autoPadding) {
                    this.getContainer().css('padding-top', '');
                }
                if (this.settings.autoWidth) {
                    this.getFixer().css('width', '');
                }
                if (this.settings.autoPosition) {
                    this.getFixer().css('left', '');
                }

                // States
                this.getContainer()
                    .removeClass(this.settings.classes.bottom)
                    .removeClass(this.settings.classes.fixed);

                if (this.getState() === 'fixed') {
                    this.getContainer().addClass(this.settings.classes.reset);
                }
                if (this.getState() === 'disabled') {
                    this.getContainer().removeClass(this.settings.classes.disabled);
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
        },

        /**
         * Disable Fixer
         */
        disable: function () {
            this.reset();
            this.setState('disabled');
            this.getContainer().addClass(this.settings.classes.disabled);

            // User callback
            if (this.settings.onDisable !== undefined) {
                this.settings.onDisable.call({
                    fixer: this,
                    state: this.getState()
                });
            }
        },

        /**
         * Destroy Fixer
         */
        destroy: function () {
            this.reset();
            this.setState('default');
            this.getContainer()
                .removeClass(this.settings.classes.container)
                .removeClass(this.settings.classes.disabled)
                .removeClass(this.settings.classes.input);
            this.getFixer().removeClass(this.settings.classes.element);
            $(window).off('.' + this.settings.classes.prefix);

            return this;
        }
    };

    $.fn.fixer = function (options) {
        return new $.Fixer($(this), options);
    };
})(jQuery);