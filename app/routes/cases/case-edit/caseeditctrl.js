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

angular.module('sf').controller('CaseEditCtrl', function ($scope, $rootScope, $routeParams, $sce, httpService, caseService, externalPropertiesService) {
    $rootScope.$broadcast('case-opened');

    $scope.sidebardata = {};
    $scope.caseId = $routeParams.caseId;
    $scope.projectId = $routeParams.projectId;
    $scope.notesHistory = caseService.getAllNotes($routeParams.caseId);
    $scope.caze = caseService.getSelected($routeParams.caseId);
    $scope.status = $routeParams.status;

    externalPropertiesService.getProperties()
        .then(function (result) {
            $scope.externalContentURL = $sce.trustAsResourceUrl(result.data.externalURL);
        });

    $scope.caseLogs = caseService.getSelectedFilteredCaseLog($routeParams.caseId, {
        system: false,
        systemTrace: false,
        form: false,
        conversation: false,
        attachment: false,
        contact: false,
        custom: true
    });

    $scope.$watch('sidebardata.caze', function (newVal) {
        if (!newVal) {
            return;
        }
        $scope.caze = $scope.sidebardata.caze;
        $scope.caze.promise.then(function () {
            $scope.caseDescription = $scope.caze[0].text;
        });
    });

    $scope.$watch('sidebardata.notes', function (newVal) {
        if (!newVal) {
            return;
        }
        $scope.notes = $scope.sidebardata.notes;

        $scope.notes.promise.then(function () {
            $scope.caseNote = $scope.notes[0].note;
            if (!($scope.status === 'new' || $scope.status === 'empty' || $scope.status === 'notes')) {
                if (!$scope.caseNote && $scope.caze[0].id) {
                    $scope.status = 'new';
                }
            }
        });
    });

    $scope.$watch('caseDescription', function (newVal) {
        if (!newVal) {
            return;
        }
        $scope.caseDescription = newVal;
    });

    $scope.$watch('caseNote', function (newVal) {
        if (!newVal) {
            return;
        }
        $scope.caseNote = newVal;
    });

    var updateObject = function (itemToUpdate) {
        itemToUpdate.invalidate();
        itemToUpdate.resolve();
    };

    $scope.addNote = function ($event, $success, $error) {
        $event.preventDefault();

        $scope.notes[0].note = $scope.caseNote;
        if ($scope.notes[0].note === $event.target.value) {
            caseService.addNote($routeParams.caseId, $scope.notes[0])
                .then(function () {
                    updateObject($scope.notesHistory);
                    $success($($event.target));
                    $event.currentTarget.value = '';
                }, function () {
                    $error($error($event.target));
                });
        }
    };

    $scope.changeCaseDescription = function ($event, $success, $error) {
        $event.preventDefault();

        $scope.caze[0].text = $scope.caseDescription;
        if ($event.currentTarget.value.length > 50) {
            $error($($event.target));
        } else {
            caseService.changeCaseDescription($routeParams.caseId, $scope.caze[0].text)
                .then(function () {
                    $rootScope.$broadcast('casedescription-changed');
                    $success($($event.target));
                }, function () {
                    $error($error($event.target));
                });
        }
    };

    $scope.showSpinner = {
        notesHistory: true
    };

    $scope.notesHistory.promise.then(function () {
        $scope.showSpinner.notesHistory = false;
    });

    $scope.caze.promise.then(function () {
        document.title = 'Streamflow ' + $scope.caze[0].caseId;
    });

    $scope.caseLogs.promise.then(function () {
        $scope.showSpinner.caseLogs = false;
    });

    $scope.$on('caselog-message-created', function () {
        $scope.showSpinner.caseLogs = true;
        updateObject($scope.caseLogs);

        $scope.caseLogs.promise.then(function () {
            $scope.showSpinner.caseLogs = false;
        });
    });

    $rootScope.$on('case-edit-mode-changed', function (event, editMode) {
        $scope.status = editMode;
    });
});

