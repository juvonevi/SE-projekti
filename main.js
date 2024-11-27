"use strict";
"@ts-check"

// TIEA207

/**
 * Tapahtuman kuuntelija sivun lataamiselle
 */
window.addEventListener("load", function() {
    const numOfPages = 5;
    let searchVisible = true;
    let allSounds = [];
    for (let i = 0; i < numOfPages; i++) {
        allSounds[i] = Array(10);
    }
    allSounds.selected = 0;
    createPageButtons();
    document.getElementById("pageButton1").classList.add("selectedPage");
    let dragImg = new Image();
    dragImg.src = "GrabCursor.png";
    document.getElementById("file-input").addEventListener("change",handleFile);
    const defaultKeys = ["1","2","3","4","5","6","7","8","9","0"];  
    const defaultKeys2 = ["q","w","e","r","t","y","u","i","o","p"];  
    let myKeys = Array.from(defaultKeys);
    let myKeys2 = Array.from(defaultKeys2);
    let themes = ["lightmode", "darkmode.css"]; //css tiedoston nimi
    let themeIcons = ["☼", "☾"]; //Napin käyttämä ikoni
    let themeColors = ["lightblue", "#3d414a"]; //Napin käyttämä väri (css-tiedoston second color)
    let themeTextColors = ["#011a42", "white"]; //Napin tekstin väri (css-tiedoston text color)
    themes.chosen = 0;


    /**
     * Näyttää varoituksen mahdollisesti aikuissisältöä sisältävistä äänistä,
     * jos sitä ei ole näytetty vielä
     */
    showAdultContentWarning();
    function showAdultContentWarning() {
        if (localStorage.getItem("warningShown")) {
            return;
        }
        document.getElementById("adultContentWarning").style.display = "initial";
        document.getElementById("aanet").style.display = "none";
        document.getElementById("closeWarning2").addEventListener("click", function() {
            document.getElementById("adultContentWarning").style.display = "none";
            document.getElementById("aanet").style.display = "initial";
            localStorage.setItem("warningShown", "true");
        });
    }

    /**
     * Luo sivumäärälle tarvittavat napit
     */
    function createPageButtons() {
        let arrow = document.getElementById("arrowLeft");
        let after = arrow;
        for (let i = 0; i < numOfPages; i++) {
            let button = document.createElement("input");
            button.type = "button";
            button.id = "pageButton" + (i+1);
            button.value = i + 1;
            after.after(button);
            after = button;
        }
    }

    //Avataan indexed db
    let db;
    const openRequest = window.indexedDB.open("audiofiles", 1);
    openRequest.addEventListener("error", () =>
        console.error("Database failed to open"),
    );

    let gotStored = false;
    openRequest.addEventListener("success", () => {
        console.log("Database opened successfully");
        db = openRequest.result;
        if (!gotStored) {
            getStoredSounds();
            gotStored = true;
        }
        showMySounds();
    });
    openRequest.addEventListener("upgradeneeded", (e) => {
        db = e.target.result;
  
        const objectStore = db.createObjectStore("audiofiles", {
            keyPath: "id",
            autoIncrement: true,
        });
  
        objectStore.createIndex("name", "name", { unique: false });
        objectStore.createIndex("file", "file", { unique: false });
        console.log("Database setup complete");
        showMySounds();
    });

    /**
     * Lisää äänen indexed db:hen ja local storageen
     * @param {String} filename 
     * @param {File} audiofile 
     * @param {number} i 
     * @param {String} sound 
     * @param {number} j 
     */
    function addData(filename, audiofile, i, sound, j) {
        const newItem = { name: filename, file: audiofile };
        const transaction = db.transaction(["audiofiles"], "readwrite");
        const objectStore = transaction.objectStore("audiofiles");
        const addRequest = objectStore.add(newItem);
    
        addRequest.addEventListener("success", (e) => {
            console.log("Saved with id ", e.target.result);
            let key = e.target.result;
            allSounds[j][i] = {"name" : filename, "sound" : sound, "db" : key};
            showMySounds();
            localStorage.setItem("sounds" + (j+1),  JSON.stringify(allSounds[j]));
        });
    
        // Report on the success of the transaction completing, when everything is done
        transaction.addEventListener("complete", () => {
        console.log("Transaction completed: database modification finished.");
        });
    
        transaction.addEventListener("error", () =>
        console.log("Transaction not opened due to error"),
        );
    }

    /**
     * Poistaa äänen indexed db:stä id:n perusteella
     * @param {number} item_id 
     */
    function deleteItem(item_id) {
        const transaction = db.transaction(["audiofiles"], "readwrite");
        const objectStore = transaction.objectStore("audiofiles");
        const deleteRequest = objectStore.delete(item_id);
      
        transaction.addEventListener("complete", () => {
            console.log(`File ${item_id} deleted.`);
        });
    }

    /**
     * Hakee äänen indexed db:stä id:n perusteella
     * @param {number} item_id 
     * @param {number} i 
     * @param {number} j 
     */
    function getData(item_id, i, j) {    
        const transaction = db.transaction(["audiofiles"], "readwrite");
        const objectStore = transaction.objectStore("audiofiles");
        const getRequest = objectStore.get(item_id);
        transaction.addEventListener("complete", () => {
            const result = getRequest.result;
            let file = result.file;
            let blob = window.URL || window.webkitURL;
            let url = blob.createObjectURL(file);
            allSounds[i][j] = {"name" : result.name, "sound" : url, "db" : item_id};
            localStorage.setItem("sounds" + (i+1),  JSON.stringify(allSounds[i]));
            //console.log("a" + (i+1), allSounds[i]);
            showMySounds();
        });
    }

    let changeThemeOpen = false;
    document.getElementById("changeTheme").addEventListener("click", chooseTheme);
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
                button.theme = i;
                button.addEventListener("click", changeTheme);
            }
        }
    }

    /**
     * Vaihtaa teeman
     * @param {*} e 
     */
    function changeTheme(e) {
        let theme = e.target.theme;
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
        document.getElementById("chooseTheme").style.display = "none";
        changeThemeOpen = false;
    }

    let infoVisible = false;
    document.getElementById("info").addEventListener("click", openOrCloseInfo);
    document.getElementById("closePopup").addEventListener("click", openOrCloseInfo);

    /**
     * Avaa tai sulkee info-popupin
     */
    function openOrCloseInfo() {
        if (infoVisible) {
            document.getElementById("popup").style.display = "none";
            infoVisible = false;
        }
        else {
            document.getElementById("popup").style.display = "initial";
            infoVisible = true;
        }
    }

    let warningVisible = false;
    document.getElementById("closeWarning").addEventListener("click", openOrCloseWarning);

    /**
     * Avaa tai sulkee varoituksen tilan puutteesta
     */
    function openOrCloseWarning() {
        if (warningVisible) {
            document.getElementById("noSpace").style.display = "none";
            warningVisible = false;
        }
        else {
            document.getElementById("noSpace").style.display = "initial";
            warningVisible = true;
        }
    }

    let firefox = true;
    if (navigator.userAgent.indexOf("Firefox") <= 0) {
        changeForOtherBrowsers();
        firefox = false;
    }
    /**
     * Muuttaa ulkoasua sopivammaksi Chromelle
     */
    function changeForOtherBrowsers() {
        let audios = document.getElementsByTagName("audio");
        for (let audio of audios) {
            audio.style.zoom = "90%";
            audio.style.position = "relative";
            audio.style.top = "10px";
        }
        let spans = document.querySelectorAll(".aanirivi span");
        for (let span of spans) {
            span.style.top = "0";
        }
    }

    //Tarkistaa onko käyttäjällä darkmode käytössä
    const isDarkMode = () => window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    //Ottaa käyttöön darkmode.css tiedoston
    const applyDarkMode = (isDark) => {
        if (isDark) {
            document.getElementById("changeTheme").value = "☾";         
            let link = document.createElement("link");
            link.rel = "StyleSheet";
            link.href = "darkmode.css";        
            link.type = "text/css";
            let firstLink = document.getElementsByTagName("link")[0];
            firstLink.after(link);
            themes.chosen = 1;
        }
    };
    applyDarkMode(isDarkMode());

    /**
     * Hakee käyttäjän äänet local storagesta
     */
    //getStoredSounds();
    function getStoredSounds() {
        for (let i = 0; i < numOfPages; i++) {
            let sounds = JSON.parse(localStorage.getItem("sounds"+(i+1)));
            if (sounds) {
                console.log(sounds);
                for (let j = 0; j < sounds.length; j++) {
                    if (typeof sounds[j] !== "undefined" && sounds[j]) {
                        if (sounds[j].sound.startsWith("blob")) {
                            getData(parseInt(sounds[j].db), i, j);   
                        }
                        else {
                            allSounds[i][j] = sounds[j];
                        }                 
                    } 
                }
            }
        }
    }

    /**
     * Hakee käyttäjän vaihtamat napit local storagesta
     */
    getStoredKeys();
    function getStoredKeys() {
        let buttons = document.getElementsByClassName("sideButton");
        let keys = JSON.parse(localStorage.getItem("keys"));
        if (keys) {
            for (let i = 0; i < keys.length; i++) {
                myKeys[i] = keys[i];
                buttons[i].value = keys[i];
            }
        }
        let keys2 = JSON.parse(localStorage.getItem("keys2"));
        if (keys2) {
            for (let i = 0; i < keys.length; i++) {
                myKeys2[i] = keys2[i];
            }
        }
    }

    audioEventListeners("audio");
    function audioEventListeners(audioClass) {
        // Odottaa että ääni on saapunut ja sitten piirtää graafin
        let audios = document.getElementsByClassName(audioClass);
        for (let audio of audios) {
            audio.addEventListener("durationchange", (e) => {
                e.preventDefault();
                setupAudioAnalyser(audio.parentElement);
            });
        }      
    }
    
    /**
     * Näyttää käyttäjän äänet sivulla
     */
    showMySounds();
    function showMySounds() {
        let sounds = allSounds[allSounds.selected];
        //console.log(allSounds.selected);
        //console.log(sounds);
        let paikat = document.getElementsByClassName("aanirivi");
        for (let i = 0; i < paikat.length; i++) {
            if (!sounds[i] || typeof sounds[i] === "undefined") {
                paikat[i].children[0].textContent = "Add sound";
                paikat[i].children[3].style.visibility = "hidden";
                paikat[i].children[4].style.visibility = "hidden";
                paikat[i].children[5].style.visibility = "hidden";
                paikat[i].removeAttribute("draggable");
            }
            else {
                let name = sounds[i].name;
                if (name.length > 40) {
                    name = name.substring(0, 40) + "...";
                }
                paikat[i].children[0].textContent = name;
                paikat[i].children[3].style.visibility = "visible";
                paikat[i].children[4].style.visibility = "visible";
                paikat[i].children[4].setAttribute("src", sounds[i].sound);
                paikat[i].children[5].style.visibility = "visible";
                paikat[i].setAttribute("draggable", "true");    
                addDragListeners("aanirivi", 1);   
            }
        }
        if (!searchVisible && allSounds.selected !== numOfPages-1) {
            let sounds2 = allSounds[allSounds.selected+1];
            let paikat2 = document.getElementsByClassName("aanirivi2");
            for (let i = 0; i < paikat2.length; i++) {
                if (!sounds2[i] || typeof sounds2[i] === "undefined") {
                    paikat2[i].children[0].textContent = "Add sound";
                    paikat2[i].children[3].style.visibility = "hidden";
                    paikat2[i].children[4].style.visibility = "hidden";
                    paikat2[i].children[5].style.visibility = "hidden";
                    paikat2[i].removeAttribute("draggable");
                }
                else {
                    let name = sounds2[i].name;
                    if (name.length > 40) {
                        name = name.substring(0, 40) + "...";
                    }
                    paikat2[i].children[0].textContent = name;
                    paikat2[i].children[3].style.visibility = "visible";
                    paikat2[i].children[4].style.visibility = "visible";
                    paikat2[i].children[4].setAttribute("src", sounds2[i].sound);
                    paikat2[i].children[5].style.visibility = "visible";
                    paikat2[i].setAttribute("draggable", "true");
                    addDragListeners("aanirivi2", 2);
                }   
            }
        }
    }

    /**
     * Lisää dragstart event listenerit
     * @param {String} soundSlotClass 
     * @param {number} page
     */
    function addDragListeners(soundSlotClass, page) {
        let paikat = document.getElementsByClassName(soundSlotClass);
        for (let i = 0; i < paikat.length; i++) {
            paikat[i].addEventListener("dragstart", function(e) {
                let sounds;
                if (page === 1) {
                    sounds = allSounds[allSounds.selected];
                }
                else {
                    sounds = allSounds[allSounds.selected+1];
                }
                console.log(allSounds.selected);
                e.stopImmediatePropagation();
                e.dataTransfer.setData("text/plain", sounds[i].name);
                e.dataTransfer.setData("text/html", sounds[i].sound);
                e.dataTransfer.setData("from", i);
                if (soundSlotClass === "aanirivi") {
                    e.dataTransfer.setData("array", allSounds.selected);
                }
                else {
                    e.dataTransfer.setData("array", allSounds.selected+1);
                }
                if (sounds[i].db) {
                    e.dataTransfer.setData("db", sounds[i].db);
                }             
                e.dataTransfer.setDragImage(dragImg, 30, 26);
            });
        }
    }

    /**
     * Lisää checkboxeihin event listenerit
     */
    prepareCheckboxes("loop", "audio");
    function prepareCheckboxes(cbClass, audioClass) {
        let checkboxes = document.getElementsByClassName(cbClass);
        let audios = document.getElementsByClassName(audioClass);
        for (let i = 0; i < checkboxes.length; i++) {
            checkboxes[i].addEventListener("input", cbInput);
            function cbInput() {
                if (checkboxes[i].checked) {
                    audios[i].loop = true;
                }
                else {
                    audios[i].loop = false;
                }
            }
        }
    }

    /**
     * Alustaa droppaukset
     */
    prepareDrop();
    function prepareDrop() {
        soundSlotDrop("aanirivi");

        let trash = document.getElementById("delete");
        trash.addEventListener("dragover", function(e) {
            e.preventDefault();
            e.dataTransfer.dropEffect = "move";
        });
        trash.addEventListener("drop", function(e) {
            e.preventDefault();
            //let sounds = allSounds[allSounds.selected];
            let from = e.dataTransfer.getData("from");
            let array = e.dataTransfer.getData("array");
            if (!from) {
                return;
            }
            if (allSounds[array][from].db) {
                deleteItem(allSounds[array][from].db);
            }
            allSounds[array][from] = undefined;
            showMySounds();
            localStorage.setItem("sounds" + (parseInt(array)+1),  JSON.stringify(allSounds[array]));
        });
    }

    /**
     * Mahdollistaa äänien droppauksen äänilistaan
     */
    function soundSlotDrop(slotClass) {
        let paikat = document.getElementsByClassName(slotClass);
        for (let i = 0; i < paikat.length; i++) {
            paikat[i].addEventListener("dragover", function(e) {
                e.preventDefault();
                e.dataTransfer.dropEffect = "copy";
            });
    
            paikat[i].addEventListener("drop", function(e) {
                e.preventDefault();
                e.stopImmediatePropagation();
                console.log("drop");
                let from = e.dataTransfer.getData("from");
                let array = parseInt(e.dataTransfer.getData("array"));
                let db = e.dataTransfer.getData("db");
                let nimi = e.dataTransfer.getData("text/plain");
                let aani = e.dataTransfer.getData("text/html");    
                let sounds = allSounds[allSounds.selected];
                if (!searchVisible && (array !== allSounds.selected || paikat[i].classList.contains("aanirivi2"))) { 
                    if (array % 2 === 0 && paikat[i].classList.contains("aanirivi2")) {
                        if (typeof allSounds[array+1][i] !== "undefined") {
                            if (allSounds[array][i].db) {
                                allSounds[array][from] = {"name" : allSounds[array][i].name, "sound" : allSounds[array][i].sound, "db" : allSounds[array][i].db};
                            }
                            allSounds[array][from] = {"name" : sounds[i].name, "sound" : sounds[i].sound};
                        }
                        else {
                            allSounds[array][from] = undefined;
                        }
                        if (db) {
                            allSounds[array+1][i] = {"name" : nimi, "sound" : aani, "db" : db};
                        }
                        else {
                            allSounds[array+1][i] = {"name" : nimi, "sound" : aani};
                        }
                        console.log(allSounds[array+1]);
                        localStorage.setItem("sounds" + (array+2),  JSON.stringify(allSounds[array+1]));
                    }
                    else if (array % 2 !== 0 && paikat[i].classList.contains("aanirivi")) {
                        if (typeof allSounds[array-1][i] !== "undefined") {
                            if (allSounds[array][i].db) {
                                allSounds[array][from] = {"name" : allSounds[array][i].name, "sound" : allSounds[array][i].sound, "db" : allSounds[array][i].db};
                            }
                            allSounds[array][from] = {"name" : allSounds[array][i].name, "sound" : allSounds[array][i].sound};
                        }
                        else {
                            allSounds[array][from] = undefined;
                        }
                        if (db) {
                            allSounds[array-1][i] = {"name" : nimi, "sound" : aani, "db" : db};
                        }
                        else {
                            allSounds[array-1][i] = {"name" : nimi, "sound" : aani};
                        }
                        console.log(allSounds[array-1]);
                        localStorage.setItem("sounds" + array,  JSON.stringify(allSounds[array-1]));
                    }
                    else {
                        if (typeof allSounds[array][i] !== "undefined") {
                            if (allSounds[array][i].db) {
                                allSounds[array][from] = {"name" : allSounds[array][i].name, "sound" : allSounds[array][i].sound, "db" : allSounds[array][i].db};
                            }
                            allSounds[array][from] = {"name" : allSounds[array][i].name, "sound" : allSounds[array][i].sound};
                        }
                        else {
                            allSounds[array][from] = undefined;
                        }
                        if (db) {
                            allSounds[array][i] = {"name" : nimi, "sound" : aani, "db" : db};                             
                        }
                        else {
                            allSounds[array][i] = {"name" : nimi, "sound" : aani};
                        }
                    }
                    console.log(allSounds[array]);
                    localStorage.setItem("sounds" + (array+1),  JSON.stringify(allSounds[array]));
                }
                else {
                    if (from) {
                        if (typeof sounds[i] !== "undefined") {
                            if (sounds[i].db) {
                                sounds[from] = {"name" : sounds[i].name, "sound" : sounds[i].sound, "db" : sounds[i].db};   
                            }
                            sounds[from] = {"name" : sounds[i].name, "sound" : sounds[i].sound};
                        }
                        else {
                            sounds[from] = undefined;
                        }
                    }
                    if (db) {
                        sounds[i] = {"name" : nimi, "sound" : aani, "db" : db};   
                    }
                    else {
                        sounds[i] = {"name" : nimi, "sound" : aani};    
                    }     
                    console.log(sounds);
                    localStorage.setItem("sounds" + (allSounds.selected+1),  JSON.stringify(allSounds[allSounds.selected]));
                }     
                showMySounds();
                let audio = paikat[i].children[4];
                audio.src = aani;
                
                return;
            });
        }
    }

    /**
     * Käsittelee paikallisten tiedostojen lisäämisen
     */
    function handleFile() {
        const files = document.getElementById("file-input").files;
        //console.log(files)
        for (const file of files) {
            let nimi = file.name;
            let blob = window.URL || window.webkitURL;
            if (!blob) {
                console.log('Your browser does not support Blob URLs');
                return;           
            }
            let fileURL = blob.createObjectURL(file);
            //console.log(file);
            //console.log('File name: ' + file.name);
            //console.log('File BlobURL: ' + fileURL);
            let aani = fileURL;
            let paikat = document.getElementsByClassName("aanirivi");
            let sounds = allSounds[allSounds.selected];
            let lisatty = false;
            for (let i = 0; i < sounds.length; i++) {         
                if (!sounds[i]) {      
                    sounds[i] = {"name" : "placeholder", "sound" : "placeholder", "db" : 0};      
                    let audio = paikat[i].children[4];    
                    audio.src = aani;
                    lisatty = true;            
                    addData(nimi, file, i, aani, allSounds.selected);
                    break;
                }
            }
            if (!lisatty) {
                for (let j = 0; j < numOfPages; j++) {
                    let sounds = allSounds[j];
                    if (j !== allSounds.selected) {
                        for (let i = 0; i < sounds.length; i++) {
                            if (!sounds[i]) {
                                sounds[i] = {"name" : "placeholder", "sound" : "placeholder", "db" : 0}; 
                                let audio = paikat[i].children[4];
                                audio.src = aani;
                                lisatty = true;
                                addData(nimi, file, i, aani, j);
                                break;
                            }
                        }
                    }
                }                   
            }
            if (!lisatty) {
                openOrCloseWarning();
            }
        }      
    }

    /**
     * Laittaa hakutulokset näkyviin sivulle
     * @param {*} data 
     */
    function showSearchResults(data) {
        let htdiv = document.getElementById("hakutulokset");
        while(htdiv.firstChild){
            htdiv.removeChild(htdiv.firstChild);
        }
        for (let aani of data) {
            let div = document.createElement("div");
            htdiv.appendChild(div);
            div.classList.add("searchresult");
            let nimi = document.createElement("label");
            nimi.textContent = aani.name;
            div.appendChild(nimi);
            if (!firefox) {
                nimi.style.top = "1em";
            }
            let audio = document.createElement("audio");
            audio.setAttribute("controls", "");
            audio.setAttribute("src", aani.previews["preview-hq-mp3"]);
            div.appendChild(audio);
            div.style.display = "inline-block";
            nimi.style.float = "left";
            audio.style.float = "right";
            audio.style.clear = "right";
            div.setAttribute("draggable", "true");
            div.addEventListener("dragstart", function(e) {
                e.dataTransfer.setData("text/plain", aani.name);
                e.dataTransfer.setData("text/html", aani.previews["preview-hq-mp3"]);
                e.dataTransfer.setDragImage(dragImg, 30, 26);
            });
        }
    }

    document.querySelector('.toggle-button').addEventListener("click", toggleSearchBar);

    /**
     * Näyttää tai piilottaa hakupalkin
     */
    function toggleSearchBar() {
        const searchBar = document.getElementById("hakupalkki");
        const toggleButton = document.querySelector('.toggle-button');

        if (searchVisible) {
            let link = document.createElement("link");
            link.rel = "StyleSheet";
            link.href = "searchHidden.css";        
            link.type = "text/css";
            let firstLink = document.getElementsByTagName("link")[0];
            firstLink.after(link);
            toggleButton.textContent = "Show Search"; 
            searchVisible = false;      
            if (allSounds.selected % 2 !== 0) {
                allSounds.selected = allSounds.selected - 1;
            }
            if (allSounds.selected !== numOfPages-1) {
                createMoreAudioSpaces();
                showMySounds();
            }
            let buttons = document.querySelectorAll("#preset > input");
            buttons[allSounds.selected+1].classList.add("selectedPage");
            if (allSounds.selected !== numOfPages-1) {
                buttons[allSounds.selected+2].classList.add("selectedPage");
            }         
        } else {
            let links = document.getElementsByTagName("link");
             for (let link of links) {
                if (link.href.includes("searchHidden.css")) {
                    link.remove();
                    break;
                }
            }
            let sounds2 = document.getElementsByClassName("aanirivi2");
            while (sounds2[0]) {
                sounds2[0].remove();
            }
            toggleButton.textContent = "Hide Search"; 
            searchVisible = true;
            let buttons2 = document.querySelectorAll("#preset > input");
            for (let j = 1; j < buttons2.length-1; j++) {
                buttons2[j].classList.remove("selectedPage");
            }
            buttons2[allSounds.selected+1].classList.add("selectedPage"); 
        }
    }

    /**
     * Luo lisää paikkoja äänille
     */
    function createMoreAudioSpaces() {
        let aanet = document.getElementById("aanet");
        for (let i = 0; i < 10; i++) {
            let div = document.createElement("div");
            div.classList.add("aanirivi2");
            let label = document.createElement("label");
            label.classList.add("label2");
            label.textContent = "placeholder";
            div.appendChild(label);
            div.appendChild(document.createElement("br"));
            let button = document.createElement("input");
            button.type = "button";
            button.id = "button2" + (i+1);
            button.value = myKeys2[i];
            button.classList.add("sideButton2");
            div.appendChild(button);
            let canvas = document.createElement("canvas");
            canvas.id = "canvas2" + (i+1);
            div.appendChild(canvas);
            let audio = document.createElement("audio");
            audio.id = "audio2" + (i+1);
            audio.setAttribute("controls", "");
            audio.classList.add("audio2");
            div.appendChild(audio);
            let labelfor = document.createElement("label");
            labelfor.for = "cb2" + (i+1);
            let cb = document.createElement("input");
            cb.type = "checkbox"; 
            cb.id = "cb2" + (i+1);
            cb.classList.add("loop2");
            labelfor.appendChild(cb);
            let span = document.createElement("span");
            span.textContent = "⟳";
            labelfor.appendChild(span);
            div.appendChild(labelfor);
            aanet.appendChild(div);
            soundButtonListeners("sideButton2", "audio2");
            audioEventListeners("audio2");
            soundSlotDrop("aanirivi2");
            prepareCheckboxes("loop2", "audio2");
        }
    }

    function soundButtonListeners(buttonClass, audioClass) {
        let buttons = document.getElementsByClassName(buttonClass);
        let audios = document.getElementsByClassName(audioClass);
        for (let i = 0; i < buttons.length; i++) {
            buttons[i].addEventListener("click", buttonPressed);
            buttons[i].addEventListener("dblclick", setupButton);
            function buttonPressed(event) {
                if (event.defaultPrevented) {
                    return; // Do nothing if the event was already processed
                }
                console.log("Pressed button " + (i+1));
                if (audios[i].paused) {
                    audios[i].play();
                }
                else {
                    audios[i].pause();
                }
            }
        }
    }

    //Kuuntelee nappeja
    addButtonListeners();
    function addButtonListeners() {
        //My sounds napit
        soundButtonListeners("sideButton", "audio");
        
        //Presettienvaihtonapit
        let buttons2 = document.querySelectorAll("#preset > input");
        for (let i = 1; i < buttons2.length-1; i++) {
            buttons2[i].addEventListener("click", buttonPressed2);
            function buttonPressed2() {
                if (!searchVisible && allSounds.selected === numOfPages-1 && numOfPages % 2 !== 0 && i !== buttons2.length-2) {
                    createMoreAudioSpaces();
                }
                if (!searchVisible && allSounds.selected !== numOfPages-1 && numOfPages % 2 !== 0 && i === buttons2.length-2) {
                    let sounds2 = document.getElementsByClassName("aanirivi2");
                    while (sounds2[0]) {
                        sounds2[0].remove();
                    }
                }
                allSounds.selected = i-1;
                if (!searchVisible && allSounds.selected % 2 !== 0) {
                    allSounds.selected = allSounds.selected - 1;
                }
                for (let j = 1; j < buttons2.length-1; j++) {
                    buttons2[j].classList.remove("selectedPage");
                }
                buttons2[i].classList.add("selectedPage");
                if (!searchVisible && allSounds.selected !== numOfPages-1) {
                    if (i % 2 !== 0) {
                        buttons2[i+1].classList.add("selectedPage");
                    }
                    else {
                        buttons2[i-1].classList.add("selectedPage");
                    }
                }
                showMySounds();
            }
        }
        buttons2[0].addEventListener("click", buttonPressedL);   
        buttons2[buttons2.length-1].addEventListener("click", buttonPressedR);
    }

    function buttonPressedR() {
        let buttons2 = document.querySelectorAll("#preset > input");
        let oldSelected = allSounds.selected;
        if (allSounds.selected === numOfPages-1) {
            allSounds.selected = 0;
        }
        else if (!searchVisible && numOfPages % 2 !== 0 && allSounds.selected === numOfPages-2) {
            allSounds.selected = 0;
        }
        else {
            allSounds.selected = allSounds.selected+1;
            if (!searchVisible && allSounds.selected % 2 !== 0) {
                allSounds.selected = allSounds.selected + 1;
            }
        }            
        for (let j = 1; j < buttons2.length-1; j++) {
            buttons2[j].classList.remove("selectedPage");
        }
        buttons2[allSounds.selected+1].classList.add("selectedPage");
        if (!searchVisible && allSounds.selected !== numOfPages-1) {
            buttons2[allSounds.selected+2].classList.add("selectedPage");
        }
        if (!searchVisible && allSounds.selected === numOfPages-1 && numOfPages % 2 !== 0 && oldSelected !== numOfPages-1) {
            let sounds2 = document.getElementsByClassName("aanirivi2");
            while (sounds2[0]) {
                sounds2[0].remove();
            }
        }
        if (!searchVisible && allSounds.selected !== numOfPages-1 && numOfPages % 2 !== 0 && oldSelected === numOfPages-1) {
            createMoreAudioSpaces();
        }
        showMySounds();
    }

    function buttonPressedL() {
        let buttons2 = document.querySelectorAll("#preset > input");
        let oldSelected = allSounds.selected;
        if (allSounds.selected === 0) {
            allSounds.selected = numOfPages-1;
        }
        else if (!searchVisible && allSounds.selected === 0 && numOfPages % 2 === 0) {
            allSounds.selected = numOfPages-2;
        }
        else {
            allSounds.selected = allSounds.selected-1;
            if (!searchVisible && allSounds.selected % 2 !== 0) {
                allSounds.selected = allSounds.selected - 1;
            }
        }            
        for (let j = 1; j < buttons2.length-1; j++) {
            buttons2[j].classList.remove("selectedPage");
        }
        buttons2[allSounds.selected+1].classList.add("selectedPage");
        if (!searchVisible && allSounds.selected !== numOfPages-1) {
            buttons2[allSounds.selected+2].classList.add("selectedPage");
        }
        if (!searchVisible && allSounds.selected === numOfPages-1 && numOfPages % 2 !== 0 && oldSelected !== numOfPages-1) {
            let sounds2 = document.getElementsByClassName("aanirivi2");
            while (sounds2[0]) {
                sounds2[0].remove();
            }
        }
        if (!searchVisible && allSounds.selected !== numOfPages-1 && numOfPages % 2 !== 0 && oldSelected === numOfPages-1) {
            createMoreAudioSpaces();
        }
        showMySounds();
    }
    
    //Kuuntelee nappia haku
    document.getElementById("haku").addEventListener("click", hakuPressed);
    document.getElementById("hakulomike").addEventListener("submit", hakuPressed);
    function hakuPressed(e) {
        e.preventDefault()
        let syote = document.forms[0].elements[0].value;
        if ((this.lastSearched && 
            this.lastSearched === syote) ||
            !syote) { // <- Viimeinen on tyhjan haun lähettämisen esto
            return;
        }
        this.lastSearched = syote;
     
        if (localStorage.getItem("haetutAanet")) {
            let haetutAanet = localStorage.getItem("haetutAanet");
            if(syote === haetutAanet[0]) {
                //setupAudioAnalyser(sounds);
                return;
            }
        }
        searchsound(syote).then(result => {
            // Palautetaan äänilinkki
            if (result.ok) {
                result.json().then((json) => { 
                    console.log(json.results)
                    showSearchResults(json.results);
                })
            }
            else {
                // TODO: Jokin ilmoitusjärjestelmä?
                console.log(result.statusText)
            }
        })
    }

    const keys = ['1','2','3','4','5','6','7','8','9','0','q','w','e','r','t','y','u','i','o','p','a','s','d','f','g','h','j','k','l','z','x','c','v','b','n','m'];
    
    /**
     * Setting up a dblpressed button
     * @param {*} event 
     */
   function setupButton(event) {
        const button = event.target;
        let valittuna = document.getElementsByClassName("nappiValittuna");
        if (valittuna.length > 0) {
            valittuna[0].classList.remove("nappiValittuna");
        }
        button.classList.add("nappiValittuna");
    }

    document.addEventListener("keydown", keyPressed);

    function keyPressed(event) {
        if (event.defaultPrevented) {
            return; // Do nothing if the event was already processed
        }
        
        // Näppäin jota on painettu
        const key = event.key;
        if (typeof key === undefined) {
            return;
        }
        console.log(key);

        //Tarkistaa onko jokin nappi valittuna, ja yrittää muuttaa napin jos on
        let valittuna = document.getElementsByClassName("nappiValittuna");
        if (valittuna.length > 0) {
            changeKey(key, valittuna[0]);
        }
        else {
            if (key === "ArrowRight") {
                buttonPressedR();
            }
            else if (key === "ArrowLeft") {
                buttonPressedL();
            }
            else {
                playByKey(key);
            }      
        }    
    }

    /**
     * Vaihtaa napin näppäimen
     * @param {*} key 
     * @param {*} button 
     */
    function changeKey(key, button) {
        if (key === "Escape" || key === button.value) {
            button.classList.remove("nappiValittuna");
        }

        let buttonNumber;
        if (button.classList.contains("sideButton")) {
            let buttons = document.getElementsByClassName("sideButton");
            for (let i = 0; i < buttons.length; i++) {
                if (button.id === buttons[i].id) {
                    buttonNumber = i;
                    break;
                }
            }
        }
        else {
            let buttons = document.getElementsByClassName("sideButton2");
            for (let i = 0; i < buttons.length; i++) {
                if (button.id === buttons[i].id) {
                    buttonNumber = i;
                    break;
                }
            }
        }
        
        const pressedKey = key;
        for (let i = 0; i < keys.length; i++ ) {
        
            // Tarkastetaan onko hyväksytty näppäin
            if (pressedKey ===  keys[i]) {
                let buttons = document.getElementsByClassName("sideButton");
                let buttons2 = document.getElementsByClassName("sideButton2");
                if (myKeys.includes(pressedKey)) {
                    let oldLocation = myKeys.indexOf(pressedKey);
                    buttons[oldLocation].value = button.value;
                    myKeys[oldLocation] = button.value;
                }
                if (myKeys2.includes(pressedKey)) {
                    let oldLocation = myKeys2.indexOf(pressedKey);
                    if (!searchVisible) {
                        let buttons2 = document.getElementsByClassName("sideButton2");
                        buttons2[oldLocation].value = button.value;
                    }
                    myKeys2[oldLocation] = button.value;
                }
                button.value = pressedKey;
                // Tallennetaan valinta
                if (button.classList.contains("sideButton2")) {
                    myKeys2[buttonNumber] = pressedKey;
                }
                else {
                    myKeys[buttonNumber] = pressedKey;
                }  
                console.log("Passed key");
                button.classList.remove("nappiValittuna");
                localStorage.setItem("keys",  JSON.stringify(myKeys));
                localStorage.setItem("keys2",  JSON.stringify(myKeys2));
                break;
            }
        }
    }

    function playByKey(key) {
        let audios = document.querySelectorAll(".aanirivi > audio");
        for (let i = 0; i < myKeys.length; i++) {
            if (key === myKeys[i]) {
                if (audios[i].paused) {
                    audios[i].play();
                }
                else {
                    audios[i].pause();
                }
            }        
        }
        if (!searchVisible) {
            let audios2 = document.querySelectorAll(".aanirivi2 > audio");
            for (let i = 0; i < myKeys2.length; i++) {
                if (key === myKeys2[i]) {
                    if (audios2[i].paused) {
                        audios2[i].play();
                    }
                    else {
                        audios2[i].pause();
                    }
                }        
            }
        }
    }  
});