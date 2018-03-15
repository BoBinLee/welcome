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
    [COMMAND_PUSH]: (value, array) => {
        if (!_.isArray(value)) {
            throw new Error('expected target of $push to be an array; got 1.​​');
        }
        if (!_.isArray(array)) {
            throw new Error('expected target of $push to be an array; got undefined.​​');
        }
        return [...value, ...array];
    },
    [COMMAND_UNSHIFT]: (value, array) => [..._.reverse(array), ...value],
    [COMMAND_MERGE]: (value, mergeValue) => ({ ...value, ...mergeValue }),
    [COMMAND_APPLY]: (value, func) => func(value),
    [COMMAND_SPLICE]: (value, sliceProps) => [..._.slice(value, 0, sliceProps[0][0]), ..._.slice(sliceProps[0], 2), ..._.slice(value, sliceProps[0][1] + 1)],
};

const _ = require('lodash');

const manager = makeCommandsManager(ALL_COMMANDS_MAP);
const update = (value, spec) => {
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
    checkSpec(nextValue, spec);
    return nextValue;
};

function checkSpec(value, spec) {
    if (manager.hasCommandType(spec)) {
        return;
    }
    _.forEach(spec, (_, key) => {
        if (!value.hasOwnProperty(key)) {
            throw new Error('You provided a key path to update() that did not contain one of $push, $unshift, $splice, $set, $merge, $apply. Did you forget to include {$set: ...}?​');
        }
    });
}

function makeCommandsManager(handlers) {
    const hasCommandType = (spec) => {
        const keys = _.keys(handlers);
        return _.some(keys, (commandType) => spec.hasOwnProperty(commandType));
    };

    const selector = (value = {}, spec) => {
        const keys = _.keys(handlers);
        let nextValue = value;

        for (const commandType of keys) {
            if (spec.hasOwnProperty(commandType)) {
                nextValue = handlers[commandType](value, spec[commandType]);
            }
        }
        if (hasCommandType(spec) && _.keys(spec).length > 1) {
            throw new Error('Cannot have more than one key in an object with $set​​');
        }
        return nextValue;
    };
    return {
        hasCommandType,
        selector
    }
}

module.exports = update;