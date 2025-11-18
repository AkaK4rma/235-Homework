// 1
window.onload = (e) => {
  document.querySelector("#search").onclick = searchButtonClicked;
  document.querySelector("#backButton").onclick = backButton;
};

// 2
let manga = false;

let legend = document.querySelector("legend");
let animan = document.querySelectorAll("#AniMan p input");
let poprate = document.querySelectorAll("#PopRate p input");
let year = document.querySelector("#year p input");
let year2 = document.querySelector("#year2 p input");
let button = document.querySelector("button");
let anime = document.querySelector("#ani");
let animeStart = anime.innerHTML;
let category = document.querySelector("#cat");
let categoryStart = category.innerHTML;
let yearVal = document.querySelector("#yr");
let yearVal2 = document.querySelector("#yr2");
let warning = document.querySelector("#warn");
let warning2 = document.querySelector("#warn2");
let yearStart = yearVal.innerHTML;
let yearStart2 = yearVal2.innerHTML;
let yearBool = false;
let yearBool2 = false;
let searchedURL;

for (let i of animan) {
  i.onchange = function (e) {
    anime.innerHTML = e.target.value
      ? (animeStart + "Anime ", (manga = false))
      : (animeStart + "Manga ", (manga = true));
  };
}

for (let i of poprate) {
  i.onchange = function (e) {
    category.innerHTML = categoryStart + e.target.value;
  };
}

// function yearListen(yearInput, yearValue, startText, warningText, yrBool){
//     if(yearInput.value.length > 0){
//         let parsedInt = parseInt(yearInput.value);
//         yearValue.style.color = "black";
//         yearValue.innerHTML = (parsedInt.toString() === yearInput.value && yearInput.value.length <= 4) ? startText + parsedInt.toString() : (
//             yearValue.style.color = "red", startText + "Year Must Satisfy Conditions");
//         yrBool = true;
//         warningText.innerHTML = ""
//         if(parsedInt > 2027 || parsedInt < 1907 || (parsedInt.toString() != yearInput.value && yearInput.value.length >= 4)){
//             yrBool = false;
//             warningText.style.color = "red";
//             warningText.innerHTML = "You must enter a value between 1907 and 2027"
//         }
//     }
//     else{
//         yearValue.innerHTML = startText;
//         yrBool = false;
//         warningText.style.color = "black";
//         warningText.innerHTML = ""
//     }
// }

year.addEventListener("input", (event) => {
  //yearListen(year, yearVal, yearStart, warning, yearBool)
  if (year.value.length > 0) {
    let parsedInt = parseInt(year.value);
    yearVal.style.color = "black";
    yearVal.innerHTML =
      parsedInt.toString() === year.value && year.value.length <= 4
        ? yearStart + parsedInt.toString()
        : ((yearVal.style.color = "red"),
          yearStart + "Year Must Satisfy Conditions");
    yearBool = true;
    warning.innerHTML = "";
    if (
      parsedInt > 2027 ||
      parsedInt < 1907 ||
      (parsedInt.toString() != year.value && year.value.length >= 4)
    ) {
      yearBool = false;
      warning.style.color = "red";
      warning.innerHTML = "You must enter a value between 1907 and 2027";
    }
  } else {
    yearVal.innerHTML = yearStart;
    yearBool = false;
    warning.style.color = "black";
    warning.innerHTML = "";
  }
});

year2.addEventListener("input", (event) => {
  //yearListen(year2, yearVal2, yearStart2, warning2, yearBool2)
  if (year2.value.length > 0) {
    let parsedInt = parseInt(year2.value);
    yearVal2.style.color = "black";
    yearVal2.innerHTML =
      parsedInt.toString() === year2.value && year2.value.length <= 4
        ? yearStart2 + parsedInt.toString()
        : ((yearVal2.style.color = "red"),
          yearStart2 + "Year Must Satisfy Conditions");
    yearBool2 = true;
    warning2.innerHTML = "";
    if (
      parsedInt > 2027 ||
      parsedInt < 1907 ||
      (parsedInt.toString() != year2.value && year2.value.length >= 4)
    ) {
      yearBool2 = false;
      warning2.style.color = "red";
      warning2.innerHTML = "You must enter a value between 1907 and 2027";
    }
  } else {
    yearVal2.innerHTML = yearStart2;
    yearBool2 = false;
    warning2.style.color = "black";
    warning2.innerHTML = "";
  }
});

function backButton() {
  document.querySelector("#menu").style.display = "initial";
  document.querySelector("#content").style.display = "none";
  document.querySelector("#backButton").style.display = "none";
}

function searchButtonClicked() {

  document.querySelector("#backButton").style.display = "inline";
  document.querySelector("#content").style.display = "grid";

  document.querySelector("#content").innerHTML = "<p>No data yet!</p>";
  console.log("searchButtonClicked() called");

  const JIKAN_URL = "https://api.jikan.moe/v4/";
  let url = manga ? JIKAN_URL + "manga" : JIKAN_URL + "anime";

  let term = "";
  if (yearBool2) {
    term = `&end_date=${year.value}-12-31`;
  }
  if (yearBool) {
    term = `&start_date=${year.value}-01-01`;
    if (yearBool2) {
      term += `&end_date=${year.value}-12-31`;
    }
  }
  console.log(term);
  url += "?q=";
  if (term) url += term;
  url += "&sfw";

  rand2 = Math.floor(Math.random() * (4 - 1 + 1) + 1);

  let type = "";
  switch (rand2) {
    case 1:
      type = "&type=ona";
      break;
    case 2:
      type = "&type=tv";
      break;
    case 3:
      type = "&type=movie";
      break;
    case 4:
      type = "&type=ova";
      break;
  }
  url += type;

  document.querySelector("#menu").style.display = "none";
  console.log(url);
  searchedURL = url;
  // 12 Request data!
  getData(url);
}

function getData(url) {
  let xhr = new XMLHttpRequest();

  xhr.onload = dataLoaded;
  xhr.onerror = dataError;

  xhr.open("GET", url);
  xhr.send();
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function dataLoaded(e) {
  let xhr = e.target;
  let obj = JSON.parse(xhr.responseText);

  let pages = obj.pagination.last_visible_page;
  let rand;
  let rand2;
  let lastNumber = null;
  let bigString = "";
  for (let i = 0; i < 2; i++) {
    do {
      rand = Math.floor(Math.random() * (pages - 1 + 1) + 1);
    } while (rand === lastNumber);

    lastNumber = rand;
    searchedURL += "&page=" + rand.toString();

    let xhr2 = new XMLHttpRequest();
    let obj2;
    xhr2.onload = function (e) {
      obj2 = JSON.parse(xhr2.responseText);
    };
    xhr2.onerror = dataError;
    xhr2.open("GET", searchedURL);
    xhr2.send();
    await delay(1000);

    let results = obj2.data;

    rand = Math.floor(Math.random() * (results.length - 1 + 1) + 1);
    let result = results[rand];
    let imageUrl = "../images/no-image-found.png";
    if (result.images) imageUrl = result.images.jpg.large_image_url;
    

    let rating = result.rating;
    let title = result.title;
    let titleEng = result.title_english;
    let airDates = result.aired.string;
    let genres = result.genres;
    let genreString = "";
    for (let i = 0; i < genres.length; i++) {
      genreString += genres[i].name;
      if (i != genres.length - 1) genreString += ", ";
    }
    if (!rating) rating = "unrated";

    rating = rating.toUpperCase();
    let line = `<div class = 'result'>
            <img src='${imageUrl}' title = '${result.id}' />
            <div class = 'result-inner'>`;

    let titleStr;
    titleStr = (titleEng === title) ? `<span>Title: ${titleEng}</span>` : titleStr = `<span>Titles: ${titleEng} // ${title}</span>`;
    if (titleStr.length > 40) {
      titleStr = `<span>Title: ${titleEng}</span>`;
    }
    if (titleEng == null || titleEng == "null") {
      titleStr = `<span>Title: ${title}</span>`;
    }

    line += titleStr;
    line += `<span>Genres: ${genreString} </span>
            <span>Air Dates: ${airDates}</span>
            <span>Rating: ${rating}</span>
            </div>
        </div>`;

    bigString += line;
  }
  document.querySelector("#content").innerHTML = bigString;
}

function dataError(e) {
  let xhr = e.target;
  console.log("An error has occurred");
}
