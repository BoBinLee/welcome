import update from './addons-update';

// const update = require("./addons-update");

describe("update", () => {
  describe("has a #$set method that", () => {
    var state: any;
    var commands;
    var nextState: any;
    beforeEach(() => {
      state = {
        a: {
          b: 22,
          c: 33
        },
        unChanged: {}
      };
      commands = { a: { c: { $set: 44 } } };
      nextState = update(state, commands);
    });

    it("changes the tree on the directive", () => {
      expect(state.a.c).not.toBe(nextState.a.c);
    });

    it("reuses state on different branches", () => {
      expect(state.unChanged).toBe(nextState.unChanged);
    });
  });

  describe("can pass react's test suite", () => {
    it('alice', () => {
      const state = { name: "Alice", todos: [] };
      const nextState = update(state, {
        name: { $set: "Bob" }
      });
      expect(nextState.name).toEqual('Bob');
      expect(nextState.todos).toBe(state.todos);
    })

    it("지시자가 비어있을 경우", () => {
      const state: any = [{ a: "b" }, { b: 2 }];
      const nextState = update(state, {});
      expect(nextState).toEqual(state);
      expect(nextState.a).toBe(state.a);
    });

    it("should support set", () => {
      expect(update({ a: "b" }, { $set: { c: "d" } })).toEqual({ c: "d" });
      expect(update(44, { $set: 55 })).toEqual(55);
      expect(update([3], { $set: [5] })).toEqual([5]);
      expect(update([{ a: 1 }, { b: 2 }], [{ a: { $set: 22 } }])).toEqual([{ a: 22 }, { b: 2 }]);
      expect(update({ a: 3 }, { a: { $set: [1, 3] } })).toEqual({ a: [1, 3] });
    });

    it("should support push", () => {
      expect(update([1], { $push: [7] })).toEqual([1, 7]);
    });

    it("should support push(array object)", () => {
      expect(update({ a: [1] }, { a: { $push: [7] } })).toEqual({ a: [1, 7] });
    });

    it("should support unshift", () => {
      expect(update([1], { $unshift: [7] })).toEqual([7, 1]);
    });

    it("should support unshift(over 2 length of array)", () => {
      expect(update([1], { $unshift: [7, 8] })).toEqual([8, 7, 1]);
    });

    it("should support merge", () => {
      expect(update({ a: "b" }, { $merge: { c: "d" } })).toEqual({
        a: "b",
        c: "d"
      });
    });

    it("should support apply", () => {
      expect(
        update(2, {
          $apply: function (x: number) {
            return x * 2;
          }
        })
      ).toBe(4);
    });

    it("should support apply 2", () => {
      expect(
        update({ y: 2 }, {
          y: {
            $apply: function (x: number) {
              return x * 2;
            }
          }
        })
      ).toEqual({
        y: 4
      });
    });

    it("should support deep updates", () => {
      expect(
        update({ a: "b", c: { d: "e" } }, { c: { d: { $set: "f" } } })
      ).toEqual({
        a: "b",
        c: { d: "f" }
      });
    });

    it("should support splice", () => {
      expect(update([1, 4, 3], { $splice: [[1, 1, 2]] })).toEqual([1, 2, 3]);
    });

    it("should support splice Nested collections", () => {
      const state = [1, 2, { a: [12, 17, 15] }];
      const commands = { 2: { a: { $splice: [[1, 1, 13, 14]] } } };
      expect(update(state, commands)).toEqual([1, 2, { a: [12, 13, 14, 15] }]);
    });

    it("should support complicated updates", () => {
      expect(update([{ a: 1 }, { b: 2 }], [{ a: { $set: 22 } }, { $merge: { c: "d" } }])).toEqual([{ a: 22 }, { b: 2, c: 'd' }]);
      // console.log(update([{ a: 1 }, { b: 2 }], [{ a: { $set: 22 } }, { $merge: { c: "d" } }]));
    });
  });

  describe("can not pass react's test suite", () => {
    it("Cannot have more than one key in an object with $set​​", () => {
      expect(() => update({ a: "b" }, { $set: { c: "d" }, $merge: { d: "f" } })).toThrowError('Cannot have more than one key in an object with $set​​');
    });
    it("Can not read property", () => {
      expect(() => update({}, { a: { $set: 44 } })).toThrowError('Can not read property');
      expect(() => update({ a: {} }, { a: { b: { $set: 44 } } })).toThrowError('Can not read property');
    });
    it("지시자가 올바르지 않을 경우", () => {
      expect(() => update({ b: 6 }, { a: 3 })).toThrowError('You provided a key path to update() that did not contain one of $push, $unshift, $splice, $set, $merge, $apply. Did you forget to include {$set: ...}?​');
    });

    it("expected target of $push to be an array; got undefined.​​", () => {
      expect(() => update([{ a: 1 }, { b: 2 }], [{ a: { $set: 22 } }, { $merge: { c: "d" } }, { $push: 22 }])).toThrow();
    });

    it('$merge에 배열 일 경우', () => {
      expect(update([1, 2], { $merge: [2, 3] })).toEqual({ "0": 2, "1": 3 });
    });

    it('expected target of $push to be an array; got 1.​​', () => {
      expect(() => update({ a: 1 }, { a: { $push: [1] } })).toThrowError('expected target of $push to be an array; got 1.​​');
    });
  });
});
