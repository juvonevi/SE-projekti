

backupStorage();
async function backupStorage() {
    
    console.log("backupStorage");

    const files = document.getElementById("backupfile-input").files;
    const file = files[0];
    let backupFile = file.name;
    let blob = window.URL || window.webkitURL;
    if (!blob) {
        console.log('Your browser does not support Blob URLs');
        return;           
    }
    let fileName = blob.createObjectURL(file);
    link.download = backupFile;
    console.log("backupFile "+ backupFile);


    let storage = localStorage.getItem("warningShown");
    let storage2 = localStorage.getItem("sounds");
    let storage3 = localStorage.getItem("haetutAanet");
    let storage4 = localStorage.getItem("keys2");
    
    let result = await indexedDB.databases();
    console.log(result);
    console.log("localStorage1 "+storage);
    console.log("localStorage2 "+ storage2);
    
            
    //fileSave ("test.txt", result);
    backupContents(backupFile, result).then(result => {
        const data = { key: 'value' };

        fetch('/file.josn', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(data => console.log(data))
    });

    fileSave(backupFile, ).then(result => {
        

        if (result.ok) {
            result.json().then((json) => { 
                console.log(json.results)
                
            })
        }
    });

}




