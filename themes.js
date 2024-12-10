"use strict";
"@ts-check"

let themes = ["lightmode", "darkmode.css", "lightpink.css", "darkpink.css", "red.css", "darkgreen.css", "lightgreen.css", "darkblue.css", "beige.css"]; //css tiedoston nimi
let themeIcons = ["☼", "☾", "☆", "★", "♥", "☘", "✿", "☁", "⯌"]; //Napin käyttämä ikoni
let themeColors = ["lightblue", "#3d414a", "#ffb3d9", "#b3005ad3", "#b22222", "#637c36", "#8db969", "#303858", "#b89a81"]; //Napin käyttämä väri (css-tiedoston second color)
let themeTextColors = ["#011a42", "white", "#1a000d", "white", "white", "white", "rgb(22, 44, 28)", "white", "rgb(43, 29, 24)"]; //Napin tekstin väri (css-tiedoston text color)

themes.chosen = 0;

let changeThemeOpen = false;

/**
 * Avaa teemanvaihtovalikon
 */
function chooseTheme() {
    let div = document.getElementById("chooseTheme");
    if (changeThemeOpen) {
        div.style.display = "none";
        changeThemeOpen = false;
        return;
    }
    while(div.firstChild){
        div.removeChild(div.firstChild);
    }
    div.style.display = "initial";
    changeThemeOpen = true;
    for (let i = 0; i < themes.length; i++) {
        if (i !== themes.chosen) {
            let label = document.createElement("label");
            label.for = "theme" + i;
            label.classList.add("roundButtonLabel");
            div.appendChild(label);
            let button = document.createElement("input");
            button.type = "button";
            button.id = "theme" + i;
            button.classList.add("roundButton");
            button.value = themeIcons[i];      
            label.style.background = themeColors[i];
            button.style.color = themeTextColors[i];
            label.appendChild(button);
            if (i === 0) {
                button.style.right = "0.05em";
            }
            button.theme = i;
            button.addEventListener("click", changeTheme);
        }
    }
}

/**
 * Vaihtaa teeman
 * @param {*} e 
 */
function changeTheme(e, themeNumber) {
    let theme;
    if (e) {
        theme = e.target.theme;
    }
    else {
        theme = themeNumber;
    }
    let links = document.getElementsByTagName("link");
    for (let link of links) {
        if (link.href.includes(themes[themes.chosen])) {
            link.remove();
        }
    }
    document.getElementById("changeTheme").value = themeIcons[theme];
    if (theme !== 0) {
        let link = document.createElement("link");
        link.rel = "StyleSheet";
        link.href = themes[theme];        
        link.type = "text/css";
        let firstLink = document.getElementsByTagName("link")[0];
        firstLink.after(link);
    }
    themes.chosen = theme;
    localStorage.setItem("chosenTheme", theme);
    document.getElementById("chooseTheme").style.display = "none";
    changeThemeOpen = false;
}

//Ottaa käyttöön darkmode.css tiedoston
function applyDarkMode() {
    document.getElementById("changeTheme").value = "☾";         
    let link = document.createElement("link");
    link.rel = "StyleSheet";
    link.href = "darkmode.css";        
    link.type = "text/css";
    let firstLink = document.getElementsByTagName("link")[0];
    firstLink.after(link);
    themes.chosen = 1;
};

/**
 * Vaihtaa teeman käyttäjän viimeksi valitsemaan teemaan
 */
function changeToUserChosenTheme() {
    if (localStorage.getItem("chosenTheme")) {
        changeTheme(null, parseInt(localStorage.getItem("chosenTheme")));
    }
}
