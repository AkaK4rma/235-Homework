// 1
window.onload = (e) => { document.querySelector("#search").onclick = searchButtonClicked };

// 2
let displayTerm = "";
let manga = false;

let legend = document.querySelector("legend");
let animan = document.querySelectorAll("#AniMan p input");
let poprate = document.querySelectorAll("#PopRate p input");
let year = document.querySelector("#year p input");
let button = document.querySelector("button");
let anime = document.querySelector("#ani");
let animeStart = anime.innerHTML;
let category = document.querySelector("#cat");
let categoryStart = category.innerHTML;
let yearVal = document.querySelector("#yr");
let warning = document.querySelector("#warn");
let yearStart = yearVal.innerHTML;
let yearBool = true;


    for(let i of animan){
        i.onchange = function(e){
            anime.innerHTML = (e.target.value) ? animeStart + "Anime " : animeStart + "Manga ";
        }
    }

    

    for(let i of poprate){
        i.onchange = function(e){
            category.innerHTML = categoryStart + e.target.value;
        }
    }
    
    year.addEventListener("input", (event) => {
        yearVal.innerHTML = yearStart + event.target.value
        yearBool = true;
        warning.innerHTML = ""
        if(parseInt(year.value) >= 2025 || parseInt(year.value) <= 1907){
            yearBool = false;
            warning.style.color = "red";
            warning.innerHTML = "You must enter a value between 1907 and 2025"
        }
    });
    

    // button.onclick = function(e){
    //     for(let i of input){
    //         if(i.checked){
    //             information.innerHTML = `Your FINAL CHOICE is \"${i.value}\"!`;
    //         }
    //     }
    // }

// 3
function searchButtonClicked() {

    console.log("searchButtonClicked() called");

    const JIKAN_URL = "https://api.jikan.moe/v4/";
    let url = (manga) ? JIKAN_URL + "anime" : JIKAN_URL + "manga";
    
    let term = document.querySelector("#searchterm").value;
    displayTerm = term;

    term = term.trim();

    term = encodeURIComponent(term);
    if (term.length < 1) return;

    url += "&q=" + term;

    let limit = document.querySelector("#limit").value;
    url += "&limit=" + limit;

    document.querySelector("#status").innerHTML = "<b>Searching for '" + displayTerm + "'</b>";

    console.log(url);

    // 12 Request data!
    getData(url);
}

function getData(url) {
    let xhr = new XMLHttpRequest();

    xhr.onload = dataLoaded
    xhr.onerror = dataError;

    xhr.open("GET", url);
    xhr.send();
}

function dataLoaded(e) {
    let xhr = e.target;
    console.log(xhr.responseText);

    let obj = JSON.parse(xhr.responseText);

    if (!obj.data || obj.data.length == 0) {
        document.querySelector("#status").innerHTML = "<b>No results found for '" + displayTerm + "'</b>";
        return;
    }

    let results = obj.data;

    console.log("results.length = " + results.length);
    let bigString = "";

    for (let i = 0; i < results.length; i++) {
        let result = results[i];

        let smallURL = result.images.fixed_width.url;
        if (!smallURL) smallURL = "../images/no-image-found.png";

        let url = result.url;
        let rating = result.rating.toUpperCase();

        let line = `<div class = 'result'><img src='${smallURL}' title = '${result.id}' />`;
        line += `<span><a target='_blank' href = '${url}'>View on Giphy</a><br>Rating: ${rating}</span></div>`;

        bigString += line;
    }
    document.querySelector("#content").innerHTML = bigString;
    document.querySelector("#status").innerHTML = "<b>Success!</b> <p><i>Here are " + results.length + " results for '" + displayTerm + "'</p></i>"
}

function dataError(e) {
    let xhr = e.target;
    console.log("An error has occurred");
}