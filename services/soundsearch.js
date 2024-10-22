const searchsound = (searchTerm) => {
    // Osoite joudutaan muuttamaan riippuen meidän palvelimen osoitteesta
    const query = `http://127.0.0.1:3000/api/search/${searchTerm}/`
    return fetch(query)
}