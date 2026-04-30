const assert = require("assert");

function cloneSortState(state) {
    return state.map((pole) => [...pole]);
}

function isSortSolved(state, capacity = 10) {
    return state.every((pole) => pole.length === 0 || (pole.length === capacity && pole.every((color) => color === pole[0])));
}

function getTopColorGroup(state, poleIndex) {
    const pole = state[poleIndex];
    if (!pole.length) {
        return [];
    }

    const topColor = pole[pole.length - 1];
    const group = [];
    for (let index = pole.length - 1; index >= 0; index -= 1) {
        if (pole[index] !== topColor) {
            break;
        }
        group.unshift(pole[index]);
    }
    return group;
}

function canMoveGroup(state, from, to, capacity = 10) {
    if (from === to) {
        return false;
    }
    const movingGroup = getTopColorGroup(state, from);
    if (!movingGroup.length) {
        return false;
    }
    return state[to].length + movingGroup.length <= capacity;
}

function applySortMove(state, from, to) {
    const movingGroup = getTopColorGroup(state, from);
    for (let count = 0; count < movingGroup.length; count += 1) {
        state[from].pop();
    }
    state[to].push(...movingGroup);
    return movingGroup;
}

function createKnownSolvableBoard() {
    return [
        Array(10).fill("red"),
        Array(10).fill("yellow"),
        Array(10).fill("green"),
        [...Array(9).fill("blue"), "orange"],
        [...Array(9).fill("orange"), "blue"],
        [],
        []
    ];
}

function runTest(name, fn) {
    try {
        fn();
        console.log(`PASS ${name}`);
    } catch (error) {
        console.error(`FAIL ${name}`);
        throw error;
    }
}

runTest("top color group reads contiguous top blocks", () => {
    const state = [
        ["blue", "red", "red"],
        []
    ];
    assert.deepStrictEqual(getTopColorGroup(state, 0), ["red", "red"]);
});

runTest("move can place a group onto same-color top if there is space", () => {
    const state = [
        ["red", "red", "red"],
        ["red", "red"],
        []
    ];

    assert.strictEqual(canMoveGroup(state, 0, 1, 10), true);
    const moved = applySortMove(state, 0, 1);
    assert.deepStrictEqual(moved, ["red", "red", "red"]);
    assert.deepStrictEqual(state[0], []);
    assert.deepStrictEqual(state[1], ["red", "red", "red", "red", "red"]);
});

runTest("known orange-blue swap board is not already solved", () => {
    const state = createKnownSolvableBoard();
    assert.strictEqual(isSortSolved(state), false);
});

runTest("known orange-blue swap board solves in three moves", () => {
    const state = createKnownSolvableBoard();

    assert.strictEqual(canMoveGroup(state, 3, 5, 10), true);
    assert.deepStrictEqual(applySortMove(state, 3, 5), ["orange"]);

    assert.strictEqual(canMoveGroup(state, 4, 3, 10), true);
    assert.deepStrictEqual(applySortMove(state, 4, 3), ["blue"]);

    assert.strictEqual(canMoveGroup(state, 5, 4, 10), true);
    assert.deepStrictEqual(applySortMove(state, 5, 4), ["orange"]);

    assert.strictEqual(isSortSolved(state), true);
});

runTest("reset copy keeps original fixed board unchanged", () => {
    const initial = createKnownSolvableBoard();
    const current = cloneSortState(initial);
    applySortMove(current, 3, 5);

    assert.deepStrictEqual(initial[3], [...Array(9).fill("blue"), "orange"]);
    assert.deepStrictEqual(initial[5], []);
});

console.log("All sort pole tests passed.");
