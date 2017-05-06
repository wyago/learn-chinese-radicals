#include "lesson.js"

window.addEventListener("error", function (message, url, lineNumber) {
    document.getElementById("loader").hidden = true;
    document.getElementById("error").hidden = false;
    return true;
});

let h = maquette.h;
let projector = maquette.createProjector({
    afterRender: function () {
        let inputs = document.getElementsByTagName("input");
        if (inputs.length > 0) {
            inputs[0].focus();
        } else {
            let buttons = document.getElementsByTagName("button");
            if (buttons.length > 0) {
                buttons[0].focus();
            }
        }
        saveState();
    }
});

var state;

function saveState() {
    localStorage.setItem("state", JSON.stringify(state));
}

function startLesson() {
    state.path = ["lesson", "practice"];
    saveState();
}

function intro() {
    return h("div.row", [
        h("h2", "Would you like to start training?"),
        h("p", "Train for as long as you like. Data is saved locally, " +
            "so you'll have to transfer save data manually if you want to " +
            "change devices for now."),
        h("div.horizontal-center", [
            h("button", {
                onclick: startLesson
            }, "Start"),
        ])
    ]);
}

let rootPaths = {
    "intro": intro,
    "lesson": Lesson
};

function byPath(path) {
    var current = rootPaths;
    for (let i = 0; i < path.length - 1; ++i) {
        current = current[path[i]];
    }

    return current[path[path.length - 1]]();
}

function createMain() {
    return function () {
        return h("div.container", byPath(state.path));
    }
}

function endLoading() {
    document.getElementById("loader").style.opacity = 0;
    setTimeout(function () {
        document.getElementById("loader").hidden = true;
    }, 200);
}

function initialize(first) {
    endLoading();
    projector.append(document.body, createMain());
}

window.addEventListener('load', function () {
    state = localStorage.getItem("state");
    if (state === null) {
        state = {
            version: 0,
            words: [],
            path: ["intro"]
        };

        let request = new XMLHttpRequest();
        request.addEventListener("load", function () {
            let words = JSON.parse(request.responseText);
            for (let i = 0; i < words.length; ++i) {
                state.words.push(JSON.parse(JSON.stringify(words[i])));
                state.words[i * 2].type = "meaning";
                state.words.push(JSON.parse(JSON.stringify(words[i])));
                state.words[i * 2 + 1].type = "pronunciation";
            }
            localStorage.setItem("state", JSON.stringify(state));
            initialize();
        });
        request.open("GET", "items.json");
        request.send();
    } else {
        state = JSON.parse(state);
        initialize();
    }
});