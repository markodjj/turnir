// Import necessary modules
const fs = require('fs');
const path = require('path');
const Tournament = require('./modules/tournament');

const groupsJSONPath = 'groups.json'
function readJsonFileSync() {
  try {
    const data = fs.readFileSync('groups.json', 'utf8');
    const teamsData = JSON.parse(data);
    return teamsData;
  } catch (err) {
    console.error('Error reading the file:', err);
  }
}

const groupsData = readJsonFileSync();
const tournament = new Tournament();

// Populate the tournament with groups and teams from the JSON data
tournament.populateFromJSON(groupsData);
tournament.initScoreBoard()

// tournament.showTournament()
// // Example: Get and log all teams in Group A
// const groupA = tournament.getGroup('A');
// console.log(`Teams in Group A:`);
// groupA.getTeams().forEach(team => {
//     console.log(`${team.team} (${team.ISOCode}) - FIBA Ranking: ${team.FIBARanking}`);
// });


tournament.simulateGroupStage(groupsData)
// tournament.showScoreBoard()
// tournament.showSimulatedMatches()
tournament.sortScoreBoard()
tournament.showScoreBoard()

function showFinalPlasmanByGroups(plasmanGroups){
    console.log("---------------------------------------------------------------")
    console.log("Konacan plasman u grupama: ")
    for (const groupName in plasmanGroups){
        console.log(`Grupa ${groupName} (Ime - pobede/porazi/bodovi/postignuti kosevi/primeljeni kosevi/kos razlika)`)
        let i = 1;
        for (const team in plasmanGroups[groupName]) {
            console.log(`   ${i}. ${team}    ${plasmanGroups[groupName][team]["wins"]}/${plasmanGroups[groupName][team]["losses"]}/${plasmanGroups[groupName][team]["points"]}/${plasmanGroups[groupName][team]["scored"]}/${plasmanGroups[groupName][team]["conceded"]}/${plasmanGroups[groupName][team]["dif"]}`);
            i+=1;
        }
        i = 0;
        
    }
    console.log("---------------------------------------------------------------")
}


// showFinalPlasmanByGroups(plasmanGroups);

// console.log(resultrsByGroups)