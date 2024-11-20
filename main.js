"use strict";
"@ts-check"

// TIEA207

/**
 * Tapahtuman kuuntelija sivun lataamiselle
 */
window.addEventListener("load", function() {
    const numOfPages = 5;
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
    let myKeys = Array.from(defaultKeys);

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
        const objectStore = db.transaction("audiofiles").objectStore("audiofiles");
        objectStore.openCursor().addEventListener("success", (e) => {
            const cursor = e.target.result;
            if (cursor) {
                if (cursor.value.id === item_id) {
                    let file = cursor.value.file;
                    let blob = window.URL || window.webkitURL;
                    let url = blob.createObjectURL(file);
                    allSounds[i][j] = {"name" : cursor.value.name, "sound" : url, "db" : item_id};
                }
                cursor.continue();      
            } 
            else {
                console.log("Done");
                localStorage.setItem("sounds" + (i+1),  JSON.stringify(allSounds[i]));
                showMySounds();
            }
        });
    }

    document.getElementById("darkmodeToggle").addEventListener("input", toggleDarkmode);
    /**
     * Vaihtaa darkmode/lightmode checkboxin mukaan
     */
    function toggleDarkmode() {
        if (document.getElementById("darkmodeToggle").checked) {
            applyDarkMode(true);
        }
        else {
            applyLightmode();
        }
    }

    /**
     * Palauttaa alkuperäiset värit
     */
    function applyLightmode() {
        document.querySelector("label[for=darkmodeToggle] > span").textContent = "☼";
        let secondLink = document.getElementsByTagName("link")[1];
        secondLink.remove();
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
            document.getElementById("darkmodeToggle").checked = "checked";
            document.querySelector("label[for=darkmodeToggle] > span").textContent = "☾";
            
            let link = document.createElement("link");
            link.rel = "StyleSheet";
            link.href = "darkmode.css";        
            link.type = "text/css";
            let firstLink = document.getElementsByTagName("link")[0];
            firstLink.after(link);
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
    }

    audioEventListeners();
    function audioEventListeners() {
        // Odottaa että ääni on saapunut ja sitten piirtää graafin
        let audios = document.querySelectorAll(".aanirivi > audio");
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
        let paikat = document.getElementsByClassName("aanirivi");
        for (let i = 0; i < paikat.length; i++) {
            if (typeof sounds[i] === "undefined") {
                paikat[i].children[0].textContent = "Add sound";
                paikat[i].children[3].style.visibility = "hidden";
                paikat[i].children[4].style.visibility = "hidden";
                paikat[i].children[5].style.visibility = "hidden";
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
                paikat[i].addEventListener("dragstart", function(e) {
                    e.dataTransfer.setData("text/plain", sounds[i].name);
                    e.dataTransfer.setData("text/html", sounds[i].sound);
                    e.dataTransfer.setData("from", i);
                    if (sounds[i].db) {
                        e.dataTransfer.setData("db", sounds[i].db);
                    }             
                    e.dataTransfer.setDragImage(dragImg, 30, 26);
                });       
            }
        }
    }

    /**
     * Lisää checkboxeihin event listenerit
     */
    prepareCheckboxes();
    function prepareCheckboxes() {
        let checkboxes = document.getElementsByClassName("loop");
        let audios = document.querySelectorAll(".aanirivi > audio");
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
     * Mahdollistaa äänien droppauksen äänilistaan
     */
    prepareDrop();
    function prepareDrop() {
        let paikat = document.getElementsByClassName("aanirivi");
        for (let i = 0; i < paikat.length; i++) {
            paikat[i].addEventListener("dragover", function(e) {
                e.preventDefault();
                e.dataTransfer.dropEffect = "copy";
            });
    
            paikat[i].addEventListener("drop", function(e) {
                e.preventDefault();
                let sounds = allSounds[allSounds.selected];
                let from = e.dataTransfer.getData("from");
                let nimi = e.dataTransfer.getData("text/plain");
                let aani = e.dataTransfer.getData("text/html");
                let db = e.dataTransfer.getData("db");
                if (from) {
                    if (typeof sounds[i] !== "undefined") {
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
                showMySounds();
                let audio = paikat[i].children[4];
                audio.src = aani;
                localStorage.setItem("sounds" + (allSounds.selected+1),  JSON.stringify(sounds));
                console.log(localStorage.getItem("sounds", allSounds.selected+1));
            });
        }
        let trash = document.getElementById("delete");
        trash.addEventListener("dragover", function(e) {
            e.preventDefault();
            e.dataTransfer.dropEffect = "move";
        });
        trash.addEventListener("drop", function(e) {
            e.preventDefault();
            let sounds = allSounds[allSounds.selected];
            let from = e.dataTransfer.getData("from");
            if (!from) {
                return;
            }
            if (sounds[from].db) {
                deleteItem(sounds[from].db);
            }
            sounds[from] = undefined;
            showMySounds();
            localStorage.setItem("sounds" + (allSounds.selected+1),  JSON.stringify(sounds));
        });
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


    let searchVisible = false;
    document.querySelector('.toggle-button').addEventListener("click", toggleSearchBar);

    /**
     * Näyttää tai piilottaa hakupalkin
     */
    function toggleSearchBar() {
        const searchBar = document.getElementById("hakupalkki");
        const toggleButton = document.querySelector('.toggle-button');

        if (searchVisible) {
            searchBar.style.display = "none";
            toggleButton.textContent = "Show Search"; 
            searchVisible = false;
        } else {
            searchBar.style.display = "block"; 
            toggleButton.textContent = "Hide Search"; 
            searchVisible = true;
        }
    }

    //Kuuntelee nappeja
    addButtonListeners();
    function addButtonListeners() {
        //My sounds napit
        let buttons = document.getElementsByClassName("sideButton");
        let audios = document.querySelectorAll(".aanirivi > audio");
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
        //Presettienvaihtonapit
        let buttons2 = document.querySelectorAll("#preset > input");
        for (let i = 1; i < buttons2.length-1; i++) {
            buttons2[i].addEventListener("click", buttonPressed2);
            function buttonPressed2() {
                allSounds.selected = i-1;
                for (let j = 1; j < buttons2.length-1; j++) {
                    buttons2[j].classList.remove("selectedPage");
                }
                buttons2[i].classList.add("selectedPage");
                showMySounds();
            }
        }
        buttons2[0].addEventListener("click", buttonPressedL);   
        buttons2[buttons2.length-1].addEventListener("click", buttonPressedR);
    }

    function buttonPressedR() {
        let buttons2 = document.querySelectorAll("#preset > input");
        if (allSounds.selected === numOfPages-1) {
            allSounds.selected = 0;
        }
        else {
            allSounds.selected = allSounds.selected+1;
        }            
        for (let j = 1; j < buttons2.length-1; j++) {
            buttons2[j].classList.remove("selectedPage");
        }
        buttons2[allSounds.selected+1].classList.add("selectedPage");
        showMySounds();
    }

    function buttonPressedL() {
        let buttons2 = document.querySelectorAll("#preset > input");
        if (allSounds.selected === 0) {
            allSounds.selected = numOfPages-1;
        }
        else {
            allSounds.selected = allSounds.selected-1;
        }            
        for (let j = 1; j < buttons2.length-1; j++) {
            buttons2[j].classList.remove("selectedPage");
        }
        buttons2[allSounds.selected+1].classList.add("selectedPage");
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
     * Press quikly your key, like in one second
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
        let buttons = document.getElementsByClassName("sideButton");
        for (let i = 0; i < buttons.length; i++) {
            if (button.id === buttons[i].id) {
                buttonNumber = i;
                break;
            }
        }

        const pressedKey = key;
        for (let i = 0; i < keys.length; i++ ) {
        
            // Tarkastetaan onko hyväksytty näppäin
            if (pressedKey ===  keys[i] && !myKeys.includes(pressedKey)) {
                button.value = pressedKey;
                // Tallennetaan valinta
                myKeys[buttonNumber] = pressedKey;
                console.log("Passed key");
                button.classList.remove("nappiValittuna");
                localStorage.setItem("keys",  JSON.stringify(myKeys));
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
    }
          
});