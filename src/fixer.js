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
        resizeTimeout: 100,
        autoLoad: true,
        autoUpdate: true,
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
         * Préparation des options utilisateur
         *
         * @return bool
         */
        prepareOptions: function () {
            let self = this;

            // Container
            self.elements.container = (self.settings.container !== undefined && self.settings.container.length) ? self.settings.container : $('body');

            // Start/End
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
            this.elements.container.addClass(this.settings.classes.container);
            this.elements.fixer.addClass(this.settings.classes.element);

            this.eventsHandler();

            return this;
        },

        /**
         * Destruction de Fixer
         */
        destroy: function () {
            this.reset();
            this.setState('default');
            this.elements.container.removeClass(this.settings.classes.container);
            this.elements.fixer.removeClass(this.settings.classes.element);
            $(window).off('.' + this.settings.classes.prefix);

            return this;
        },

        /**
         * Update positions
         */
        update: function () {
            this.setStart();
            this.setEnd();

            return this;
        },

        /**
         * Set start position
         *
         * @param int pos
         */
        setStart: function (pos) {
            this.start = parseInt((pos !== undefined) ? this.elements.container.offset().top + pos : this.elements.fixer.offset().top);

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
         * @returns int
         */
        getStart: function () {
            return this.start;
        },

        /**
         * Set end position
         *
         * @param int pos
         * @param bool addStart
         */
        setEnd: function (pos, addStart) {
            addStart = addStart || true;
            this.end = parseInt((pos !== undefined) ? pos : this.elements.container.height() - this.elements.fixer.height());

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
         * @returns int
         */
        getEnd: function () {
            return this.end;
        },

        /**
         * Set current state information
         *
         * @param string state default, fixed, bottom
         */
        setState: function (state) {
            this.state = state;

            return this;
        },

        /**
         * Get current state
         *
         * @returns string (default, fixed, bottom)
         */
        getState: function () {
            return this.state;
        },

        /**
         * Get current scroll top position
         *
         * @param prev bool get the previous value of scroll top
         * @return int
         */
        getScrollTop: function (prev) {
            prev = prev || false;

            return (prev) ? this.previousScrollTop : this.scrollTop;
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
            let self = (event !== undefined && event.data !== undefined && event.data.self !== undefined) ? event.data.self : this;

            window.requestAnimationFrame(function () {
                self.scrollTop = window.pageYOffset;

                // Reverse mode
                if (self.settings.reverse) {
                    // Si le scroll précédent est supérieur à l'actuel, c'est qu'on remonte la page
                    if (self.getScrollTop('previous') > self.getScrollTop() && self.getScrollTop() >= self.getStart()) {
                        self.fixed();

                    // Si le scroll défile normalement, on remet à l'état par défaut
                    } else if (self.getScrollTop('previous') < self.getScrollTop() || self.getScrollTop() < self.getStart()) {
                        self.reset();
                    }

                    self.previousScrollTop = self.getScrollTop();

                } else {
                    // Si le scroll est entre le start/end défini, on fixe
                    if (self.getScrollTop() > self.getStart() && self.getScrollTop() <= self.getEnd()) {
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
            let self = (event !== undefined && event.data !== undefined && event.data.self !== undefined) ? event.data.self : this;
            let timeout = undefined;

            clearTimeout(timeout);

            timeout = setTimeout(function () {
                // Update positions
                if (self.settings.autoUpdate) {
                    self.update();
                }

                // User callback
                if (self.settings.onResize !== undefined) {
                    self.settings.onResize.call({
                        fixer: self,
                        event: (event.data === undefined) ? event.event : event,
                        start: self.getStart(),
                        end: self.getEnd()
                    });
                }
            }, self.settings.resizeTimeout);

            return self;
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

                // States
                this.elements.container
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
         * Set element to bottom of the container
         */
        bottom: function () {
            if (this.getState() !== 'bottom') {
                // User callback
                if (this.settings.onBottom !== undefined) {
                    this.settings.onBottom.call(this);
                }

                // States
                this.elements.container
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

                // States
                this.elements.container.removeClass(this.settings.classes.fixed);

                if (this.getState() === 'fixed') {
                    this.elements.container.addClass(this.settings.classes.reset);
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