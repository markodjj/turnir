const Group = require('./group');
const Team = require('./team');

class Tournament {
    constructor() {
        this.groups = {}; 
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

    showTournament(){
        console.log("All Groups and Teams:");
        for (let groupName in this.getAllGroups()) {
            const group = this.getGroup(groupName);
            console.log(`Group ${groupName}:`);
            group.getTeams().forEach(team => {
                console.log(`  ${team.team} (${team.ISOCode}) - FIBA Ranking: ${team.FIBARanking}`);
            });
        }

    }
}

module.exports = Tournament;
