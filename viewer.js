let token = '';
let tuid = '';
let ddgName = '';
let createdDivs = {};
let createdPanels = {};
let cardData = {};

const twitch = window.Twitch.ext;
var loadedBoard;

//var loadedBoard = {"state": "COMBAT", "ownBoard": [null, "Ashwood Elm", "Ashwood Elm", null, "Ashwood Elm", "The Green Knight", "The Green Knight"], "oppBoard": [null, null, null, "Lordy", "Echowood", "Bossy", null], "oppTreasures": ["Deepstone Mine", "Wand of Weirding", "Deck of Many Things"], "ownTreasures": ["The Singing Sword", "Fool's Gold", "Ambrosia"]};
// create the request options for our Twitch API calls

function setAuth (token) {
  Object.keys(requests).forEach((req) => {
    twitch.rig.log('Setting auth headers');
    requests[req].headers = { 'Authorization': 'Bearer ' + token };
  });
}

twitch.onContext(function (context) {
  twitch.rig.log(context);
});

twitch.onAuthorized(function (auth) {
  // save our credentials
  token = auth.token;
  tuid = auth.userId;
      $.get('https://datadrivengaming.net/sbb/cardDump', function(data){
        cardData = JSON.parse(data);
        console.log(cardData);
    });
});

function logError(_, error, status) {
  twitch.rig.log('EBS request returned '+status+' ('+error+')');
}

function logSuccess(hex, status) {
  twitch.rig.log('EBS request returned '+hex+' ('+status+')');
}
window.Twitch.ext.configuration.onChanged(() => {
    var broadcaster = window.Twitch.ext.configuration;
    if (broadcaster) {
        if (broadcaster.content) {
            var config = {};
            try {
                config = JSON.parse(broadcaster.content);
                ddgName = config[0];
            } catch (e) {
                console.log(e);
            }
        }
    }
});

function loadBoard(){
   ddgName = JSON.parse(twitch.configuration.broadcaster.content)[0];
   $.get('https://datadrivengaming.net/sbb/observer/view/'+ddgName, function(data){
   //$.get('https://datadrivengaming.net/sbb/observer/view/trynet', function(data){
      var boardstate = JSON.parse(data);
      for(var index=0; index < 7; index++){
        var thisDiv = document.getElementById("boardTooltip"+(index+1));
        if (boardstate["ownBoard"][index] != null){

            thisDiv.innerHTML = boardstate["ownBoard"][index] + "<br><br>" + cardData[boardstate["ownBoard"][index]]["Text"];
            thisDiv.visibility = "visible";
        }
        else{
            thisDiv.innerHTML = "";
            thisDiv.visibility = "hidden";
        }
      }
      for(var index=0; index < 3; index++){
        var thisDiv = document.getElementById("treasureTooltip"+(index+1));
        if (boardstate["ownTreasures"][index] != null){
            thisDiv.innerHTML = boardstate["ownTreasures"][index] + "<br><br>" + cardData[boardstate["ownTreasures"][index]]["Text"];
            thisDiv.visibility = "visible";
      }
        else{

            thisDiv.innerHTML = "";
            thisDiv.visibility = "hidden";
        }
      }
      if (boardstate.state == "SHOP"){
        for (var index=1; index<7; index++){
            var thisDiv = document.getElementById("sboardTooltip"+(index));
            if (boardstate["shopSlots"][index] != null){

                thisDiv.innerHTML = boardstate["shopSlots"][index] + "<br><br>" + cardData[boardstate["shopSlots"][index]]["Text"];
                thisDiv.visibility = "visible";
            }
            else{
                thisDiv.visibility = "hidden";
                thisDiv.innerHTML = "";
        }
        }
        for (var index=0; index < 4; index++){
            var thisDiv = document.getElementById("handTooltip"+(index+1));
            if (boardstate["hand"][index] != null){

                thisDiv.innerHTML = boardstate["hand"][index] + "<br><br>" + cardData[boardstate["hand"][index]]["Text"];
                thisDiv.visibility = "visible";
            }
            else{
                thisDiv.innerHTML = "";
                thisDiv.visibility = "hidden";
        }
        }
        var keys = Object.keys(boardstate["oppBoards"]);
        seenHeroes = []
        for(var key in keys){
            seenHeroes.push(keys[key].replace(/\s/g, ''));
            createOpponentDiv(keys[key], boardstate["oppBoards"]);
        }
       deletedKeys = [];

       for(key in createdDivs){
            if (!seenHeroes.includes(key)){
                createdDivs[key].remove();
                createdPanels[key+"sidepanel"].remove();
                deletedKeys.push(key);
            }
       }
       for (var key in deletedKeys){
            delete createdDivs[key];
            delete createdPanels[key+"sidepanel"];
       }
        var thisDiv = document.getElementById("playerHeroTooltip");
        thisDiv.innerHTML = boardstate["hero"]+ "<br><br>" + cardData[boardstate["hero"]]["Text"];
      }

  });
}
function openNav(divToOpen) {
  document.getElementById(divToOpen).style.width = "20%";
  document.getElementById("oppc").style.display = 'none'
}

function closeNav(divToClose) {
  document.getElementById(divToClose).style.width = "0%";

  document.getElementById("oppc").style.display = 'flex';
}
function createCardElement(cardName){
    if (cardName == null){
        return null;
    }
    baseElement = document.createElement("div");
    baseElement.classList.add("oppCard");
    baseElement.innerHTML = cardName;

    mouseoverText = document.createElement("div")
    mouseoverText.classList.add("tooltiptext");
    mouseoverText.innerHTML = cardData[cardName]["Text"];

    baseElement.appendChild(mouseoverText);
    return baseElement;
}
function removeAllChildNodes(parent) {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}
function createSidebar(hero, cardList){
    var sidepanel;
    heroName = hero.replace(/\s/g, '');
    if (createdPanels[heroName+"sidepanel"] == null){
        sidepanel = document.createElement("div");
        sidepanel.classList.add("sidepanel");
        sidepanel.id=heroName+'sidepanel';
        var str = heroId+'sidepanel'
        sidepanel.onclick = function() {closeNav(str);};
        createdPanels[heroName+"sidepanel"] = sidepanel;
        }
    else{
        sidepanel = createdPanels[heroName+"sidepanel"]
        removeAllChildNodes(sidepanel);
    }

    for(i in cardList){

        if (cardList[i] != null){
            sidepanel.appendChild(createCardElement(cardList[i]));
        }
    }
    document.getElementById("fullBoard").appendChild(sidepanel);
    return sidepanel;

}
function createOpponentDiv(heroName, dictionary){
    var thisDiv = document.getElementById("oppc");
    var oppElement;
    heroId = heroName.replace(/\s/g, '');
    if (createdDivs[heroId] == null){
        oppElement = document.createElement("div");
        oppElement.innerHTML = heroName;

        tooltip = document.createElement("div")
        tooltip.classList.add("tooltiptext")

        thisDiv.appendChild(oppElement);
        oppElement.appendChild(tooltip);
        tooltip.innerHTML = cardData[heroName]["Text"];
        createdDivs[heroId] = oppElement;
    }
    else{
        oppElement = createdDivs[heroId];
    }
    oppElement.classList.add("opponent");
    dictionary = dictionary[heroName]["Units"];


    var str = heroId+'sidepanel'
    oppElement.onclick = function() {openNav(str);};

    sidebar = createSidebar(heroName, dictionary);

}

