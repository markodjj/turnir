const { group } = require('console');
const fs = require('fs');

function readJsonFileSync() {
  try {
    const data = fs.readFileSync('groups.json', 'utf8');
    const teamsData = JSON.parse(data);
    return teamsData;
  } catch (err) {
    console.error('Error reading the file:', err);
  }
}


const groups = readJsonFileSync();

function simulateMatch(teamA, teamB) {
    
    const rankDiff = teamB.FIBARanking - teamA.FIBARanking;
    
    const probabilityAWinning = 1 / (1 + Math.exp(rankDiff / 10)); 

    const isAWinner = Math.random() < probabilityAWinning;

    const scoreA = Math.floor(Math.random() * (100 - 70 + 1)) + 70;
    const scoreB = Math.floor(Math.random() * (100 - 70 + 1)) + 70;
    
    if (isAWinner) {
        return { winner: teamA.Team, loser: teamB.Team, scoreA, scoreB };
    } else {
        return { winner: teamB.Team, loser: teamA.Team, scoreA: scoreB, scoreB: scoreA };
    }
}


function simulateGroupStage(group) {
    const teams = group.slice();
    const results = [];
  
    for (let i = 0; i < teams.length; i++) {
        for (let j = i + 1; j < teams.length; j++) {
            const result = simulateMatch(teams[i], teams[j]);

            results.push(result);
        }
    }
    
    return results;
}



function getSimulatedResultsByGroups(groups){

    let allResultsByGroups = {
        A : [],
        B : [],
        C : []
    }

    for (const groupName in groups) {
        console.log(`Group ${groupName}:`);
        const matches = simulateGroupStage(groups[groupName]);
    
        matches.forEach(match => {
            console.log(`    ${match.winner} - ${match.loser} (${match.scoreA}:${match.scoreB})`);
            allResultsByGroups[groupName].push(match)
        });
        
    }
    return allResultsByGroups;
}
const allResultsByGroups = getSimulatedResultsByGroups(groups)

function getFinalGroupPlasman(allResultsByGroups){
    let teams = {};

    const plasman = {
        A : {},
        B : {},
        C : {}
    }
    
    for (const groupName in allResultsByGroups){
        
        const matches = allResultsByGroups[groupName]
      
        matches.forEach(match => {
            const { winner, loser, scoreA, scoreB } = match;
            
            if (!teams[winner]) {
                teams[winner] = { wins: 0, losses: 0, points: 0, scored: 0, conceded: 0,  dif: 0};
            }
        
            if (!teams[loser]) {
                teams[loser] = { wins: 0, losses: 0, points: 0, scored: 0, conceded: 0, dif: 0};
            }
        
            teams[winner].wins += 1;
            teams[winner].losses += 0;
            teams[winner].points += 2;
            teams[winner].scored += scoreA;
            teams[winner].conceded += scoreB;
            teams[winner].dif = teams[winner].scored - teams[winner].conceded;
            
            teams[loser].wins += 0;
            teams[loser].losses += 1;
            teams[loser].points += 1;
            teams[loser].scored += scoreB;
            teams[loser].conceded += scoreA;
            teams[loser].dif = teams[loser].scored - teams[loser].conceded;
        });
        
        plasman[groupName] = teams;
        teams = {};
    }
    return plasman;
}

const plasmanGroups = getFinalGroupPlasman(allResultsByGroups)

function showFinalPlasmanByGroups(plasmanGroups){
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
}

console.log("---------------------------------------------------------------")
showFinalPlasmanByGroups(plasmanGroups);
// console.log(plasmanGroups)
console.log("---------------------------------------------------------------")

function sortGroup(group, groupName) {
    const teamNames = Object.keys(group);
    const n = teamNames.length;

    for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < n - i - 1; j++) {
            const teamA = group[teamNames[j]];
            const teamB = group[teamNames[j + 1]];

            if (teamA.points < teamB.points) {
              
                const temp = teamNames[j];
                teamNames[j] = teamNames[j + 1];
                teamNames[j + 1] = temp;
            }else if (teamA.points == teamB.points) {
        
                const matches = allResultsByGroups[groupName];
        
                matches.forEach(match => {
                    if (match.winner == teamNames[j] && match.loser == teamNames[j+1]){

                        const temp = teamNames[j];
                        teamNames[j] = teamNames[j + 1];
                        teamNames[j + 1] = temp;
                    }
                })
                
            }
        }
    }

    const sortedGroup = {};
    for (const teamName of teamNames) {
        sortedGroup[teamName] = group[teamName];
    }

    return sortedGroup;
}


let sortedGroupsAfterPlasman = {
    A : {},
    B : {},
    C : {}
}
function sortScoreBoard(plasmanGroups){
    for (const groupName in plasmanGroups){
        sortedGroupsAfterPlasman[groupName] = sortGroup(plasmanGroups[groupName], groupName);

    }
}

sortScoreBoard(plasmanGroups);
// console.log(sortedGroupsAfterPlasman);

function flattenData(groupData){
    const flattened = [];
    for (const group in groupData) {
      const teams = Object.entries(groupData[group]);
      for (const [teamName, stats] of teams) {
        flattened.push({ group, teamName, ...stats });
      }
    }
    return flattened;
};
  
function sortTeams(teams){
    return teams.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.dif !== a.dif) return b.dif - a.dif;
      return b.scored - a.scored;
    });
};
  
function getTopTeams (sortedTeams){
    const topTeams = { 1: [], 2: [], 3: [] };
    sortedTeams.forEach((team) => {
      const { group } = team;
      if (team.group === 'A') {
        if (team.points >= 6) topTeams[1].push(team);
        else if (team.points === 5) topTeams[2].push(team);
        else topTeams[3].push(team);
      } else if (team.group === 'B') {
        if (team.points >= 6) topTeams[1].push(team);
        else if (team.points === 5) topTeams[2].push(team);
        else topTeams[3].push(team);
      } else if (team.group === 'C') {
        if (team.points >= 6) topTeams[1].push(team);
        else if (team.points === 5) topTeams[2].push(team);
        else topTeams[3].push(team);
      }
    });
    return topTeams;
};
  

function rankTeams(sortedGroupsAfterPlasman) {
    let teamsByRanks = {};
    const flattenedTeams = flattenData(sortedGroupsAfterPlasman);
    const sortedTeams = sortTeams(flattenedTeams);
    const topTeams = getTopTeams(sortedTeams);

    let rank = 1;
        for (const [position, teams] of Object.entries(topTeams)) {
        teams.forEach((team) => {
            console.log(`Rank ${rank}: ${team.teamName} from Group ${team.group}`);
            teamsByRanks[rank] = team;
            rank++;
        });
    }
    return teamsByRanks;
};

const listOfRankedTeams = rankTeams(sortedGroupsAfterPlasman);

function populateHats(listOfRankedTeams){
    let drawTemplate = {
        D: {},
        E: {},
        F: {},
        G: {}
    }

    drawTemplate.D[listOfRankedTeams["1"]["teamName"]] = listOfRankedTeams["1"];
    drawTemplate.D[listOfRankedTeams["2"]["teamName"]] = listOfRankedTeams["2"];
    drawTemplate.E[listOfRankedTeams["3"]["teamName"]] = listOfRankedTeams["3"];
    drawTemplate.E[listOfRankedTeams["4"]["teamName"]] = listOfRankedTeams["4"];
    drawTemplate.F[listOfRankedTeams["5"]["teamName"]] = listOfRankedTeams["5"];
    drawTemplate.F[listOfRankedTeams["6"]["teamName"]] = listOfRankedTeams["6"];
    drawTemplate.G[listOfRankedTeams["7"]["teamName"]] = listOfRankedTeams["7"];
    drawTemplate.G[listOfRankedTeams["8"]["teamName"]] = listOfRankedTeams["8"];
    return drawTemplate;
}

const hats = populateHats(listOfRankedTeams);
  
function showHats(hats){
    console.log("---------------------------------------------------------------")
    console.log("Sesiri:");
    for (const hat in hats){
        console.log(`   Sesir ${hat}`);
        for(const teamName in hats[hat]){
            console.log(`    ${teamName}`);
        }
    }
}

showHats(hats);
