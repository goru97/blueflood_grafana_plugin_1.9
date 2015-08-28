'use strict';
define([
        'angular',
        'lodash',
        'kbn',
        'moment'
    ],
    function (angular, _) {
        //'use strict';

        var module = angular.module('grafana.services');

        module.factory('BluefloodDatasource', function ($q, $http, templateSrv) {

            /**
             * Datasource initialization. Calls when you refresh page, add
             * or modify datasource.
             *
             * @param {Object} datasource Grafana datasource object.
             */
            function BluefloodDatasource(datasource) {
                this.name = datasource.name;
                this.type = 'BluefloodDatasource';
                this.url = datasource.url;
                this.basicAuth = datasource.basicAuth;
                this.withCredentials = datasource.withCredentials;

                this.partials = datasource.partials || 'plugins/datasource/blueflood/partials';
                this.annotationEditorSrc = this.partials + '/annotations.editor.html';

                this.supportMetrics   = false;
                this.supportAnnotations = true;
            }

            BluefloodDatasource.prototype.doAPIRequest = function(options) {
                if (this.basicAuth || this.withCredentials) {
                    options.withCredentials = true;
                }
                if (this.basicAuth) {
                    options.headers = options.headers || {};
                    options.headers.Authorization = this.basicAuth;
                }

                options.url = this.url + options.url;
                options.inspect = { type: 'blueflood' };

                return $http(options);
            };

            /////////////////
            // Annotations //
            /////////////////

            BluefloodDatasource.prototype.annotationQuery = function (annotation, rangeUnparsed) {

                var tags = templateSrv.replace(annotation.tags);
                return this.events({range: rangeUnparsed, tags: tags})
                    .then(function (results) {
                        var list = [];
                        for (var i = 0; i < results.data.length; i++) {
                            var e = results.data[i];

                            list.push({
                                annotation: annotation,
                                time: e.when * 1000,
                                title: e.what,
                                tags: e.tags,
                                text: e.data
                            });
                        }
                        return list;
                    });
            };

            BluefloodDatasource.prototype.events = function (options) {
                try {
                    var tags = '';
                    if (options.tags) {
                        tags = '&tags=' + options.tags;
                    }

                    return this.doAPIRequest({
                        method: 'GET',
                        url: '/events/getEvents?from=' +options.range.from.getTime()+ '&until=' + options.range.to.getTime() + tags,
                    
                    });
                }
                catch (err) {
                    return $q.reject(err);
                }
            };

        return BluefloodDatasource;
        });
    });