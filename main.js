"use strict";
"@ts-check"

// TIEA207

/**
 * Tapahtuman kuuntelija sivun lataamiselle
 */
window.addEventListener("load", function() {

    let infoVisible = false;
    document.getElementById("info").addEventListener("click", openOrCloseInfo);
    document.getElementById("closePopup").addEventListener("click", openOrCloseInfo);

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

    if (navigator.userAgent.indexOf("Firefox") <= 0) {
        changeAudioElementSize();
    }
    /**
     * Muuttaa ulkoasua sopivammaksi Chromelle
     */
    function changeAudioElementSize() {
        let audios = document.getElementsByTagName("audio");
        for (let audio of audios) {
            audio.style.zoom = "90%";
            audio.style.position = "relative";
            audio.style.top = "10px";
        }
        let spans = document.getElementsByTagName("span");
        for (let span of spans) {
            span.style.top = "0";
        }
    }

    const isDarkMode = () => window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const applyDarkMode = (isDark) => {
        if (isDark) {
            document.body.style.background = "#26292e";
            document.body.style.color = "#ffffff";
            document.getElementById("hakutulokset").style.background = "#3d414a";
            let aanirivit = document.querySelectorAll(".aanirivi");
            for (let rivi of aanirivit) {
                rivi.style.background = "#3d414a";
            }
            document.querySelector("label[for=info]").style.background = "#3d414a";
            document.getElementById("info").style.color = "white";
            document.getElementById("closePopup").style.color = "white";
            this.document.getElementById("popup").style.background = "#0e0f12";
        }
    };
    applyDarkMode(isDarkMode());

    let allSounds = [Array(10), Array(10), Array(10), Array(10)];
    allSounds.selected = 0;
    this.document.getElementById("buttonA").style["font-weight"] = "bold";
    let dragImg = new Image();
    dragImg.src = "GrabCursor.png";
    document.getElementById("file-input").addEventListener("change",handleFile);
    const defaultKeys = ["1","2","3","4","5","6","7","8","9","0"];  
    let myKeys = Array.from(defaultKeys);

    /**
     * Hakee käyttäjän äänet local storagesta
     */
    getStoredSounds();
    function getStoredSounds() {
        for (let i = 0; i < 4; i++) {
            let sounds = JSON.parse(localStorage.getItem("sounds"+(i+1)));
            if (sounds) {
                console.log(sounds);
                for (let j = 0; j < sounds.length; j++) {
                    if (typeof sounds[j] !== "undefined" && sounds[j]) {
                        if (sounds[j].sound.startsWith("blob")) {
                            allSounds[i][j] = undefined;
                            localStorage.setItem("sounds" + (i+1),  JSON.stringify(sounds));
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
                if (from) {
                    if (typeof sounds[i] !== "undefined") {
                        sounds[from] = {"name" : sounds[i].name, "sound" : sounds[i].sound};
                    }
                    else {
                        sounds[from] = undefined;
                    }
                }
                sounds[i] = {"name" : nimi, "sound" : aani};       
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
        console.log(files)
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
                    sounds[i] = {"name" : nimi, "sound" : aani};
                    showMySounds();
                    let audio = paikat[i].children[4];
                    audio.src = aani;
                    lisatty = true;
                    break;
                }
            }
            if (!lisatty) {
                for (let j = 0; j < 4; j++) {
                    let sounds = allSounds[j];
                    if (j !== allSounds.selected) {
                        for (let i = 0; i < sounds.length; i++) {
                            if (!sounds[i]) {
                                sounds[i] = {"name" : nimi, "sound" : aani};
                                showMySounds();
                                let audio = paikat[i].children[4];
                                audio.src = aani;
                                lisatty = true;
                                break;
                            }
                        }
                    }
                }                   
            }
            if (!lisatty) {
                console.log("Ei tilaa");
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
            let audio = document.createElement("audio");
            audio.setAttribute("controls", "");
            audio.setAttribute("src", aani.previews["preview-hq-mp3"]);
            div.appendChild(audio);
            div.style.width = "100%";
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
                    buttons2[j].style["font-weight"] = "normal";
                }
                buttons2[i].style["font-weight"] = "bold";
                showMySounds();
            }
        }
        buttons2[0].addEventListener("click", buttonPressedL);   
        buttons2[buttons2.length-1].addEventListener("click", buttonPressedR);
    }

    function buttonPressedR() {
        let buttons2 = document.querySelectorAll("#preset > input");
        if (allSounds.selected === 3) {
            allSounds.selected = 0;
        }
        else {
            allSounds.selected = allSounds.selected+1;
        }            
        for (let j = 1; j < buttons2.length-1; j++) {
            buttons2[j].style["font-weight"] = "normal";
        }
        buttons2[allSounds.selected+1].style["font-weight"] = "bold";
        showMySounds();
    }

    function buttonPressedL() {
        let buttons2 = document.querySelectorAll("#preset > input");
        if (allSounds.selected === 0) {
            allSounds.selected = 3;
        }
        else {
            allSounds.selected = allSounds.selected-1;
        }            
        for (let j = 1; j < buttons2.length-1; j++) {
            buttons2[j].style["font-weight"] = "normal";
        }
        buttons2[allSounds.selected+1].style["font-weight"] = "bold";
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
     
        let haetutAanet = localStorage.getItem("haetutAanet");
            if(syote === haetutAanet[0]) {
                //setupAudioAnalyser(sounds);
                return;
       
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
     


    // Lisätään se tietoraketeeseen
    // esim. map mutta käyttö voi olla hankalampaa
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
    let aanet = new Map();

    aanet.set("1"," ./media/sci-fi.mp3");
    aanet.set("2", "aanilinkki 3");
    aanet.set("3", "aanilinkki 3");
    aanet.set(4, "aanilinkki 4");
    aanet.set("5", "aanilinkki 5");
    aanet.set("6", "aanilinkki 6");
   
    console.log(aanet.has("3"));
    // Tai yksinketaisemmin tallennetaan taulukkoon
    let aania = ["./media/sci-fi.mp3","aanilinkki 2","aanilinkki 3"];
    // Sitten tallennetaan localStrageen
    localStorage.setItem("haetutAanet", aania);
            
    let haetutAanet = localStorage.getItem("haetutAanet");
    //haetutAanet[0]; // toimii
    console.log(haetutAanet, " Äänet local storagesta");
   
    //Tehtävä: funktion joka tarkastaa onko haettu ääni jo tietorakenteessa aanet tai aania taulukossa
    //funktio palauttaa löytyneen äänen tai null
    //funkiton malli: funktio (param: haettu ääni, param: taulukko / map äänistä) return ääni tai null

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
       
        //document.addEventListener("keydown",  changeKey(event));
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
                playByKeyTest(key);
            }      
        }    
    }

    let changedKeys = Array(10);
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
            //document.removeEventListener("keydown",  changeKey(event));
        }
        }
    }

    //console.log(myKeys);
        function playByKeyTest(key) {
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
          
        /**
         * Funktio soittaa äänen näppäimen mukaan
         * @param {*} key 
         */
        function playByKey(key) {
            
            // console.log(aanet.has("1")); // Kyselee mapista
            // Taulukko näppäimistön nappuloista
            const keys = [1,2,3,4,5,6,7,8,9,0,'q','w','e','r','t','y','u','i','o','p','a','s','d','f','g','h','j','k','l','z','x','c','v','b','n','m'];  
            //,a,s,d,f,g,h,j,k,l,z,x,c,v,b,n,m
            for(let i = 0; i < aania.length; i++) {
                
                if(key == keys[i]) {
                    // soita ääni, näppäimen mukaan
                    /*
                    if(aania[i].indexOf(".mp3")) { // Tarkastetaan ettei ole pelkkää tekstiä
                        console.log("soita ääni ",aania[i]);
                        setupAudioAnalyser(aania[i]);
                    }*/
                 }
                break;
            }           
        }
});