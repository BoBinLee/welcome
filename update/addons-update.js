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

var ALL_COMMANDS_SET = {};

ALL_COMMANDS_LIST.forEach(function (command) {
    ALL_COMMANDS_SET[command] = true;
});

const update = (value, spec = {}) => {
    let nextValue = { ...value };

    if (spec.hasOwnProperty(COMMAND_SET)) {
        nextValue = {
            ...spec[COMMAND_SET]
        };
    }
    return nextValue;
};

module.exports = update;