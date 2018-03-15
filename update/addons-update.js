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
    [COMMAND_SET]: (value, setValue) => _.clone(setValue),
    [COMMAND_PUSH]: (value, array) => [...value, ...array],
    [COMMAND_UNSHIFT]: (value, array) => [...array, ...value],
    [COMMAND_MERGE]: (value, mergeValue) => ({ ...value, ...mergeValue }),
    [COMMAND_APPLY]: (value, func) => func(value),
    [COMMAND_SPLICE]: (value, sliceProps) => [..._.slice(value, 0, sliceProps[0][0]), ..._.slice(sliceProps[0], 2), ..._.slice(value, sliceProps[0][1] + 1)],
};

const _ = require('lodash');

const manager = makeCommandsManager(ALL_COMMANDS_MAP);
const update = (value, spec = {}) => {
    if (_.isEmpty(value) && !manager.hasCommandType(spec)) {
        throw new Error('Can not read property');
    }
    let nextValue = _.clone(value);
    nextValue = manager.selector(nextValue, spec);
    _.forEach(nextValue, (childValue, key) => {
        if (!spec.hasOwnProperty(key)) {
            return;
        }
        nextValue[key] = update(childValue, spec[key]);
    });
    return nextValue;
};

function makeCommandsManager(handlers) {
    return {
        hasCommandType: (spec) => {
            const keys = _.keys(handlers);
            return _.some(keys, (commandType) => spec.hasOwnProperty(commandType));
        },
        selector: (value = {}, spec) => {
            const keys = _.keys(handlers);
            let commandTypeCount = 0;
            let nextValue = value;

            for (const commandType of keys) {
                if (spec.hasOwnProperty(commandType)) {
                    nextValue = handlers[commandType](value, spec[commandType]);
                    commandTypeCount += 1;
                }
            }
            if (commandTypeCount > 1) {
                throw new Error('Cannot have more than one key in an object with $set​​');
            }
            return nextValue;
        }
    }
}

module.exports = update;