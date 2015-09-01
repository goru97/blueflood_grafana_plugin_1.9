'use strict';
define([
        'angular',
        'lodash',
        'kbn',
        './bluefloodReposeWrapper'
    ],
    function (angular, _, kbn) {
        //'use strict';

        var module = angular.module('grafana.services');

        module.factory('BluefloodDatasource', function ($q, $http, templateSrv, ReposeAPI) {

            /**
             * Datasource initialization. Calls when you refresh page, add
             * or modify datasource.
             *
             * @param {Object} datasource Grafana datasource object.
             */
            function BluefloodDatasource(datasource) {
                this.name             = datasource.name;
                this.type             = 'BluefloodDatasource';
                this.url              = datasource.url;
                this.username         = datasource.username;
                this.apikey           = datasource.apikey;
                this.identityURL      = "https://identity.api.rackspacecloud.com/v2.0/tokens";

                this.partials = datasource.partials || 'plugins/datasource/blueflood/partials';
                this.annotationEditorSrc = this.partials + '/annotations.editor.html';

                this.supportMetrics   = false;
                this.supportAnnotations = true;

                //Initialize Repose.
                this.reposeAPI = new ReposeAPI(this.identityURL, this.username, this.apikey);
            }

            BluefloodDatasource.prototype.doAPIRequest = function(options, token) {
                this.tenantID = token.tenant.id;
                options.url   = this.url + '/v2.0/'+this.tenantID+options.url;
                options.headers = {
                    'X-Auth-Token': token.id,
                    'Accept'      : 'application/json',
                    'Content-type': 'application/json'
                }

                return $http(options);
            };

            /////////////////
            // Annotations //
            /////////////////

            BluefloodDatasource.prototype.annotationQuery = function (annotation, rangeUnparsed) {

                var tags = templateSrv.replace(annotation.tags);

                var results = this.events({range: rangeUnparsed, tags: tags});

                var list = [];
                for (var i = 0; i < results.length; i++) {
                    var e = results[i];
                    list.push({
                        annotation: annotation,
                        time  :  e.when,
                        title :  e.what,
                        tags  :  e.tags,
                        text  :  e.data
                    });
                }
                return list;

            };

            BluefloodDatasource.prototype.events = function (options) {
                try {
                    var tags = '';
                    if (options.tags) {
                        tags = '&tags=' + options.tags;
                    }

                    this.doAPIRequest({
                        method: 'GET',
                        url: '/events/getEvents?from=' +this.translateTime(options.range.from)+ '&until=' +this.translateTime(options.range.to) + tags
                    }, this.reposeAPI.getToken()).then(function (response) {
                        if(response.status === 401){
                            this.doAPIRequest({
                                method: 'GET',
                                url: '/events/getEvents?from=' +this.translateTime(options.range.from)+ '&until=' +this.translateTime(options.range.to) + tags
                            }, this.reposeAPI.getIdentity()).then(function (response) {
                                if(response.status/100 === 4 || response.status === 500){
                                    alert("Error while connecting to Blueflood");
                                }

                                return response.data;
                            });

                        }
                        return response.data;
                    });

                    return [];
                }
                catch (err) {
                    return $q.reject(err);
                }
            };

            BluefloodDatasource.prototype.translateTime = function(date) {
                return kbn.parseDate(date).getTime();
            };

            return BluefloodDatasource;
        });
    });