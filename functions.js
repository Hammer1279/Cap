module.exports = (client) => {
    const Discord = require('discord.js');
    const times = x => f => {
        if (x > 0) {
            f()
            times(x - 1)(f)
        }
    }

    client.awaitReply = async (msg, question, limit, del) => {
        const filter = m => m.author.id === msg.author.id;
        const m = await msg.channel.send(question);
        try {
            const collected = await msg.channel.awaitMessages(filter, {
                max: 1,
                time: limit,
                errors: ["time"]
            });
            if (del) {
                m.delete();
                collected.first().delete()
            }
            return collected.first().content;
        } catch (e) {
            return false;
        }
    };

    client.loadcommand = (commandName) => {
        try {
            const props = require(`./commands/${commandName}`);
            client.commands.set(props.help.name, props);

            props.help.aliases.forEach(a => {
                client.aliases.set(a, props.help.name)
            });
        } catch (e) {
            console.log(`Unable to load ${commandName}: ${e}`)
        }
    }

    client.timeDiff = (start, stop) => {
        var distance = stop - start;
        var weeks = Math.floor(distance / (1000 * 60 * 60 * 24 * 7));
        var days = Math.floor((distance % (1000 * 60 * 60 * 24 * 7)) / (1000 * 60 * 60 * 24));
        var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((distance % (1000 * 60) / 1000));

        if (weeks > 0)
            return weeks + "w " + days + "d " + hours + "h " + minutes + "min ";

        else if (days > 0)
            return days + "d " + hours + "h " + minutes + "min ";

        else if (hours > 0)
            return hours + "h " + minutes + "min ";

        else if (minutes > 0) {
            if (minutes < 10) return minutes + 'min ' + seconds + "sec";
            else return minutes + "min ";
        } else if (seconds > 0)
            return seconds + "sec";

        else if (seconds < 0)
            return "Now";
    }

    client.connect = (con) => {
        con.connect(function (err) {
            console.log(`Connected to sql database`);
        });
    }

    client.rankcard = (user, rank, design) => {
        if (design == undefined) design = user.rankCard;
        switch (design) {
            case 0:
                return client.rankembed1(user, rank)
            case 1:
                return client.rankembed3(user, rank)
            case 2:
                return client.rankembed4(user, rank)
        }
    }

    client.rank = (result, id, guildID) => {
        i = 0;
        let output = null;
        result.forEach(u => {
            if (u.UserID === id && u.guildID === guildID) output = i + 1;
            i++
        });
        return output;
    }

    client.makekey = (length) => {
        var result = '';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }

    client.titleEnd = (a) => {
        let i = 1;
        while (i < a.length) {
            if (a[i].includes('|')) {
                return i
            }
            i++
        }
        return 0
    }

    client.computerToHumanTime = async (ct, timezone) => {
        return new Promise(async (resolve, reject) => {
            if (!timezone) timezone = 0
            let date = new Date(ct + timezone * 3600000)
            let days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
            let day = date.getUTCDay()
            let hour = date.getUTCHours()
            let minute = date.getUTCMinutes()
            if (hour.toString().length == 1) hour = `0${hour}`;
            if (minute.toString().length == 1) minute = `0${minute}`

            resolve(`${days[day - 1]} at ${hour}:${minute}`)
        })
    }


    client.humanToComputerTime = async (humanTime, msg, con, event) => {
        return new Promise(async (resolve, reject) => {
            let i;
            let numWordsD = ["two", "three", "four", "five", "six", "seven"]
            let numWordsH = ["one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelwe", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen", "twenty", "twentyone", "twentytwo", "twentythree", "twentyfour"]
            let type = null;
            let err;
            let sec = 1000;
            let minute = 60000;
            let hour = 3600000;
            let day = 86400000;

            for (i = 0; i < humanTime.length; i++) {
                if (!humanTime[i + 1]) {
                    err = "missingArgs"
                    break;
                }
                if (humanTime[i].toLowerCase() == "in") {
                    if (!humanTime[i + 1]) {
                        err = "missingArgs"
                        break;
                    }
                    if (numWordsD.includes(humanTime[i + 1]) || humanTime[i + 1].match(/[1-7]/gm)) {
                        if (humanTime[i + 2].toLowerCase() == "days") {
                            if (!humanTime[i + 3]) {
                                console.log("test")
                                type = 2
                                break
                            } else if (humanTime[i + 3].toLowerCase() == "at") {
                                type = 1
                                break
                            } else {
                                err = "incorrectArgs"
                                break
                            }
                        } else if (humanTime[i + 2].match(/hours|hour|hr|hrs/gmi)) {
                            type = 2
                            break
                        } else {
                            err = "incorrectArgs"
                            break
                        }
                    } else if (numWordsH.includes(humanTime[i + 1]) || humanTime[i + 1].match(/[1-24]/gm)) {
                        if (humanTime[i + 2].match(/hours|hour|hr|hrs/gmi)) {
                            type = 2
                            break
                        } else {
                            err = "incorrectArgs"
                            break
                        }
                    } else {
                        err = "incorrectArgs"
                        break
                    }
                } else if (humanTime[i].toLowerCase() == "tomorrow") {
                    if (!humanTime[i + 1] || !humanTime[i + 2]) {
                        err = "missingArgs";
                        break
                    }
                    if (humanTime[i + 1].toLowerCase() == "at") {
                        type = 1
                        break

                    } else {
                        type = 3
                        break
                    }
                } else if (humanTime[i].toLowerCase() == "next") {
                    if (!humanTime[i + 1] || !humanTime[i + 2] || !humanTime[i + 3]) {
                        err = "missingArgs";
                        break
                    }

                    if (humanTime[i + 1].toLowerCase() !== "week") {
                        err = "incorrectArgs"
                        break
                    } else {

                    }

                }
            };

            if (err) reject(err)

            con.query(`SELECT timezone from timezones where UserID = ${msg.author.id}`, async function (err, result) {
                if (type == 1) {
                    let numdays = humanTime[i + 1]
                    let time = humanTime[i + 4]

                    if (!time.match(/[0-2][0-3]:[0-5][0-9]/)) {
                        msg.channel.send(`I dont understand when you want your ${event} to happen!`);
                        resolve()
                    }

                    if (!result[0]) {
                        let utc = await client.awaitReply(msg, "You havent saved your timezone yet, head over to https://thecaptain.ga/timezone to set ur timezone! \n\n Or do you want to run your commands relative to UTC/GMT? (y=yes, n=no)", 60000, false)

                        if (utc.toLowerCase() !== "y") {
                            msg.channel.send("Save your timezone at https://thecaptain.ga/timezone, and run the command again!")
                            resolve()
                        } else {
                            let timeArr = time.split(":")
                            let hr = timeArr[0]
                            let min = timeArr[1]
                            let nowHr = new Date().getUTCHours()
                            let nowMin = new Date().getUTCMinutes()
                            let nowSec = new Date().getUTCSeconds()

                            if (!numdays.match(/^[0-9]+$/)) {
                                let days;
                                let i = 1;
                                numWordsD.forEach(w => {
                                    i++
                                    if (numdays.toLowerCase() == w) days = i;
                                    if (numdays.toLowerCase() == "tomorrow") days = 1
                                })

                                let output = new Date().getTime() + days * day + (hr * hour - nowHr * hour) + (min * minute - nowMin * minute) - nowSec * sec;
                                resolve(output)

                            } else {
                                let output = new Date().getTime() + parseInt(numdays) * day + (hr * hour - nowHr * hour) + (min * minute - nowMin * minute) - nowSec * sec;
                                resolve(output)
                            }
                        }
                    } else {
                        let timeArr = time.split(":")
                        let hr = timeArr[0]
                        let min = timeArr[1]
                        let nowHr = new Date().getUTCHours()
                        let nowMin = new Date().getUTCMinutes()
                        let nowSec = new Date().getUTCSeconds()
                        let timezone = result[0].timezone;

                        if (!numdays.match(/^[0-9]+$/)) {
                            let days;
                            let i = 1;
                            numWordsD.forEach(w => {
                                i++
                                if (numdays.toLowerCase() == w) days = i;
                            })

                            let output = new Date().getTime() + days * day + timezone * hour + (hr * hour - nowHr * hour) + (min * minute - nowMin * minute) - nowSec * sec;
                            resolve(output)

                        } else {
                            let output = new Date().getTime() + parseInt(numdays) * day + timezone * hour + (hr * hour - nowHr * hour) + (min * minute - nowMin * minute) - nowSec * sec;
                            resolve(output)
                        }
                    }
                }

                if (type == 2) {
                    let numHrs = humanTime[i + 1]

                    if (!result[0]) {
                        let utc = await client.awaitReply(msg, "You havent saved your timezone yet, head over to https://thecaptain.ga/timezone to set ur timezone! \n\n Or do you want to run your commands relative to UTC/GMT? (y=yes, n=no)", 60000, false)

                        if (utc.toLowerCase() !== "y") {
                            msg.channel.send("Save your timezone at https://thecaptain.ga/timezone, and run the command again!")
                            resolve()
                        } else {
                            if (!numHrs.match(/^[0-9]+$/)) {
                                let hours;
                                let i = 1;
                                numWordsH.forEach(w => {
                                    i++
                                    if (numHrs.toLowerCase() == w) hours = i;
                                })
                                let output = new Date().getTime() + hours * hour
                                resolve(output)
                            } else {
                                let output = new Date().getTime() + parseInt(numHrs) * hour;
                                resolve(output)
                            }
                        }
                    } else {
                        if (!numHrs.match(/^[0-9]+$/)) {
                            let hours;
                            let i = 1;
                            numWordsH.forEach(w => {
                                i++
                                if (numHrs.toLowerCase() == w) hours = i;
                            })
                            let timezone = result[0].timezone
                            let output = new Date().getTime() + timezone * hour + hours * hour
                            resolve(output)
                        } else {
                            let timezone = result[0].timezone
                            let output = new Date().getTime() + timezone * hour + parseInt(numHrs) * hour;
                            resolve(output)
                        }
                    }
                }

                if (type == 3) {
                    let numDays = humanTime[i + 1]

                    if (!result[0]) {
                        let utc = await client.awaitReply(msg, "You havent saved your timezone yet, head over to https://thecaptain.ga/timezone to set ur timezone! \n\n Or do you want to run your commands relative to UTC/GMT? (y=yes, n=no)", 60000, false)

                        if (utc.toLowerCase() !== "y") {
                            msg.channel.send("Save your timezone at https://thecaptain.ga/timezone, and run the command again!")
                            resolve()
                        } else {
                            if (!numDays.match(/^[0-9]+$/)) {
                                let days;
                                let i = 1;
                                numWordsD.forEach(w => {
                                    i++
                                    if (numDays.toLowerCase() == w) days = i;
                                    if (numdays.toLowerCase() == "tomorrow") days = 1
                                })
                                let output = new Date().getTime() + days * day
                                resolve(output)
                            } else {
                                let output = new Date().getTime() + numDays * day
                                resolve(output)
                            }
                        }
                    } else {
                        if (!numDays.match(/^[0-9]+$/)) {
                            let hours;
                            let i = 1;
                            numWordsD.forEach(w => {
                                i++
                                if (numDays.toLowerCase() == w) hours = i;
                            })
                            let timezone = result[0].timezone
                            let output = new Date().getTime() + timezone * hour + hours * hour
                            resolve(output)
                        } else {
                            let timezone = result[0].timezone
                            let output = new Date().getTime() + timezone * hour + parseInt(numDays) * hour;
                            resolve(output)
                        }
                    }
                }
            })

        })
    }

    // Checks achivements by users and gives roles accordingly

    client.achievements = async () => {
        const superagent = require("superagent")
        const roles = require("./storage/achievements.json")

        setInterval(function () {
            client.steam.forEach(async user => {
                if (user.constructor !== Array) return
                const userID = user[0]
                const steamID = user[1]

                try {
                    await superagent.get(`http://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v0001/?appid=951440&key=2B231837CB0A3A275A598F5BCEDD3B21&steamid=${steamID}`)
                } catch (err) {
                    console.log(`Cant access achivements of ${userID} because ${err}`)
                }

                const {
                    body
                } = await superagent.get(`http://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v0001/?appid=951440&key=2B231837CB0A3A275A598F5BCEDD3B21&steamid=${steamID}`)

                body.playerstats.achievements.forEach(a => {
                    if (a.achieved == 1) {
                        roles.forEach(r => {
                            if (r.name == a.apiname) {
                                if (client.guilds.cache.get("488708757304639520").members.cache.get(userID).roles.cache.has(r.role)) return
                                client.guilds.cache.get("488708757304639520").members.cache.get(userID).roles.add(r.role)
                            }
                        });
                    }
                })
            })
        }, 86400000)
    }

    client.giveAchievementRole = async (id) => {
        const superagent = require("superagent")
        const roles = require("./storage/achievements.json")
        const steamID = client.steam.get(id)[1]
        try {
            await superagent.get(`http://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v0001/?appid=951440&key=2B231837CB0A3A275A598F5BCEDD3B21&steamid=${steamID}`)
        } catch (err) {
            console.log(`Cant access achivements of ${id} because ${err}`)
        }

        const {
            body
        } = await superagent.get(`http://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v0001/?appid=951440&key=2B231837CB0A3A275A598F5BCEDD3B21&steamid=${steamID}`)

        body.playerstats.achievements.forEach(a => {
            if (a.achieved == 1) {
                roles.forEach(r => {
                    if (r.name == a.apiname) {
                        if (client.guilds.cache.get("488708757304639520").members.cache.get(id).roles.cache.has(r.role)) return
                        client.guilds.cache.get("488708757304639520").members.cache.get(id).roles.add(r.role)
                    }
                });
            }
        })
    }
}