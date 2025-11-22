let streakKey;
let streak;
window.onload = (e) => {
  document.querySelector("#search").onclick = searchButtonClicked;
  document.querySelector("#backButton").onclick = backButton;
  streakKey = localStorage.getItem('gar5854streak');
  streak = 0;
  if(streakKey != null){
    streak = parseInt(streakKey);
  }
};


//#region Fields

let manga = false;
let loadAnim = true;
let divs = document.querySelectorAll(".contained");
let legend = document.querySelector("legend");
let animan = document.querySelectorAll("#AniMan input");
let poprate = document.querySelectorAll("#PopRate input");
let year = document.querySelector("#year input");
let year2 = document.querySelector("#year2 input");
let button = document.querySelector("button");
let anime = document.querySelector("#ani");
let animeStart = anime.innerHTML;
let category = document.querySelector("#cat");
let categoryStart = category.innerHTML;
let gamemode = "";
let picked = false;
let yearVal = document.querySelector("#yr");
let yearVal2 = document.querySelector("#yr2");
let warning = document.querySelector("#warn");
let warning2 = document.querySelector("#warn2");
let yearStart = yearVal.innerHTML;
let yearStart2 = yearVal2.innerHTML;
let yearBool = false;
let yearBool2 = false;
let searchedURL;
let firstURL;

let score;
let rank;
let popularity;
let score2;
let rank2;
let popularity2;
let higher;

//#endregion

//#region setup

async function loadMenu() {
  for (let i = 0; i < divs.length; i++) {
    divs[i].style.opacity = 0;
    divs[i].animate([{ opacity: "0" }, { opacity: "1" }], {
      delay: 200 * (i + 1),
      duration: 200,
      iterations: 1,
      direction: "alternate",
    });
    await delay(190 + (200 * (i + 1)));
    divs[i].style.opacity = 1;
  }
}
loadMenu();

yearVal.innerHTML = yearStart + "1907";
yearVal2.innerHTML = yearStart2 + "2027";

for (let i of animan) {
  i.onchange = function (e) {
    anime.innerHTML = e.target.value
      ? ((manga = false), animeStart + "Anime ")
      : ((manga = true), animeStart + "Manga ");
    picked = true;
  };
}

for (let i of poprate) {
  i.onchange = function (e) {
    category.innerHTML = categoryStart + e.target.value;
    gamemode = e.target.value;
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
      (parsedInt.toString() != year.value &&
        year.value.length >= 4 &&
        parsedInt.length >= 1)
    ) {
      yearBool = false;
      warning.style.color = "red";
      warning.innerHTML = "You must enter a value between 1907 and 2027";
      yearVal.style.color = "red";
      yearVal.innerHTML = yearStart + "Year Must Satisfy Conditions";
    }
  } else {
    yearVal.innerHTML = yearStart;
    yearBool = false;
    warning.style.color = "black";
    warning.innerHTML = "";
    yearVal.style.color = "black";
    yearVal.innerHTML = yearStart + "1907";
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
      (parsedInt.toString() != year2.value &&
        year2.value.length >= 4 &&
        parsedInt.length >= 1)
    ) {
      yearBool2 = false;
      warning2.style.color = "red";
      warning2.innerHTML = "You must enter a value between 1907 and 2027";
      yearVal2.style.color = "red";
      yearVal2.innerHTML = yearStart2 + "Year Must Satisfy Conditions";
    }
  } else {
    yearVal2.innerHTML = yearStart2;
    yearBool2 = false;
    warning2.style.color = "black";
    warning2.innerHTML = "";
    yearVal2.style.color = "black";
    yearVal2.innerHTML = yearStart2 + "2027";
  }
});

//#endregion

function backButton() {
  document.querySelector("#menu").style.display = "initial";
  document.querySelector("#content").style.display = "none";
  document.querySelector("#fader").style.display = "none";
  document.querySelector("#backButton").style.display = "none";
  loadAnim = true;
}

async function searchButtonClicked() {
  if (yr.style.color === "red") {
    warnButton();
    return;
  }
  if (yr2.style.color === "red") {
    warnButton();
    return;
  }
  if (picked == false) {
    warnButton();
    return;
  }
  if (gamemode === "") {
    warnButton();
    return;
  }
  document.querySelector("#warningnign").style.display = "none";
  document.querySelector("#menu").style.display = "none";
  document.querySelector("#backButton").style.display = "inline";
  document.querySelector("#content").style.display = "grid";
  document.querySelector("#content").innerHTML = "";
  document.querySelector("#fader").style.display = "grid";
  document.querySelector("#fader p").innerHTML = "Loading";

  if(loadAnim){
    document.querySelector("#fader p").style.opacity = 0;
    document.querySelector("#fader").style.opacity = 1;
    document
      .querySelector("#fader")
      .animate(
        [
          { transform: "translate3d(0, -100%, 0)" },
          { transform: "translate3d(0, 0, 0)" },
        ],
        {
          duration: 500,
          easing: "ease-out",
          iterations: 1,
          direction: "alternate",
        }
      );
  
    document
      .querySelector("#fader p")
      .animate([{ opacity: "0" }, { opacity: "1" }], {
        delay: 500,
        duration: 500,
        easing: "ease-out",
        iterations: 1,
        direction: "alternate",
      });
    await delay(500);
    document.querySelector("#fader p").style.opacity = 1;
  }

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
  url += "?q=";
  if (term) url += term;
  url += "&sfw";
  if (gamemode === "Score") url +=  "&min_score=1";

  let type = "";
  if(manga == false){
    rand2 = Math.floor(Math.random() * (4 - 1 + 1) + 1);
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
  }
  else{
    rand2 = Math.floor(Math.random() * (5 - 1 + 1) + 1);
    switch (rand2) {
      case 1:
        type = "&type=manga";
        break;
      case 2:
        type = "&type=novel";
        break;
      case 3:
        type = "&type=lightnovel";
        break;
      case 4:
        type = "&type=manhwa";
        break;
      case 5:
        type = "&type=manhua";
        break;
    }
    
  }
  type += "&genres_exclude=9,49,12,58"
  url += type;
  //console.log(url);
  searchedURL = url;
  firstURL = url;
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

function warnButton() {
  document.querySelector("#warningnign").style.display = "block";
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
    let loaded = false;
    xhr2.onerror = dataError;
    xhr2.open("GET", searchedURL);
    console.log(searchedURL);
    xhr2.send();
    xhr2.onload = function (e) {
      if(xhr2.status === 200) {
        obj2 = JSON.parse(xhr2.responseText);
        loaded = true;
      }
      else{
        backButton();
      }
    };
    do{
      console.log(loaded);
      await delay(100);
    }while(loaded === false);
    loaded = false;
    
    let results = obj2.data;
    rand = Math.floor(Math.random() * (results.length - 1 + 1) + 1);
    let result = results[rand - 1];
    //console.log(result);
    let imageUrl = "../images/no-image-found.png";
    if (result.images != null) imageUrl = result.images.jpg.large_image_url;

    let rating = result.rating;
    let title = result.title;
    let titleEng = result.title_english;
    let airDates;
    if(!manga) airDates = result.aired.string;
    
    let genres = result.genres;
    let genreString = "";
    if(i == 0){
      score = result.score;
      rank = result.rank;
      popularity = result.popularity;
    }
    else{
      score2 = result.score;
      rank2 = result.rank;
      popularity2 = result.popularity;
    }

    for (let i = 0; i < genres.length; i++) {
      genreString += genres[i].name;
      if (i != genres.length - 1) genreString += ", ";
    }
    if (!rating) rating = "unrated";

    rating = rating.toUpperCase();
    let line;
    
    line = `<div class = 'result' id = 'red'>
            <img src='${imageUrl}' title = '${result.id}' />
            <div class = 'result-inner'>`;

    if(i == 0){
      line =`<div class = 'result' id = 'blue'>
            <img src='${imageUrl}' title = '${result.id}' />
            <div class = 'result-inner'>`;
    }

    let titleStr;
    titleStr =
      titleEng === title
        ? `<span>Title: ${titleEng}</span>`
        : (titleStr = `<span>Titles: ${titleEng} // ${title}</span>`);
    if (titleStr.length > 40) {
      titleStr = `<span>Title: ${titleEng}</span>`;
    }
    if (titleEng == null || titleEng == "null") {
      titleStr = `<span>Title: ${title}</span>`;
    }

    line += titleStr;
    if(genreString !== "") line += `<span>Genres: ${genreString} </span>`;


    if(!manga) line +=  `<span>Air Dates: ${airDates}</span>`
    line += `<span>Rating: ${rating}</span>
            </div>
        </div>
        <h1 id="bubble">OR</h1>`;

    if(streak >= 1){
      line += `<h1 class="streak">Streak: ${streak}</h1>`;
    }
    bigString += line;

  }
  switch (gamemode) {
      case "Popularity":
        if(popularity == popularity2) getData(firstURL);
        break;
      case "Score":
        if(score == score2) getData(firstURL);
        
        break;
      case "Rank":
        if(rank == rank2) getData(firstURL);
        break;
    }

  document.querySelector("#content").innerHTML = bigString;
  await delay(500);
  document.querySelector("#fader p").innerHTML = "Loaded";
  document
    .querySelector("#fader")
    .animate([{ opacity: "1" }, { opacity: "0" }], {
      duration: 500,
      easing: "ease-out",
      direction: "alternate",
    });
  await delay(499);
  document.querySelector("#fader").style.display = "none";

  let resultImages = document.querySelectorAll(".result img");
 
  resultImages[0].onclick = function (e) {
    switch (gamemode) {
      case "Popularity":
        higher = popularity < popularity2;
        console.log("1: " + popularity);
        console.log("2: " + popularity2);
        break;
      case "Score":
        higher = score > score2;
        console.log("1: " + score);
        console.log("2: " + score2);
        break;
      case "Rank":
        higher = rank < rank2;
        console.log("1: " + rank);
        console.log("2: " + rank2);
        break;
    }
    console.log(higher);
    if(higher){
      correct();
    }
    else{
      incorrect();
    }
  };

  resultImages[1].onclick = function (e) {
    switch (gamemode) {
      case "Popularity":
        higher = popularity > popularity2;
        console.log("1: " + popularity);
        console.log("2: " + popularity2);
        break;
      case "Score":
        higher = score < score2;
        console.log("1: " + score);
        console.log("2: " + score2);
        break;
      case "Rank":
        higher = rank > rank2;
        console.log("1: " + rank);
        console.log("2: " + rank2);
        break;
    }
    console.log(higher);
    if(higher){
      correct();
    }
    else{
      incorrect();
    }
  };
}

async function correct() {
  streak++;
  localStorage.setItem('gar5854streak', streak.toString());
  higher = false;
  document.querySelector("#content").style.display = "none";
  document.querySelector("#correct").style.display = "grid";
  document.querySelector("#correct").style.opacity = 1;
  document.querySelector("#correct p").style.opacity = 0;

  document
    .querySelector("#correct p")
    .animate([{ opacity: "0" }, { opacity: "1" }], {
      duration: 500,
      easing: "ease-out",
      iterations: 1,
      direction: "alternate",
    });
  await delay(500);
  document.querySelector("#correct p").style.opacity = 1;
  document.querySelector("#fader").style.display = "grid";
  document.querySelector("#fader p").innerHTML = "Loading";

  document
    .querySelector("#correct p")
    .animate([{ opacity: "1" }, { opacity: "0" }], {
      duration: 500,
      easing: "ease-in",
      iterations: 1,
    });

  document
    .querySelector("#correct")
    .animate([{ opacity: "1" }, { opacity: "0" }], {
      duration: 500,
      easing: "ease-in",
      iterations: 1,
    });
  await delay(500);
  document.querySelector("#correct").style.display = "none";
  document.querySelector("#correct").style.opacity = 0;
  document.querySelector("#correct p").style.opacity = 0;
  loadAnim = false;
  searchButtonClicked();
}

async function incorrect() {
  streak = 0;
  localStorage.removeItem('gar5854streak');
  higher = false;
  document.querySelector("#content").style.display = "none";
  document.querySelector("#incorrect").style.display = "grid";
  document.querySelector("#incorrect").style.opacity = 1;
  document.querySelector("#incorrect p").style.opacity = 0;

  document
    .querySelector("#incorrect p")
    .animate([{ opacity: "0" }, { opacity: "1" }], {
      duration: 500,
      easing: "ease-out",
      iterations: 1,
      direction: "alternate",
    });
  await delay(499);
  document.querySelector("#incorrect p").style.opacity = 1;
  document.querySelector("#fader").style.display = "grid";
  document.querySelector("#fader p").innerHTML = "Loading";

  document
    .querySelector("#incorrect p")
    .animate([{ opacity: "1" }, { opacity: "0" }], {
      duration: 500,
      easing: "ease-in",
      iterations: 1,
      direction: "alternate",
    });

  document
    .querySelector("#incorrect")
    .animate([{ opacity: "1" }, { opacity: "0" }], {
      duration: 500,
      easing: "ease-in",
      iterations: 1,
      direction: "alternate",
    });
  await delay(499);
  document.querySelector("#incorrect").style.display = "none";
  document.querySelector("#incorrect").style.opacity = 0;
  document.querySelector("#incorrect p").style.opacity = 0;
  loadAnim = false;
  searchButtonClicked();
}

function dataError(e) {
  let xhr = e.target;
  console.log("An error has occurred");
}
