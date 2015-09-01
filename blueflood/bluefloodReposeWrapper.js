define([
        'angular',
        'lodash',
    ],
    function (angular, _) {
        'use strict';

        var module = angular.module('grafana.services');

        module.factory('ReposeAPI', function($q, $http) {

            function ReposeAPI(api_url, username, apiKey) {
                // Initialize API parameters.
                this.url              = api_url;
                this.username         = username;
                this.apiKey           = apiKey ;
            }

            var p = ReposeAPI.prototype;

            /**
             * Get authentication token and check the service catalog to see if user is authorized for metrics query.
             */

            p.performReposeAPIRequest = function(method, params) {
                var options = {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    url: this.url,
                    data: {
                        "auth":
                        {
                            "RAX-KSKEY:apiKeyCredentials":
                            {
                                "username": this.username,
                                "apiKey": this.apiKey
                            }
                        }
                    }
                };

                var self = this;
                return $http(options).then(function (response) {
                    if (!response.data) {
                        return [];
                    }
                   //TODO: Handle Repose Errors
                    alert(response.data.result);
                    return response.data.result;
                });
            };

            return ReposeAPI;

        });

    });

