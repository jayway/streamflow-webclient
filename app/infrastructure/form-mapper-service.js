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
    .factory('formMapperService', function ($parse) {

        function addOptions(fieldValue) {
            fieldValue.options = _.map(fieldValue.values, function (value) {
                return {name: value, value: value};
            });
        }

        var mappings = {
            'se.streamsource.streamflow.api.administration.form.ComboBoxFieldValue': {
                addProperties: function (field) {
                    addOptions(field.field.fieldValue);
                }
            },
            'se.streamsource.streamflow.api.administration.form.DateFieldValue': {
                addProperties: function (field) {
                    if (field.value) {
                        field.value = field.value.split('T')[0];
                    }
                },
                getValue: function (value) {
                    return value + 'T00:00:00.000Z';
                }
            },
            'se.streamsource.streamflow.api.administration.form.CheckboxesFieldValue': {
                addProperties: function (field) {
                    field.field.fieldValue.checkings = _.map(field.field.fieldValue.values, function (value) {
                        return {name: value, checked: field.value && field.value.indexOf(value) !== -1};
                    });
                },
                getValue: function (value, attr) {
                    var checked = _.chain($parse(attr.backingField)())
                        .filter(function (input) {
                            return input.checked;
                        }).map(function (input) {
                            return input.name;
                        }).value();

                    return checked.join(', ');
                }
            },
            'se.streamsource.streamflow.api.administration.form.ListBoxFieldValue': {
                addProperties: function (field) {
                    addOptions(field.field.fieldValue);
                    if (field.value) {
                        var escapedValue = '';
                        if (field.value.constructor === Array) {
                            escapedValue = field.value.toString();
                        } else {
                            escapedValue = field.value.replace(/\[(.*),(.*)]/, '$1' + encodeURIComponent(',') + '$2');
                        }
                        field.value = _.map(escapedValue.split(', '), function (escaped) {
                            return decodeURIComponent(escaped);
                        });
                    }
                },
                getValue: function (value) {
                    var espacedValues = _.map(value, function (value) {
                        return value.indexOf(',') !== -1 ? '[' + value + ']' : value;
                    });

                    return espacedValues.join(', ');
                }
            },
            'se.streamsource.streamflow.api.administration.form.NumberFieldValue': {
                addProperties: function (field) {
                    var regex;
                    if (field.field.fieldValue.integer) {
                        regex = /^\d+$/; // Integer
                    }
                    else {
                        regex = /^(\d+(?:[.,]\d*)?)$/; // Possible decimal, with . or ,
                    }

                    field.field.fieldValue.regularExpression = regex;
                }
            },
            'se.streamsource.streamflow.api.administration.form.TextFieldValue': {
                addProperties: function (field) {
                    if (!field.field.fieldValue.regularExpression) {
                        field.field.fieldValue.regularExpression = /(?:)/;
                    }
                    else {
                        field.field.fieldValue.regularExpression = new RegExp(field.field.fieldValue.regularExpression);
                    }
                }
            },
            'se.streamsource.streamflow.api.administration.form.OpenSelectionFieldValue': {
                addProperties: function (field) {
                    field.field.fieldValue.extendedValues = _.map(field.field.fieldValue.values, function (value) {
                        return {
                            value: value,
                            display: value
                        };
                    });

                    var value;
                    if (field.field.fieldValue.values.indexOf(field.value) === -1) {
                        value = field.value;
                    }

                    field.field.fieldValue.extendedValues.push({
                        value: value,
                        display: field.field.fieldValue.openSelectionName
                    });
                }
            }
        };

        return {
            addProperties: function (field) {

                var mapper = mappings[field.field.fieldValue._type];
                if (mapper && mapper.addProperties) {
                    mapper.addProperties(field);
                }
            },
            getValue: function (value, attr) {

                var mapper = mappings[attr.fieldType];
                if (mapper && mapper.getValue) {
                    return mapper.getValue(value, attr);
                }

                return value;
            }
        };
    });
