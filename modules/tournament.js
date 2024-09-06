const Group = require('./group');
const Team = require('./team');

class Tournament {
    constructor() {
        this.groups = {}; 
        this.scoreBoard = {
            A: {},
            B: {},
            C: {}
        };
        this.matches = {
            A: [],
            B: [],
            C: []
        };
        
    }

    addGroup(group) {
        this.groups[group.name] = group;
    }

    getGroup(name) {
        return this.groups[name];
    }

    getAllGroups() {
        return this.groups;
    }

    populateFromJSON(data) {
        
        for (let groupName in data) {
            const group = new Group(groupName);
            
            for (let teamData of data[groupName]) {
                const team = new Team(teamData["Team"], teamData["ISOCode"], teamData["FIBARanking"]);
                group.addTeam(team);
            }
            this.addGroup(group);
        }
    }

    initScoreBoard(){
        for (let groupName in this.getAllGroups()) {
            const group = this.getGroup(groupName);
            group.getTeams().forEach(team => {
                this.scoreBoard[groupName][team.team] = {name: team.team, wins: 0, losses: 0, points:0, scored: 0, conceded: 0, dif : 0};
            });
        }
    }

    showScoreBoard(){
        // console.log(this.scoreBoard)
        for (let group in this.scoreBoard) {
            console.log(`Grupa ${group} (Ime - pobede/porazi/bodovi/postignuti kosevi/primeljeni kosevi/kos razlika)`);
            let i = 1;
            for (let team in this.scoreBoard[group]) {
                
                let teamData = this.scoreBoard[group][team]

                let name = teamData["name"]
                let wins = teamData["wins"]
                let losses = teamData["losses"]
                let scored = teamData["scored"]
                let points = teamData["points"]
                let conceded = teamData["conceded"]
                let dif = teamData["dif"]
                console.log(`   ${i}. ${name.padEnd(20) }   ${wins} / ${losses} / ${points} / ${scored} / ${conceded} / ${dif > 0 ? "+"+dif : dif}`);
                i++;
            }
            i = 0;
        }
    }

    showTournament(){
        console.log("---------------------------------------------------------------")
        console.log("All Groups and Teams:");
        for (let groupName in this.getAllGroups()) {
            const group = this.getGroup(groupName);
            console.log(`Group ${groupName}:`);
            group.getTeams().forEach(team => {
                console.log(`  ${team.team} (${team.ISOCode}) - FIBA Ranking: ${team.FIBARanking}`);
            });
        }
        console.log("---------------------------------------------------------------")
    }
    updateTeamsStats(match, group){
        let scoreA = match.scoreA;
        let scoreB = match.scoreB;

        let winnersScore = Math.max(scoreA, scoreB);
        let losersScore = Math.min(scoreA, scoreB);
       
        this.scoreBoard[group][match.winner]["wins"] += 1
        this.scoreBoard[group][match.winner]["points"] += 2
        this.scoreBoard[group][match.winner]["scored"] += winnersScore
        this.scoreBoard[group][match.winner]["conceded"] += losersScore
        this.scoreBoard[group][match.winner]["dif"] = this.scoreBoard[group][match.winner]["scored"]  -  this.scoreBoard[group][match.winner]["conceded"] 
        
        this.scoreBoard[group][match.loser]["losses"] += 1
        this.scoreBoard[group][match.loser]["points"] += 1
        this.scoreBoard[group][match.loser]["scored"] += losersScore
        this.scoreBoard[group][match.loser]["conceded"] += winnersScore
        this.scoreBoard[group][match.loser]["dif"] = this.scoreBoard[group][match.loser]["scored"]  -  this.scoreBoard[group][match.loser]["conceded"] 
        
        if (match.surrender){
            this.scoreBoard[group][match.loser]["points"] -= 1
        }
        
        
    }
    
    simulateGroupStage(groups){

        function simulateMatch(teamA, teamB) {
            const rankDiff = teamB.FIBARanking - teamA.FIBARanking;
            const probabilityAWinning = 1 / (1 + Math.exp(rankDiff / 10));
            const surrenderProbability = 0.05; 
            const isASurrender = Math.random() < surrenderProbability;
            const isBSurrender = Math.random() < surrenderProbability;
            const isAWinner = Math.random() < probabilityAWinning;
            let scoreA = Math.floor(Math.random() * (100 - 70 + 1)) + 70;
            let scoreB = Math.floor(Math.random() * (100 - 70 + 1)) + 70;
            if (scoreA == scoreB) {
                scoreA -= 1
            }
            if (isASurrender) {
                return { winner: teamB.Team, loser: teamA.Team, scoreA, scoreB, surrender:teamA.Team};
            }
            if (isBSurrender) {
                return { winner: teamA.Team, loser: teamB.Team, scoreA, scoreB, surrender:teamB.Team};
            }
            if (isAWinner) {
                return { winner: teamA.Team, loser: teamB.Team, scoreA, scoreB };
            } else {
                return { winner: teamB.Team, loser: teamA.Team, scoreA, scoreB };
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
    
        
    
        for (const groupName in groups) {
            console.log("---------------------------------------------------------------")
            console.log(`Group ${groupName}:`);
            const matches = simulateGroupStage(groups[groupName]);
            

            matches.forEach(match => {
                this.updateTeamsStats(match, groupName)
                let winnersScore = Math.max(match.scoreA, match.scoreB);
                let losersScore = Math.min(match.scoreA, match.scoreB);
                if (match.surrender){
                    console.log(`    ${match.winner} - ${match.loser} (${winnersScore}:${losersScore})  surrendered(${match.surrender})`);
                }else{
                    console.log(`    ${match.winner} - ${match.loser} (${winnersScore}:${losersScore})`);
                }
                
                this.matches[groupName].push(match)
            });
            console.log("---------------------------------------------------------------")
        }

    
        
        
    }
    showSimulatedMatches(){
        console.log(this.matches)
    }
    sortScoreBoard() {
        function headToHead(teamA, teamB, matches) {
          for (let match of matches) {
            if (match.winner === teamA && match.loser === teamB) {
              return -1; // TeamA won against TeamB, so it ranks higher
            } else if (match.winner === teamB && match.loser === teamA) {
              return 1; // TeamB won against TeamA, so it ranks higher
            }
          }
          return 0; // No head-to-head found, so consider them equal
        }
      
        for (let groupName in this.scoreBoard) {
          let teams = this.scoreBoard[groupName];
          let matches = this.matches[groupName];
      
          // Convert the teams object into an array of [key, value] pairs for sorting
          let sortedEntries = Object.entries(teams);
      
          // Sort the entries based on your logic
          sortedEntries.sort(([, teamA], [, teamB]) => {
            // First compare by points
            if (teamA.points !== teamB.points) {
              return teamB.points - teamA.points; // Higher points come first
            }
            // If points are the same, compare by head-to-head results
            return headToHead(teamA.name, teamB.name, matches);
          });
      
          // Rebuild the original object with sorted teams
          this.scoreBoard[groupName] = Object.fromEntries(sortedEntries);
      
        //   console.log(this.scoreBoard[groupName]); // Outputs sorted teams within the object
        }
      }
      
    
}

module.exports = Tournament;
