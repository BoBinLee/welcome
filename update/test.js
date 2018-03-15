const update = require("./addons-update");

describe("update", () => {
  describe("has a #$set method that", () => {
    var state;
    var commands;
    var nextState;
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
    it("should support empty", () => {
      const state = { a: "b" };
      const nextState = update(state, {});
      expect(nextState).toEqual(state);
      expect(nextState.a).toBe(state.a);
    });

    it("should support set", () => {
      expect(update({ a: "b" }, { $set: { c: "d" } })).toEqual({ c: "d" });
      expect(update(44, { $set: 55 })).toEqual(55);
      expect(update([3], { $set: [3] })).toEqual([3]);
    });

    it("should support push", () => {
      expect(update([1], { $push: [7] })).toEqual([1, 7]);
    });

    it("should support unshift", () => {
      expect(update([1], { $unshift: [7] })).toEqual([7, 1]);
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
          $apply: function (x) {
            return x * 2;
          }
        })
      ).toBe(4);
    });

    it("should support apply 2", () => {
      expect(
        update({ y: 2 }, {
          y: {
            $apply: function (x) {
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
  });

  /*
    예외 경우
    - 속성이 중복일 경우
    - Can not read property

    - 지시자가 존재하지 않을 경우 : You provided a key path to update() that did not contain one of $push, $unshift, $splice, $set, $merge, $apply. Did you forget to include {$set: ...}?​​
    - 배열의 속성 $set
    - 속성 안 배열 { a: $push or $unshift }
    - 배열 merge
    
  */

  describe("can not pass react's test suite", () => {
    it("Cannot have more than one key in an object with $set​​", () => {
      expect(() => update({ a: "b" }, { $set: { c: "d" }, $merge: { d: "f" } })).toThrowError('Cannot have more than one key in an object with $set​​');
    });
    it("Can not read property", () => {
      expect(() => update({}, { a: { $set: 44 } })).toThrowError('Can not read property');
      expect(() => update({ a: {} }, { a: { b: { $set: 44 } } })).toThrowError('Can not read property');
    });
    it("지시자가 올바르지 않을 경우", () => {
      // expect(() => update(5, 4)).toThrowError('Can not read property');
      // console.log(update({}, { a: { c: 44 } }));
      // expect(() => update({}, { a: { c: 44 } })).toThrowError('Can not read property');
      // expect(() => update({}, { a: 3 })).toThrowError('Can not read property');
      // expect(() => update({ a: 6 }, { a: 3 })).toThrowError('Can not read property');
      // console.log(update({ b: 6 }, { a: 3 }));
      expect(() => update({ b: 6 }, { a: 3 })).toThrowError('You provided a key path to update() that did not contain one of $push, $unshift, $splice, $set, $merge, $apply. Did you forget to include {$set: ...}?​');
    });
  });
});
