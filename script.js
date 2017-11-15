var releaseApp = angular.module('releaseApp', ['ngAnimate', 'ui.bootstrap']);
releaseApp.controller('releaseCtrl', function($scope, $http, $filter) {
    $scope.data = [];
    $scope.titleQuery = '';
    $http.get('compiled.json').then(function(response) {
        $scope.data = $scope.sortMe(response.data, 'name', true);
    });
    $scope.isCollapsed = true;
    $scope.resetHeight = false;
    $scope.type = [];

    $http.get('tags.json').then(function(response) {
        $scope.tags = angular.fromJson(response.data);
    });

    $http.get('songs.json').then(function(response) {
        $scope.songs = angular.fromJson(response.data);
        $scope.songID = Math.floor(Math.random() * 19);
    });

    $scope.$watch(function() {
        return angular.element(document.querySelector('#collapseTags')).attr('class');
    }, function(newValue) {
        if (newValue == 'collapse' || newValue == 'in collapse') $scope.resetHeight = !$scope.resetHeight;
    });

    $scope.sortMe = function(items, field, reverse) {
        var filtered = [];
        var unknown = [];
        angular.forEach(items, function(item) {
            filtered.push(item);
        });
        filtered.sort(function(a, b) {
            return a['name'].localeCompare(b['name']);
        });
        if (reverse) filtered.reverse();
        return filtered;
    };

    $scope.tagToggle = function($event, item) {
        if (item['toggle'] == 0) {
            item['toggle'] = 1;
            angular.element(event.target).addClass('btn-toggle-1');
        } else if (item['toggle'] == 1) {
            item['toggle'] = 2;
            angular.element(event.target).removeClass('btn-toggle-1');
            angular.element(event.target).addClass('btn-toggle-2');
        } else if (item['toggle'] == 2) {
            item['toggle'] = 0;
            angular.element(event.target).removeClass('btn-toggle-2');
        }
    }

});

releaseApp.filter('proFilter', ['$filter', function($filter) {
    return function(items, field, value, tags, value2) {
        var filtered = [];
        var toHave = [];
        var notHave = [];
        var i = 0;
        var j = 0;
        var k = 0;
        var notHavePass;
        var toHaveCount;
        var toHavePass;
        for (i = 0; (tags !== undefined) && (i < tags.length); i++) {
            if (tags[i][value2] == 1) toHave.push(tags[i]['name']);
            else if (tags[i][value2] == 2) notHave.push(tags[i]['name']);
        };

        for (i = 0; i < items.length; i++) {
            notHavePass = true;
            toHaveCount = 0;
            toHavePass = true;
            if (items[i][field].toLowerCase().indexOf(value.toLowerCase()) > -1) {
                for (j = 0; j < items[i]['tags'].length; j++) {
                    for (k = 0;
                        (k < notHave.length) && (notHavePass); k++) {
                        if (items[i]['tags'][j]['tag'] == notHave[k]) notHavePass = false;
                    };
                    if (notHavePass) {
                        for (k = 0; k < toHave.length; k++) {
                            console.log(items[i]['tags'][j]['tag']);
                            if (items[i]['tags'][j]['tag'] == "Any" && (toHave[k]=="Dark Lord" || toHave[k]=="Blader" || toHave[k]=="War Mage" || toHave[k]=="Whisperer")) toHaveCount++;
                            else if (items[i]['tags'][j]['tag'] == toHave[k]) toHaveCount++;
                        };
                    };
                };
                if (toHaveCount < toHave.length) toHavePass = false;
                if (notHavePass && toHavePass) filtered.push(items[i]);
            };
        };
        return filtered;
    };
}]);

releaseApp.directive('uibCollapse', ['$animate', '$q', '$parse', '$injector', function($animate, $q, $parse, $injector) {
    var $animateCss = $injector.has('$animateCss') ? $injector.get('$animateCss') : null;
    return {
        link: function(scope, element, attrs) {
            var expandingExpr = $parse(attrs.expanding),
                expandedExpr = $parse(attrs.expanded),
                collapsingExpr = $parse(attrs.collapsing),
                collapsedExpr = $parse(attrs.collapsed),
                horizontal = false,
                css = {},
                cssTo = {};

            init();

            function init() {
                horizontal = !!('horizontal' in attrs);
                if (horizontal) {
                    css = {
                        width: ''
                    };
                    cssTo = {
                        width: '0'
                    };
                } else {
                    css = {
                        height: ''
                    };
                    cssTo = {
                        height: '0'
                    };
                }
                if (!scope.$eval(attrs.uibCollapse)) {
                    element.addClass('in')
                        .addClass('collapse')
                        .attr('aria-expanded', true)
                        .attr('aria-hidden', false)
                        .css(css);
                }
            }

            function getScrollFromElement(element) {
                if (horizontal) {
                    return {
                        width: element.scrollWidth + 'px'
                    };
                }
                return {
                    height: element.scrollHeight + 'px'
                };
            }

            function expand() {
                if (element.hasClass('collapse') && element.hasClass('in')) {
                    return;
                }

                $q.resolve(expandingExpr(scope))
                    .then(function() {
                        element.removeClass('collapse')
                            .addClass('collapsing')
                            .attr('aria-expanded', true)
                            .attr('aria-hidden', false);

                        if ($animateCss) {
                            $animateCss(element, {
                                addClass: 'in',
                                easing: 'ease',
                                css: {
                                    overflow: 'hidden'
                                },
                                to: getScrollFromElement(element[0])
                            }).start()['finally'](expandDone);
                        } else {
                            $animate.addClass(element, 'in', {
                                css: {
                                    overflow: 'hidden'
                                },
                                to: getScrollFromElement(element[0])
                            }).then(expandDone);
                        }
                    }, angular.noop);
            }

            function expandDone() {
                element.removeClass('collapsing')
                    .addClass('collapse')
                    .css(css);
                expandedExpr(scope);
            }

            function collapse() {
                if (!element.hasClass('collapse') && !element.hasClass('in')) {
                    return collapseDone();
                }

                $q.resolve(collapsingExpr(scope))
                    .then(function() {
                        element
                            // IMPORTANT: The width must be set before adding "collapsing" class.
                            // Otherwise, the browser attempts to animate from width 0 (in
                            // collapsing class) to the given width here.
                            .css(getScrollFromElement(element[0]))
                            // initially all panel collapse have the collapse class, this removal
                            // prevents the animation from jumping to collapsed state
                            .removeClass('collapse')
                            .addClass('collapsing')
                            .attr('aria-expanded', false)
                            .attr('aria-hidden', true);

                        if ($animateCss) {
                            $animateCss(element, {
                                removeClass: 'in',
                                to: cssTo
                            }).start()['finally'](collapseDone);
                        } else {
                            $animate.removeClass(element, 'in', {
                                to: cssTo
                            }).then(collapseDone);
                        }
                    }, angular.noop);
            }

            function collapseDone() {
                element.css(cssTo); // Required so that collapse works when animation is disabled
                element.removeClass('collapsing')
                    .addClass('collapse');
                collapsedExpr(scope);
            }

            scope.$watch(attrs.uibCollapse, function(shouldCollapse) {
                if (shouldCollapse) {
                    collapse();
                } else {
                    expand();
                }
            });
        }
    };
}]);

releaseApp.directive('ngStretch', ['$window', '$timeout', function($window, $timeout) {
    return {
        restrict: 'EA',
        link: function(scope, element, attr) {
            scope.$watch('resetHeight', function(val) {
                var windowElement = angular.element($window);
                var bottomElement, topElement;
                var minHeight, minAction;
                var maxHeight, maxAction;

                var origCss = {
                    top: element[0].style.top,
                    height: element[0].style.height
                };
                var enabled;
                var stretchListener;

                attr.$observe('ngStretch', setBottom);
                attr.$observe('ngStretchTop', setTop);
                attr.$observe('ngStretchMin', setMin);
                attr.$observe('ngStretchMinAction', setMinAction);
                attr.$observe('ngStretchMax', setMax);
                attr.$observe('ngStretchMaxAction', setMaxAction);
                attr.$observe('ngStretchEnabled', setEnabled);
                setEnabled(attr['ngStretchEnabled']);

                element.on('$destroy', function() {
                    setEnabled(false);
                });

                function resetCSS() {
                    for (var prop in origCss) {
                        element.css(prop, origCss[prop]);
                    }
                }

                function setMin(stretchMin) {
                    minHeight = parseFloat(stretchMin);
                    checkSize();
                }

                function setMinAction(stretchMinAction) {
                    if (angular.isDefined(stretchMinAction)) {
                        stretchMinAction = scope.$eval(stretchMinAction);
                    }
                    minAction = stretchMinAction;
                }

                function setMax(stretchMax) {
                    maxHeight = parseFloat(stretchMax);
                    checkSize();
                }

                function setMaxAction(stretchMaxAction) {
                    if (angular.isDefined(stretchMaxAction)) {
                        stretchMaxAction = scope.$eval(stretchMaxAction);
                    }
                    maxAction = stretchMaxAction;
                }

                function setEnabled(stretchEnabled) {
                    if (angular.isDefined(stretchEnabled)) {
                        if (stretchEnabled !== true && stretchEnabled !== false) {
                            stretchEnabled = scope.$eval(stretchEnabled);
                        }
                    } else {
                        stretchEnabled = true;
                    }
                    if (enabled != stretchEnabled) {
                        enabled = stretchEnabled;
                        if (!enabled) {
                            windowElement.off('resize', checkSize);
                            windowElement.off('scroll', checkSize);
                            if (angular.isFunction(stretchListener)) {
                                stretchListener();
                                stretchListener = undefined;
                            }
                            resetCSS();
                            element.triggerHandler('stretch', {
                                height: element[0].clientHeight,
                                old_height: element[0].clientHeight
                            });
                        } else {
                            windowElement.on('resize', checkSize);
                            windowElement.on('scroll', checkSize);
                            if (angular.isUndefined(stretchListener)) {
                                stretchListener = scope.$on('stretchShouldApply', checkSize);
                            }
                            element.ready(checkSize);
                            $timeout(checkSize);
                        }
                    }
                }

                function getElement(query) {
                    return document.querySelector(query);
                }

                function setBottom(query) {
                    if (query) {
                        var getBottom = getElement(query);
                        if (getBottom) {
                            bottomElement = angular.element(getBottom);
                        }
                    } else {
                        bottomElement = undefined;
                    }
                }

                function setTop(query) {
                    if (query) {
                        var getTop = getElement(query);
                        if (getTop) {
                            topElement = angular.element(getTop);
                        }
                    } else {
                        topElement = undefined;
                    }
                }

                function isFixed(check) {
                    var style = $window.getComputedStyle(check.length ? check[0] : check);
                    return (style && style.position == 'fixed');
                }

                function checkSize() {
                    if (!enabled) {
                        return;
                    }
                    $timeout(function() {
                        if (!enabled) {
                            return;
                        }
                        var elemBounds = element[0].getBoundingClientRect();

                        if (topElement) {
                            var topElemBounds = topElement[0].getBoundingClientRect();
                            if (topElemBounds.bottom < 0 && isFixed(element)) {
                                element.css('top', '0px');
                                elemBounds = element[0].getBoundingClientRect();
                            } else {
                                var topDiff = topElemBounds.bottom - elemBounds.top;
                                if (topDiff) {
                                    element.css('top', (element[0].offsetTop + topDiff) + 'px');
                                    elemBounds = element[0].getBoundingClientRect();
                                }
                            }
                        }

                        var windowHeight = windowElement[0].innerHeight;
                        var heightDiff = windowHeight - elemBounds.bottom;

                        if (bottomElement) {
                            var bottomElemBounds = bottomElement[0].getBoundingClientRect();
                            if (bottomElemBounds.top < windowHeight) {
                                heightDiff = bottomElemBounds.top - elemBounds.bottom;
                            }
                        }

                        // calculate newHeight
                        var newHeight = element[0].clientHeight + heightDiff;

                        // check min-stretch bounds
                        if (angular.isDefined(minHeight) && !isNaN(minHeight) && newHeight <= minHeight) {
                            newHeight = minHeight;
                            if (element[0].clientHeight != minHeight) {
                                element.addClass('stretch-min');
                                if (angular.isDefined(minAction) && angular.isFunction(minAction)) {
                                    minAction(true, minHeight);
                                }
                            }
                        } else if (element.hasClass('stretch-min')) {
                            element.removeClass('stretch-min');
                            if (angular.isDefined(minAction) && angular.isFunction(minAction)) {
                                minAction(false, minHeight);
                            }
                        }

                        // check max-stretch bounds
                        if (angular.isDefined(maxHeight) && !isNaN(maxHeight) && newHeight >= maxHeight) {
                            newHeight = maxHeight;
                            if (element[0].clientHeight != maxHeight) {
                                element.addClass('stretch-max');
                                if (angular.isDefined(maxAction) && angular.isFunction(maxAction)) {
                                    maxAction(true, maxHeight);
                                }
                            }
                        } else if (element.hasClass('stretch-max')) {
                            element.removeClass('stretch-max');
                            if (angular.isDefined(maxAction) && angular.isFunction(maxAction)) {
                                maxAction(false, maxHeight);
                            }
                        }

                        // update element's height if different from newHeight
                        if (element[0].clientHeight != newHeight) {
                            var oldHeight = element[0].clientHeight;
                            element.css('height', newHeight + 'px');
                            element.triggerHandler('stretch', {
                                height: newHeight,
                                old_height: oldHeight
                            });
                        }
                    });
                }
            });
        }
    };
}]);