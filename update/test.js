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
    - 지시자가 존재하지 않을 경우
    - 배열의 속성 $set
    - 속성 안 배열 { a: $push or $unshift }
    - 배열 merge
    - Can not read property
  */

  describe("can not pass react's test suite", () => {
    it("Cannot have more than one key in an object with $set​​", () => {
      // console.log(update({ a: "b" }, { $set: { c: "d" }, $merge: { d: "f" } }));
      // const error = new Error('Cannot have more than one key in an object with $set​​');
      // expect(() => { throw new Error() }).toThrow();
      expect(() => update({ a: "b" }, { $set: { c: "d" }, $merge: { d: "f" } })).toThrowError('Cannot have more than one key in an object with $set​​');
    });
    it("Can not read property", () => {
      expect(() => update({}, { a: { $set: 44 } })).toThrowError('Can not read property');
    });
  });
});
