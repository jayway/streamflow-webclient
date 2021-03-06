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
angular.module('sf').factory('profileService', function (backendService) {
    return {
        getCurrent: function () {
            return backendService.get({
                specs: [{resources: 'account'},
                    {resources: 'profile'},
                    {queries: 'index'}],
                onSuccess: function (resource, result) {
                    result.push(resource.response);
                }
            });
        },
        updateCurrent: function (value) {
            return backendService.postNested(
                [{resources: 'account'},
                    {resources: 'profile'},
                    {commands: 'update'}
                ],
                value);
        },
        changeMessageDeliveryType: function (value) {
            return backendService.postNested(
                [{resources: 'account'},
                    {resources: 'profile'},
                    {commands: 'changemessagedeliverytype'}
                ],
                value);
        },
        changeMailFooter: function (value) {
            return backendService.postNested(
                [{resources: 'account'},
                    {resources: 'profile'},
                    {commands: 'changemailfooter'}
                ],
                value);
        },
        changeMarkReadTimeout: function (value) {
            return backendService.postNested(
                [{resources: 'account'},
                    {resources: 'profile'},
                    {commands: 'changemarkreadtimeout'}
                ],
                value);
        },
        changeUserPassword: function (oldPassword, newPassword) {
            return backendService.postNested(
                [
                    {resources: 'account'},
                    {commands: 'changepassword'}
                ],
                {
                    'oldpassword': oldPassword,
                    'newpassword': newPassword
                }
            );
        }
    };
});

