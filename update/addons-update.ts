import * as _ from 'lodash';

const COMMAND_PUSH = '$push';
const COMMAND_UNSHIFT = '$unshift';
const COMMAND_SPLICE = '$splice';
const COMMAND_SET = '$set';
const COMMAND_MERGE = '$merge';
const COMMAND_APPLY = '$apply';

const ALL_COMMANDS_MAP: object = {
    [COMMAND_SET]: (value: object, setValue: object) => _.clone(setValue),
    [COMMAND_PUSH]: (value: Array<any>, array: Array<any>) => {
        if (!_.isArray(value)) {
            throw new Error('expected target of $push to be an array; got 1.​​');
        }
        if (!_.isArray(array)) {
            throw new Error('expected target of $push to be an array; got undefined.​​');
        }
        return [...value, ...array];
    },
    [COMMAND_UNSHIFT]: (value: Array<any>, array: Array<any>) => [..._.reverse(array), ...value],
    [COMMAND_MERGE]: (value: object, mergeValue: object) => ({ ...value, ...mergeValue }),
    [COMMAND_APPLY]: (value: object, func: Function) => func(value),
    [COMMAND_SPLICE]: (value: Array<any>, sliceProps: Array<any>) => [..._.slice(value, 0, sliceProps[0][0]), ..._.slice(sliceProps[0], 2), ..._.slice(value, sliceProps[0][1] + 1)],
};

const manager = makeCommandsManager(ALL_COMMANDS_MAP);
const update = (value: any, spec: any) => {
    if (isEmptyAndNotCommandType(value, spec)) {
        throw new Error('Can not read property');
    }
    let nextValue = _.clone(value);
    checkNotContainCommands(nextValue, spec);
    nextValue = manager.getValue(nextValue, spec);
    _.forEach(nextValue, (childValue, key) => {
        if (!spec.hasOwnProperty(key)) {
            return;
        }
        nextValue[key] = update(childValue, spec[key]);
    });
    return nextValue;
};

function isEmptyAndNotCommandType(value: any, spec: any): boolean {
    return _.isEmpty(value) && !manager.hasCommandType(spec);
}

function checkNotContainCommands(value: any, spec: any) {
    if (manager.hasCommandType(spec)) {
        return;
    }
    _.forEach(spec, (_, key) => {
        if (!value.hasOwnProperty(key)) {
            throw new Error('You provided a key path to update() that did not contain one of $push, $unshift, $splice, $set, $merge, $apply. Did you forget to include {$set: ...}?​');
        }
    });
}

function makeCommandsManager(handlers: any) {
    const hasCommandType = (spec: any) => {
        const keys = _.keys(handlers);
        return _.some(keys, (commandType) => spec.hasOwnProperty(commandType));
    };

    const getValue = (value: any = {}, spec: any) => {
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
        getValue
    }
}

export default update;