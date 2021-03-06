/*
 *
 * Copyright
 * 2009-2015 Jayway Products AB
 * 2016-2018 Föreningen Sambruk
 *
 * Licensed under AGPL, Version 3.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.gnu.org/licenses/agpl.txt
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

angular.module('sf')
    .directive('caselogentry', function ($rootScope, $location, $routeParams, $q, $window, caseService, navigationService, checkPermissionService) {
        return {
            restrict: 'E',
            templateUrl: 'components/caselogentry/caselogentry.html',
            scope: {
                caseid: '=?'
            },
            link: function (scope) {
                scope.caseLogCommands = caseService.getCaseLogCommands($routeParams.caseId);
                scope.caseLogCommands.promise.then(function () {
                    checkPermissionService.checkPermissions(scope, scope.caseLogCommands.commands, ['addmessage'], ['canAddCaseLogMessage']);
                });

                scope.caseLogEntryToCreate = '';
                scope.caseId = $routeParams.caseId;
                scope.caseLogs = null;

                scope.$watch('caseLogs', function (newVal) {
                    if (!newVal) {
                        return;
                    }
                    scope.caseLogs = newVal;
                });

                scope.submitCaseLogEntry = function ($event) {
                    $event.preventDefault();
                    if (scope.caseLogEntryToCreate) {
                        if (scope.$parent.status === 'new' && scope.$parent.caseLogs.length === 0) {
                            scope.$parent.notes[0].note = scope.caseLogEntryToCreate;
                            caseService.addNote(scope.caseId, scope.$parent.notes[0]);
                            $window.location.href = '#/cases/' + scope.$parent.caze[0].id + '/' + scope.$parent.caze[0].ownerId + '/notes';
                        }
                        caseService.createCaseLogEntry(scope.caseId, scope.caseLogEntryToCreate)
                            .then(function () {
                                $rootScope.$broadcast('caselog-message-created');
                                scope.caseLogEntryToCreate = '';
                            });
                    }
                };
            }
        };
    });
