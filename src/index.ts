import { effect, signal } from "@preact/signals-core";

const tests = document.getElementById('tests')!.children; // 测试题目列表
const alignments = document.getElementById('alignments')!.children; // 结果列表
const progress = document.getElementById('progress')!; // 进度条
const prev = document.getElementById('prev')! as HTMLButtonElement; // 上一题按钮

// 测试题目总数
const total = tests.length;
progress.setAttribute('max', (total - 1).toString());

// 当前测试题目索引
const current = signal(0);

// 当前完成的测试数量
const completed = signal(0);

// 当前显示的测试题目索引
let active: number | null = null;

// 当前测试题目索引变化时，更新显示的测试题目
effect(() => {
    if (active !== null) {
        tests[active].classList.remove('active');
    }
    active = current.value;
    tests[active].classList.add('active');
    progress.setAttribute('value', active.toString());
});

// 作答后
document.querySelectorAll('input[type="radio"]').forEach((radio) => {
    radio.addEventListener('change', () => {
        // 自动跳转到下一题
        if (current.value < total - 1) {
            setTimeout(() => current.value++, 350);
        }

        // 更新已完成的测试数量
        completed.value = document.querySelectorAll('input[type="radio"]:checked').length;

        // 显示测试结果(如果所有测试都已完成)
        showResult();
    });
});

// 点击上一题
prev.addEventListener('click', () => {
    if (current.value > 0) {
        current.value--;
    }
});

// 如果当前是第一题，则隐藏上一题按钮
effect(() => {
    prev.style.display = current.value > 0 ? 'block' : 'none';
});

// 显示测试结果
function showResult() {
    if (completed.value < total) {
        return;
    }

    const affects = {
        "cx": 0, // chaotic
        "lx": 0, // lawful
        "nx": 0, // neutral (c vs l)
        "xe": 0, // evil
        "xg": 0, // good
        "xn": 0  // neutral (e vs g)
    };
    document.querySelectorAll('input[type="radio"]:checked').forEach((radio) => {
        const infl = radio.getAttribute('data-infl')!;
        const value = parseInt(radio.getAttribute('data-value')!);
        affects[infl] += value;
    });

    let maxScore = 0;
    let maxAlignment = '';
    for (const alignment of alignments) {
        const tag = alignment.getAttribute('data-alignment')!;
        const lawful = affects[tag[0] + 'x'];
        const good = affects['x' + tag[1]];
        const score = lawful + good;
        if (score > maxScore) {
            maxScore = score;
            maxAlignment = tag;
        }
    }

    for (const alignment of alignments) {
        if (alignment.getAttribute('data-alignment') === maxAlignment) {
            alignment.classList.add('active');
        } else {
            alignment.classList.remove('active');
        }
    }
}
effect(showResult);
