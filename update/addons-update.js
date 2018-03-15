var COMMAND_PUSH = '$push';
var COMMAND_UNSHIFT = '$unshift';
var COMMAND_SPLICE = '$splice';
var COMMAND_SET = '$set';
var COMMAND_MERGE = '$merge';
var COMMAND_APPLY = '$apply';

var ALL_COMMANDS_LIST = [
    COMMAND_PUSH,
    COMMAND_UNSHIFT,
    COMMAND_SPLICE,
    COMMAND_SET,
    COMMAND_MERGE,
    COMMAND_APPLY
];

var ALL_COMMANDS_MAP = {
    [COMMAND_SET]: (value, nextValue) => _.clone(nextValue),
    [COMMAND_PUSH]: (value, nextValue) => [...value, ...nextValue],
    [COMMAND_UNSHIFT]: (value, nextValue) => [...nextValue, ...value],
    [COMMAND_MERGE]: (value, nextValue) => ({ ...value, ...nextValue }),
    [COMMAND_APPLY]: (value, func) => func(value),
    [COMMAND_SPLICE]: (value, nextValue) => [..._.slice(value, 0, nextValue[0][0]), ..._.slice(nextValue[0], 2), ..._.slice(value, nextValue[0][1] + 1)],
};

const _ = require('lodash');

const selector = createCommandsMap(ALL_COMMANDS_MAP);
const update = (value, spec = {}) => {
    let nextValue = _.clone(value);


    nextValue = selector(nextValue, spec);
    _.forEach(nextValue, (childValue, key) => {
        if (!spec.hasOwnProperty(key)) {
            return;
        }
        nextValue[key] = update(childValue, spec[key]);
    });
    return nextValue;
};


function createCommandsMap(handlers) {
    return function selector(value = {}, spec) {
        const keys = _.keys(handlers);
        for (const commandType of keys) {
            if (spec.hasOwnProperty(commandType)) {
                return handlers[commandType](value, spec[commandType]);
            }
        }
        return value;
    };
}

module.exports = update;