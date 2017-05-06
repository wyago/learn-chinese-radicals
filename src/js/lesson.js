var Lesson = (function () {
    let explain = false;
    let nextId = 0;

    function start() {
        state.path = ["lesson", "practice"];
        explain = false;
        projector.scheduleRender();
    }

    function next() {
        state.path = ["lesson", "practice"];

        let word = state.words[0];

        word.swapWith = word.swapWith || 1;
        if (word.swapWith >= state.words.length) {
            word.swapWith = state.words.length - 1;
        }

        for (let i = 0; i < word.swapWith; ++i) {
            state.words[i] = state.words[i + 1];
        }
        state.words[word.swapWith] = word;
    }

    function success() {
        let word = state.words[0];


        let chinese = word.simplified;
        if (word.variants) {
            chinese += " or " + word.variants;
        }
        return h("div.row.centered-column", [
            h("div.centered-column", {
                styles: {
                    position: "relative"
                }
            }, h("span.chinese", {
                key: success
            }, chinese)),
            h("div.success.meaning", {
                classes: {
                    viewing: explain
                }
            }, word.meanings.map(x => h("span.meaning", x))),
            h("div.success.pronunciation", {
                classes: {
                    viewing: explain
                }
            }, word.pronunciation),
            h("div", "Good job!"),
            h("button.continue", {
                type: "button",
                onclick: next
            }, "Continue"),
            h("span.sidenote", "Press enter to proceed")
        ]);
    }

    function succeed(word) {
        state.path = ["lesson", "success"];

        word.successes = word.successes || 0;
        word.successes += 1;
        word.swapWith = word.swapWith || 1;
        word.swapWith *= 2;

        explain = false;
    }

    function fail(word, otherwiseCorrect) {
        if (!otherwiseCorrect) {
            word.swapWith = 1;
        }
        explain = true;
    }

    function submitAnswer(e) {
        if (e.code == "Enter") {
            let word = state.words[0];
            let answer = document.getElementsByTagName("input")[0].value;

            let pronunciationCorrect = answer.localeCompare(word.pronunciation) == 0;
            let meaningCorrect = false;
            for (let i = 0; i < word.meanings.length; ++i) {
                if (word.meanings[i].localeCompare(answer) == 0) {
                    meaningCorrect = true;
                    break;
                }
            }

            if (word.type == "pronunciation") {
                if (pronunciationCorrect) {
                    succeed(word);
                } else {
                    fail(word, meaningCorrect);
                }
            } else {
                if (meaningCorrect) {
                    succeed(word);
                } else {
                    fail(word, pronunciationCorrect);
                }
            }
            return false;
        } else {
            return true;
        }
    }

    function practice() {
        let word = state.words[0];
        lastWord = word;

        let hint =
            h("div.explanation", {
                classes: {
                    viewing: explain || !word.swapWith || word.swapWith == 1
                }
            }, word.type == "pronunciation" ?
                    word.pronunciation :
                    word.meanings.map((x, i) => h("span.meaning", { key: i }, x)));
        explain = false;

        let chinese = word.simplified;
        if (word.variants) {
            chinese += " or " + word.variants;
        }

        let whatIs = word.type == "pronunciation" ? "Pronunciation" : "Meaning";
        return h("div.row.centered-column", [
            h("div.centered-column", {
                styles: {
                    position: "relative"
                }
            }, [hint,
                h("span.chinese", {
                    key: practice
                }, chinese)
            ]),
            h("div", whatIs),
            h("input.answer", {
                onkeydown: submitAnswer,
                placeholder: whatIs
            })
        ]);
    }

    function setupNext(f) {
        let fn = function (e) {
            if (e.code == "Enter") {
                window.removeEventListener("keypress", fn);
                f();
                projector.scheduleRender();
                return false;
            }
            return true;
        };
        window.addEventListener("keypress", fn);
    }

    return {
        start: start,
        practice: practice,
        success: success
    };
})();