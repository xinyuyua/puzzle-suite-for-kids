const assert = require("assert");

function createSeededRandom(seed) {
    let value = seed >>> 0;
    return function nextRandom() {
        value = (value * 1664525 + 1013904223) >>> 0;
        return value / 0x100000000;
    };
}

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

function getLegalSortMoves(state, capacity) {
    const moves = [];
    for (let from = 0; from < state.length; from += 1) {
        if (state[from].length === 0) {
            continue;
        }
        const movingGroup = getTopColorGroup(state, from);
        for (let to = 0; to < state.length; to += 1) {
            if (from === to || state[to].length + movingGroup.length > capacity) {
                continue;
            }
            moves.push({ from, to, color: movingGroup[0], count: movingGroup.length });
        }
    }
    return moves;
}

function applySortMove(state, from, to) {
    const movingGroup = getTopColorGroup(state, from);
    for (let count = 0; count < movingGroup.length; count += 1) {
        state[from].pop();
    }
    state[to].push(...movingGroup);
    return movingGroup;
}

function shuffle(list, random = Math.random) {
    const copy = [...list];
    for (let index = copy.length - 1; index > 0; index -= 1) {
        const swapIndex = Math.floor(random() * (index + 1));
        [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
    }
    return copy;
}

function createSolvedSortState(capacity = 10) {
    const colors = ["red", "yellow", "green", "blue", "orange"];
    const state = colors.map((color) => Array(capacity).fill(color));
    state.push([]);
    state.push([]);
    return state;
}

function getSortStateKey(state) {
    return state.map((pole) => pole.join(",")).join("|");
}

function isUniformPole(pole) {
    return pole.length > 0 && pole.every((color) => color === pole[0]);
}

function scoreSortMove(state, move, capacity) {
    const destination = state[move.to];
    let score = 0;

    if (destination.length === 0) {
        score += 1;
    }
    if (destination[destination.length - 1] === move.color) {
        score += 5;
    }
    if (isUniformPole(state[move.from]) && state[move.from].length === capacity) {
        score -= 3;
    }
    return score;
}

function getPreferredSortMoves(state, capacity, lastMove = null) {
    const emptyTargets = state
        .map((pole, index) => ({ pole, index }))
        .filter(({ pole }) => pole.length === 0)
        .map(({ index }) => index);
    const firstEmptyTarget = emptyTargets.length ? emptyTargets[0] : null;

    return getLegalSortMoves(state, capacity)
        .filter((move) => {
            if (lastMove && move.from === lastMove.to && move.to === lastMove.from && move.count === lastMove.count && move.color === lastMove.color) {
                return false;
            }

            if (state[move.to].length === 0 && firstEmptyTarget !== null && move.to !== firstEmptyTarget) {
                return false;
            }

            if (isUniformPole(state[move.from]) && state[move.from].length === capacity && state[move.to].length === 0) {
                return false;
            }

            return true;
        })
        .sort((left, right) => scoreSortMove(state, right, capacity) - scoreSortMove(state, left, capacity));
}

function searchSortSolution(state, capacity, depthRemaining, seen, lastMove) {
    if (isSortSolved(state, capacity)) {
        return [];
    }

    if (depthRemaining === 0) {
        return null;
    }

    const key = getSortStateKey(state);
    const bestSeen = seen.get(key);
    if (bestSeen !== undefined && bestSeen >= depthRemaining) {
        return null;
    }
    seen.set(key, depthRemaining);

    const moves = getPreferredSortMoves(state, capacity, lastMove);
    for (const move of moves) {
        const nextState = cloneSortState(state);
        applySortMove(nextState, move.from, move.to);
        const suffix = searchSortSolution(nextState, capacity, depthRemaining - 1, seen, move);
        if (suffix) {
            return [move, ...suffix];
        }
    }

    return null;
}

function findSortSolution(initialState, capacity = 10, maxDepth = 8) {
    for (let depthLimit = 1; depthLimit <= maxDepth; depthLimit += 1) {
        const seen = new Map();
        const solution = searchSortSolution(initialState, capacity, depthLimit, seen, null);
        if (solution) {
            return solution;
        }
    }
    return null;
}

function createRandomSortCandidate(random, capacity = 10) {
    const state = createSolvedSortState(capacity);
    const colorPoleIndexes = shuffle([0, 1, 2, 3, 4], random);
    const firstPole = colorPoleIndexes[0];
    const secondPole = colorPoleIndexes[1];
    const firstColor = state[firstPole][0];
    const secondColor = state[secondPole][0];
    const firstSwapCount = 1 + Math.floor(random() * 3);
    const secondSwapCount = 1 + Math.floor(random() * 3);

    state[firstPole] = [
        ...Array(capacity - firstSwapCount).fill(firstColor),
        ...Array(firstSwapCount).fill(secondColor)
    ];
    state[secondPole] = [
        ...Array(capacity - secondSwapCount).fill(secondColor),
        ...Array(secondSwapCount).fill(firstColor)
    ];

    return shuffle(state.map((pole) => [...pole]), random);
}

function generateRandomSolvablePuzzle({ seed = 1, maxAttempts = 80, capacity = 10, maxDepth = 8 } = {}) {
    const random = createSeededRandom(seed);

    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
        const candidate = createRandomSortCandidate(random, capacity);
        const solution = findSortSolution(candidate, capacity, maxDepth);
        if (solution) {
            return { candidate, solution };
        }
    }

    return null;
}

function replaySolution(initialState, solutionMoves) {
    const state = cloneSortState(initialState);
    solutionMoves.forEach((move) => {
        applySortMove(state, move.from, move.to);
    });
    return state;
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

runTest("generator can produce a mixed solvable puzzle", () => {
    const generated = generateRandomSolvablePuzzle({ seed: 7 });
    assert.ok(generated, "expected generator to produce a puzzle");
    assert.strictEqual(isSortSolved(generated.candidate), false);
    assert.ok(generated.solution.length > 0, "expected a non-empty solution");
});

runTest("generated puzzle solves by replaying the discovered solution", () => {
    const generated = generateRandomSolvablePuzzle({ seed: 19 });
    assert.ok(generated, "expected generator to produce a puzzle");
    const solved = replaySolution(generated.candidate, generated.solution);
    assert.strictEqual(isSortSolved(solved), true);
});

runTest("generator is stable across several seeds", () => {
    [1, 2, 3, 4, 5].forEach((seed) => {
        const generated = generateRandomSolvablePuzzle({ seed });
        assert.ok(generated, `expected generator to succeed for seed ${seed}`);
    });
});

console.log("All sort pole generator tests passed.");
