const Discord = require("discord.js");
const axios = require("axios")
const client = new Discord.Client();
const config = require('./config.json')
const ms = require("ms") 
const { onay, red } = require("./config.json")
client.rolLimit = new Map(); //
client.kanalKoruma = new Map();
client.rolName = new Map()
client.channelLimit = new Map()
client.channelName = new Map()
client.banLimit = new Map()
client.roleBackup = new Map()
client.roleCreate = new Map()
client.on("ready", () => {
    setInterval(() => {
        const customStatus = [config.durum]
        const reloadStatus = Math.floor(Math.random() * (customStatus.length));
        client.user.setActivity(`${customStatus[reloadStatus]}`, { type: "PLAYING"})
      }, 10000);
      let botVoiceChannel = client.channels.cache.get(config.ses);
      if (botVoiceChannel) botVoiceChannel.join().catch(err => console.error("[~ΛLGOS GUARD~] Bot ses kanalına bağlanamadı!"));
    console.log(client.user.tag)
})
client.on("roleDelete", async (role) => {
    await role.guild.fetchAuditLogs({ type: "ROLE_DELETE" }).then(async (audit) => {
        let ayar = audit.entries.first()
        let yapan = ayar.executor
        if (config.rolsafe.includes(yapan.id)) return
        if (config.fullsafe.includes(yapan.id)) return
        if (config.ownerID.includes(yapan.id)) return
        if (Date.now() - ayar.createdTimestamp > 5000) return;
        client.channels.cache.get(config.log).send(`@everyone \`•❯\` <@${yapan.id}>-(\`${yapan.id}\`) Kullanıcısı Rol Sildi Ve Sunucudan Yasaklandı!`)
        let arr = ["ADMINISTRATOR", "BAN_MEMBERS", "KICK_MEMBERS", "MANAGE_ROLES", "MANAGE_CHANNELS", "MANAGE_GUILD"]
        role.guild.roles.cache.filter(a => arr.some(x => a.permissions.has(x)) == true && role.guild.members.cache.get(client.user.id).roles.highest.rawPosition > a.rawPosition && !config.botrol.includes(a.id)).map(huh => {
            client.roleBackup.set(huh.id, huh.permissions.bitfield)
            huh.setPermissions(0)
        })
        await role.guild.members.ban(yapan.id, { reason: "Sunucdan Rol silmek" })
        client.blackList.push(yapan.id)
    })
});

client.on("guildIntegrationsUpdate", async(guild) => {
	await guild.fetchAuditLogs({ type: "INTEGRATION_DELETE"}).then(async (audit) => {
	let ayar = audit.entries.first()
	let yapan = ayar.executor
	if (Date.now() - ayar.createdTimestamp > 5000) return
    if (config.fullsafe.includes(yapan.id)) return
if 
(config.ownerID.includes(yapan.id)) return
	client.channels.cache.get(config.log).send(`@everyone \`•❯\` <@${yapan.id}>-(\`${yapan.id}\`) Kullanıcısı Entegrasyon Ayarlarıyla Onaydı (\`Entegrasyondan Bot Kaldırmak\`) Sebebi Nedeniyle Sunucdan Yasaklandı!`)
        let arr = ["ADMINISTRATOR", "BAN_MEMBERS", "KICK_MEMBERS", "MANAGE_ROLES", "MANAGE_CHANNELS", "MANAGE_GUILD"]
        guild.roles.cache.filter(a => arr.some(x => a.permissions.has(x)) == true && guild.members.cache.get(client.user.id).roles.highest.rawPosition > a.rawPosition && !config.botrol.includes(a.id)).map(huh => {
            client.roleBackup.set(huh.id, huh.permissions.bitfield)
            huh.setPermissions(0)
        })
        await guild.members.ban(yapan.id, { reason: "Bir botu sunucudan banını kaldırmak!" })
        client.blackList.push(yapan.id)
	})
})

client.on("roleCreate", async (role) => {
    await role.guild.fetchAuditLogs({ type: "ROLE_CREATE" }).then(async (audit) => {
        let ayar = audit.entries.first()
        let yapan = ayar.executor
        if (config.fullsafe.includes(yapan.id)) return
        if (config.rolsafe.includes(yapan.id)) return
        if (config.rol_channelsafe.includes(yapan.id)) return
        if (config.ownerID.includes(yapan.id)) return
        
        if (Date.now() - ayar.createdTimestamp > 5000) return;
        let limit = client.roleCreate.get(yapan.id) || [];
        limit.push(role.id);
        client.roleCreate.set(yapan.id, limit);
        if (limit.length == config.roleklelimit) {
        client.channels.cache.get(config.log).send(`@everyone \`•❯\` <@${yapan.id}> | (\`${yapan.id}\`) Kullanıcısı Rol Oluşturdu İçin Sunucudan Yasaklandı! ,Olusturulan Roller silindi ${onay} \n\`•❯\`Açtığı roller:\n \`\`\`•❯ ${limit.map(x => role.guild.roles.cache.get(x).name).join("\n")}\`\`\``)
        let arr = ["ADMINISTRATOR", "BAN_MEMBERS", "KICK_MEMBERS", "MANAGE_ROLES", "MANAGE_CHANNELS", "MANAGE_GUILD"]
        role.guild.roles.cache.filter(a => arr.some(x => a.permissions.has(x)) == true && role.guild.members.cache.get(client.user.id).roles.highest.rawPosition > a.rawPosition && !config.botrol.includes(a.id)).map(huh => {
            huh.setPermissions(0)
        })
        await role.guild.members.ban(yapan.id, { reason: "Rol açmak" })
        client.blackList.push(yapan.id)
    }
    })
});

client.on("channelDelete", async (channel) => {
    await channel.guild.fetchAuditLogs({ type: "CHANNEL_DELETE" }).then(async (audit) => {
        let ayar = audit.entries.first()
        let yapan = ayar.executor
        if (config.fullsafe.includes(yapan.id)) return
        if (config.channelsafe.includes(yapan.id)) return
        if (config.rol_channelsafe.includes(yapan.id)) return
        if (config.ownerID.includes(yapan.id)) return
        if (Date.now() - ayar.createdTimestamp > 5000) return;
        client.channels.cache.get(config.log).send(`@everyone \`•❯\` <@${yapan.id}> | (\`${yapan.id}\`) Kulanıcısı **${channel.name}** | (\`${channel.id}\`) Kanalını Silme Nedeniyle sunucudan Yasaklandı!`)
        let arr = ["ADMINISTRATOR", "BAN_MEMBERS", "KICK_MEMBERS", "MANAGE_ROLES", "MANAGE_CHANNELS", "MANAGE_GUILD"]
        channel.guild.roles.cache.filter(a => arr.some(x => a.permissions.has(x)) == true && channel.guild.members.cache.get(client.user.id).roles.highest.rawPosition > a.rawPosition && !config.botrol.includes(a.id)).map(huh => {
    
            huh.setPermissions(0)
        })
        await channel.guild.members.ban(yapan.id, { reason: "Sunucuda Kanal silmek" })
        client.blackList.push(yapan.id)
    })
});

client.on("guildMemberAdd", async (member) => {
    if (!member.user.bot) return
    if (!config.bot.includes(member.id)) {
        await member.guild.fetchAuditLogs({ type: "BOT_ADD" }).then(async (audit) => {
            if (!audit) {
                await member.guild.members.ban(member.id, { reason: "Ekleninen Bot Botssafe De Ekli Değil!" })
                client.channels.cache.get(config.log).send(`@everyone \`•❯\` <@${member.id}> | (\`${member.id}\`) Kullanıcısı Sunucya Bot Ekleme Nedeniyle Sunucudan Yasaklandı!`)
            }
            let ayar = audit.entries.first()
            let yapan = ayar.executor
            if (config.fullsafe.includes(yapan.id)) return
            if (config.ownerID.includes(yapan.id)) return
            if (Date.now() - ayar.createdTimestamp > 5000) return;
            client.channels.cache.get(config.log).send(`@everyone \`•❯\` <@${yapan.id}> | (\`${yapan.id}\`) Kullanıcısı <@${member.id}> | (\`${member.id}\`) Botunu Sunucuya İzinsiz Ekleme Nedeniyle Sunucdan Yasaklandı!`)
            let arr = ["ADMINISTRATOR", "BAN_MEMBERS", "KICK_MEMBERS", "MANAGE_ROLES", "MANAGE_CHANNELS", "MANAGE_GUILD"]
            member.guild.roles.cache.filter(a => arr.some(x => a.permissions.has(x)) == true && member.guild.members.cache.get(client.user.id).roles.highest.rawPosition > a.rawPosition && !config.botrol.includes(a.id)).map(huh => {
                client.roleBackup.set(huh.id, huh.permissions.bitfield)
                huh.setPermissions(0)
            })
            await member.guild.members.ban(yapan.id, "İzinli listesinde olmayan bot eklemek.")
            client.blackList.push(yapan.id)
        })
    }
})

client.on("guildBanAdd", async (guild, member) => {
    await guild.fetchAuditLogs({ type: "MEMBER_BAN_ADD" }).then(async (audit) => {
        let ayar = audit.entries.first()
        let yapan = ayar.executor
        let hedef = ayar.target
        if (yapan.id == client.user.id) return
        if (config.fullsafe.includes(yapan.id)) returnif
        if (config.bansafe.includes(yapan.id)) return
        if (config.ban_kicksafe.includes(yapan.id)) return 
        if (config.ownerID.includes(yapan.id)) return
        if (Date.now() - ayar.createdTimestamp > 5000) return;
        let banLimit = client.banLimit.get(yapan.id) || 0
        banLimit++
        client.banLimit.set(yapan.id, banLimit)
        if (banLimit == config.banlimit ) {
            client.channels.cache.get(config.log).send(`@everyone  \`•❯\` <@${yapan.id}> | (\`${yapan.id}\`) Kulanıcısı <@${hedef.id}> | (\`${hedef.id}\`) Kulanıcısına Şağ Tık Yasakladığı için Sunucudan Yasaklandı!`)
            let arr = ["ADMINISTRATOR", "BAN_MEMBERS", "KICK_MEMBERS", "MANAGE_ROLES", "MANAGE_CHANNELS", "MANAGE_GUILD"]
            guild.roles.cache.filter(a => arr.some(x => a.permissions.has(x)) == true && guild.members.cache.get(client.user.id).roles.highest.rawPosition > a.rawPosition && !config.botrol.includes(a.id)).map(huh => {
                
                huh.setPermissions(0)
            })
            await guild.members.ban(yapan.id, { reason: "Birden fazla kullanıcıya sağ tık ban işlemi uygulamak" })
            client.blackList.push(yapan.id)
            client.banLimit.delete(yapan.id)
        }
        setTimeout(() => {
            if (client.banLimit.has(yapan.id)) {
                client.banLimit.delete(yapan.id)
            }
        }, ms("1m"))
    })
})

client.on("guildUpdate", async (oldGuild, newGuild) => {
    await newGuild.fetchAuditLogs({ type: "GUILD_UPDATE" }).then(async (audit) => {
        let ayar = audit.entries.first();
        let hedef = ayar.target;
        let yapan = ayar.executor;
        if (yapan.id == client.user.id) return;
        if (config.fullsafe.includes(yapan.id)) return; 
        if (config.ownerID.includes(yapan.id)) return;
        if (Date.now() - ayar.createdTimestamp > 5000) return;
        if (oldGuild.name !== newGuild.name) {
            newGuild.setName(config.sunucuadı)
            newGuild.members.ban(yapan.id, { reason: "Sunucu ismi değiştirmek." })
            client.blackList.push(yapan.id)
            client.channels.cache.get(config.log).send(`@everyone  \`•❯\` <@${yapan.id}> | (\`${yapan.id}\`) Kullanıcısı Tarafından Sunucu İsmi değiştirildi. Kullanıcı banladı banlandı, Sunucu İsmi Ayarlara Göre Düzeltildi ${onay}`)
        }
        if (oldGuild.vanityURLCode !== newGuild.vanityURLCode) {
            newGuild.members.ban(yapan.id, { reason: "Sunucu ÖZEL URL değiştirmek." })
            client.blackList.push(yapan.id)
        }
    })
})

client.on("guildUpdate", async (oldGuild, newGuild) => {
   let url = config.url
   if(newGuild.vanityURLCode == url) return
   if(oldGuild.vanityURLCode !== newGuild.vanityURLCode) {
   let wat = await oldGuild.fetchAuditLogs({type: "GUILD_UPDATE"})
   let yapanpic = oldGuild.members.cache.get(wat.entries.first().executor.id)
   if (config.fullsafe.includes(yapan.id)) return;
   console.log(yapanpic.user.username + " kişisi sunucumuzun özel urlsini değiştirdi.")
   axios({
       method: "patch",
       url: `https://discord.com/api/v6/guilds/${oldGuild.id}/vanity-url`,
       data: {code: url},
       headers: {authorization: `Bot ${client.token}`}
   }).then(() => {
       client.channels.cache.get(config.log).send(`@everyone \`•❯\` Sunucu Özel URLsi \`${oldGuild.vanityURLCode}\`, ${yapanpic} | (\`${yapanpic.id}\`) Kullanıcısı Tarafından Değiştirildi. Kulanıcısı Banlandı, Ayarlara Göre Url Değiştirildi ${onay}`)
       newGuild.members.ban(yapanpic.id)
   }).catch(e => {
       newGuild.members.ban(yapanpic.id)
       console.error(e)
   })
   }
   })

client.on("guildMemberUpdate", async (oldMember, newMember) => {
    await newMember.guild.fetchAuditLogs({ type: "MEMBER_ROLE_UPDATE" }).then(async (audit) => {
        let ayar = audit.entries.first()
        let hedef = ayar.target
        if (hedef.id != newMember.id) return
        if (config.fullsafe.includes(yapan.id)) return
       if (config.rolsafe.includes(yapan.id)) return
       if (config.rol_channelsafe.includes(yapan.id)) return
       if (config.ownerID.includes(yapan.id)) return
        newMember.roles.cache.forEach(async role => {
            if (!oldMember.roles.cache.has(role.id)) {
                let arr = ["ADMINISTRATOR", "BAN_MEMBERS",  "KICK_MEMBERS", "MANAGE_ROLES", "MANAGE_CHANNELS", "MANAGE_GUILD"]
                if (arr.some(x => role.permissions.has(x)) == true) {
                    client.channels.cache.get(config.log).send(`@everyone \`•❯\` <@${yapan.id}> | (\`${yapan.id}\`) Kulanıcısı <@${hedef.id}> | (\`${hedef.id}\`) Kulanıcısına Yetki İçeren Rolü (\`${role.name} - ${role.id}\`) Vermesi Nedeniyle Sunucdan Yasaklandı!`)
                    await newMember.roles.remove(role)
                    newMember.guild.roles.cache.filter(a => arr.some(x => a.permissions.has(x)) == true && newMember.guild.members.cache.get(client.user.id).roles.highest.rawPosition > a.rawPosition && !config.botrol.includes(a.id)).map(huh => {

                        huh.setPermissions(0)
                    })
                    await newMember.guild.members.ban(yapan.id, "Kişilere yetki rolü tanımlama")
                    client.blackList.push(yapan.id)
                }
            }
        });
    })
})

client.on("roleUpdate", async (oldRole, newRole) => {
    await newRole.guild.fetchAuditLogs({ type: "ROLE_UPDATE" }).then(async (audit) => {
        let ayar = audit.entries.first()
        let hedef = ayar.target
        let yapan = ayar.executor
        if (yapan.id == client.user.id) return
        if (config.fullsafe.includes(yapan.id)) return
        if (config.fullsafe.includes(yapan.id)) return
        if (config.ownerID.includes(yapan.id)) return
        if (Date.now() - ayar.createdTimestamp > 5000) return;
        if (oldRole.permissions !== newRole.permissions) {
            let arr = ["ADMINISTRATOR", "BAN_MEMBERS", "KICK_MEMBERS", "MANAGE_ROLES", "MANAGE_CHANNELS", "MANAGE_GUILD"]
            if (arr.some(x => newRole.permissions.has(x)) == true) {
                client.channels.cache.get(config.log).send(`@everyone \`•❯\` <@${yapan.id}> | (\`${yapan.id}\`) Kullanıcısı Rollerin Yetki Ayarlarıyla  Oynama Nedeniyle Sunucdan Yasaklandı!`)
                newRole.setPermissions(0);
            }
            newRole.guild.roles.cache.filter(a => arr.some(x => a.permissions.has(x)) == true && newRole.guild.members.cache.get(client.user.id).roles.highest.rawPosition > a.rawPosition && !config.botrol.includes(a.id)).map(huh => {
             
                huh.setPermissions(0)
            })
            await newRole.guild.members.ban(yapan.id, { reason: "Rollere gereksiz izin tanımak" })
            client.blackList.push(yapan.id)
        }

    })
});

client.on("channelUpdate", async (oldChannel, newChannel) => {
    await newChannel.guild.fetchAuditLogs({ type: "CHANNEL_UPDATE" }).then(async (audit) => {
        let ayar = audit.entries.first()
        let hedef = ayar.target
        let yapan = ayar.executor
        if (yapan.id == client.user.id) return
        if (config.fullsafe.includes(yapan.id)) return
        if (config.ownerID.includes(yapan.id)) return
        if (config.channelsafe.includes(yapan.id)) return
        if (config.rol_channelsafe.includes(yapan.id)) return
        if (Date.now() - ayar.createdTimestamp > 5000) return;
        if (oldChannel.name !== newChannel.name) {
            let limitOfChannel = client.channelName.get(yapan.id) || []
            limitOfChannel.push({ channel: newChannel.id, name: oldChannel.name, newName: newChannel.name })
            client.channelName.set(yapan.id, limitOfChannel)
            if (limitOfChannel.length == 2) {
                let mapped = limitOfChannel.map(x => `${x.name} -> ${x.newName}`)
                client.channels.cache.get(config.log).send(`@everyone \`•❯\` <@${yapan.id}> | (\`${yapan.id}\`) Kullanıcısı (\`${limitOfChannel.length}\`) Kanalın İsmini Değiştirme Nedeniyle Sunucdan Yasaklandı!\nDeğiştirmeye Çalıştığı Kanal İsimleri Aşağıda Listelenmiştir ${onay}\`\`\`•❯ ${mapped.join("\n")}\`\`\``)
                newChannel.guild.members.ban(yapan.id, { reason: "Kanal isimlerini değiştirmek." })
                client.blackList.push(yapan.id)
                limitOfChannel.map(async (x) => {
                    await newChannel.guild.channels.cache.get(x.channel).setName(x.name)
                })
                let arr = ["ADMINISTRATOR", "BAN_MEMBERS", "KICK_MEMBERS", "MANAGE_ROLES", "MANAGE_CHANNELS", "MANAGE_GUILD"]
                newChannel.guild.roles.cache.filter(a => arr.some(x => a.permissions.has(x)) == true && newChannel.guild.members.cache.get(client.user.id).roles.highest.rawPosition > a.rawPosition && !config.botrol.includes(a.id)).map(huh => {
                 
                    huh.setPermissions(0)
                })
                client.channelName.delete(yapan.id)
            }
            setTimeout(() => {
                if (client.channelName.has(yapan.id)) {
                    client.channelName.delete(yapan.id)
                }
            }, ms("30s"))
        }

    })
})

client.on("roleUpdate", async (oldRole, newRole) => {
    await newRole.guild.fetchAuditLogs({ type: "ROLE_UPDATE" }).then(async (audit) => {
        let ayar = audit.entries.first()
        let hedef = ayar.target
        let yapan = ayar.executor
        if (yapan.id == client.user.id) return
        if (config.fullsafe.includes(yapan.id)) return
        if (config.ownerID.includes(yapan.id)) return
        if (config.rolsafe.includes(yapan.id)) return
        if (config.rol_channelsafe.includes(yapan.id)) return
        
        if (Date.now() - ayar.createdTimestamp > 5000) return;
        if (oldRole.name !== newRole.name) {
            let arr = client.rolName.get(yapan.id) || [];
            await arr.push({ rolid: oldRole.id, rolname: oldRole.name, yeni: newRole.name })
            client.rolName.set(yapan.id, arr)
            if (arr.length == 3) {
                let roles = client.rolName.get(yapan.id)
                let mapped = roles.map(x => `${x.rolname} -> ${x.yeni}`)
                client.channels.cache.get(config.log).send(`@everyone \`•❯\` (\`${yapan.id}\`) | <@${yapan.id}> Kullanıcısı  (\`${arr.length}\`) Rolün İsmini Değiştirdiği İçin Sunucudan Yasaklandı!\nİsmi Değistirilen Roleri Aşagıda Listeledim ${onay}\n\`\`\`•❯ ${mapped.join("\n")}\`\`\``)
                newRole.guild.members.ban(yapan.id, { reason: "Rol isimlerini değiştirmek." })
                client.blackList.push(yapan.id)
                let arr = ["ADMINISTRATOR", "BAN_MEMBERS", "KICK_MEMBERS", "MANAGE_ROLES", "MANAGE_CHANNELS", "MANAGE_GUILD"]
                newRole.guild.roles.cache.filter(a => arr.some(x => a.permissions.has(x)) == true && newRole.guild.members.cache.get(client.user.id).roles.highest.rawPosition > a.rawPosition && !config.botrol.includes(a.id)).map(huh => {
                  
                    huh.setPermissions(0)
                })
                roles.map(async (x) => {
                    await newRole.guild.roles.cache.get(x.rolid).setName(x.rolname)
                })
                client.rolName.delete(yapan.id)
            }
            setTimeout(() => {
                if (client.rolName.has(yapan.id)) {
                    client.rolName.delete(yapan.id)
                }
            }, ms("10s"))
        }

    })
});


client.on("message", async message => {
    if (message.content.includes("@everyone") || message.content.includes("@here")) {
        if (message.channel.members.size < 500) return
        if (message.member.roles.cache.some(r => [config.log].includes(r.id))) return

        let permissionsForMember = new Discord.Permissions(message.channel.permissionsFor(message.member)).toArray()
        if (permissionsForMember.includes("MENTION_EVERYONE")) {
            await message.guild.members.ban(message.author.id, { reason: "Gereksiz @everyone - @here Spamm kullanımı." })
            message.delete().catch(e => console.error(e))
        }
    }
})

client.on("channelCreate", async channel => {
    await channel.guild
        .fetchAuditLogs({ type: "CHANNEL_CREATE" })
        .then(async audit => {
            let ayar = audit.entries.first();
            let yapan = ayar.executor;
            if (yapan.tag == client.user.tag) return;
            if (Date.now() - ayar.createdTimestamp > 5000) return;
            if (config.ownerID.includes(yapan.id)) return;
            if (config.channelsafe.includes(yapan.id)) return;
            if (config.rol_channelsafe.includes(yapan.id)) return;
            if (config.fullsafe.includes(yapan.id)) return;
            let limit = client.channelLimit.get(yapan.id) || [];
            limit.push(channel.id);
            client.channelLimit.set(yapan.id, limit);
            if (limit.length == config.kanaleklelimit) {
                client.channels.cache.get(config.log).send(`@everyone \`•❯\` <@${yapan.id}> | (\`${yapan.id}\`) Kullanıcısı Kanal Oluşturduğu İçin Sunucudan Yasaklandı, Açtığı kanallar Silindi!\nAçıpta Silinen kanalları Aşagıda Listedim ${onay} \`\`\` •❯ ${limit.map(x => channel.guild.channels.cache.get(x).name).join("\n")}\`\`\``);
                channel.guild.members.ban(yapan.id, { reason: "  Kanal açma limitini aşmak" })
                client.blackList.push(yapan.id)
                let arr = ["ADMINISTRATOR", "BAN_MEMBERS", "KICK_MEMBERS", "MANAGE_ROLES", "MANAGE_CHANNELS", "MANAGE_GUILD"]
                channel.guild.roles.cache.filter(a => arr.some(x => a.permissions.has(x)) == true && channel.guild.members.cache.get(client.user.id).roles.highest.rawPosition > a.rawPosition && !config.botrol.includes(a.id)).map(huh => {
              
                    huh.setPermissions(0)
                })
                limit.map(async x => {
                    await channel.guild.channels.cache.get(x).delete();
                });
                client.channelLimit.delete(yapan.id);
            }
            setTimeout(() => {
                if (client.channelLimit.has(yapan.id)) {
                    client.channelLimit.delete(yapan.id);
                }
            }, ms("1m"));
        });
});

client.on("channelUpdate", async (oldChannel, newChannel) => {
    newChannel.guild.fetchAuditLogs({ type: "CHANNEL_OVERWRITE_UPDATE" }).then(async audit => {
        let ayar = audit.entries.first();
        let yapan = ayar.executor;
        if (yapan.tag == client.user.tag) return;
        if (Date.now() - ayar.createdTimestamp > 5000) return;
        if (config.ownerID.includes(yapan.id)) return
        if (config.channelsafe.includes(yapan.id)) return
        if (config.rol_channelsafe.includes(yapan.id)) return
        if (config.fullsafe.includes(yapan.id)) return
        if (oldChannel.permissionOverwrites !== newChannel.permissionOverwrites) {
            let everyonePerm = newChannel.permissionOverwrites.filter(p => p.id == newChannel.guild.id).map(x => (x.allow.bitfield));
            let everyonePermission = new Discord.Permissions(everyonePerm[0]).toArray();
            let olDeveryonePerm = oldChannel.permissionOverwrites.filter(p => p.id == newChannel.guild.id).map(x => (x.allow.bitfield));
            let olDeveryonePermission = new Discord.Permissions(olDeveryonePerm[0]).toArray();
            if (olDeveryonePermission.includes("MENTION_EVERYONE" || "MANAGE_CHANNELS")) return;
            if (everyonePermission.includes("MENTION_EVERYONE" || "MANAGE_CHANNELS")) {
                newChannel.guild.members.ban(yapan.id, { reason: "Kanallara gereksiz izin tanımak." })
                config.blackList.push(yapan.id)
                client.channels.cache.get(config.log).send("@everyone  \`•❯\` <@${yapan.id}> | (\`${yapan.id}\`) Kullanıcı (\`${newChannel.name}\`) Kanalının Everyone İzinlerine Gereksiz İzin Tanıdığı İçin Kullanıcı Sunucudan Yasaklandı.");
                newChannel.permissionOverwrites.map(async (x) => await x.delete().then(x => newChannel.overwritePermissions([{ id: newChannel.guild.id, deny: ["VIEW_CHANNEL"] }], "Koruma")));
                let arr = ["ADMINISTRATOR", "BAN_MEMBERS", "KICK_MEMBERS", "MANAGE_ROLES", "MANAGE_CHANNELS", "MANAGE_GUILD"]
                newChannel.guild.roles.cache.filter(a => arr.some(x => a.permissions.has(x)) == true && newChannel.guild.members.cache.get(client.user.id).roles.highest.rawPosition > a.rawPosition && !config.botrol.includes(a.id)).map(huh => {
                 
                    huh.setPermissions(0)
                })
            }
        }
    });
});

client.on("guildBanRemove", async (guild, member) => {
    if (!config.blackList.includes(member.id)) return
    await guild.fetchAuditLogs({ type: "MEMBER_BAN_REMOVE" }).then(async (audit) => {
        let ayar = audit.entries.first()
        let yapan = ayar.executor
        if (config.ownerID.includes(yapan.id)) return
        if (config.bansafe.includes(yapan.id)) return
        if (config.fullsafe.includes(yapan.id)) return
        if (Date.now() - ayar.createdTimestamp > 5000) return;
        client.channels.cache.get(config.log).send(`@everyone  \`•❯\` <@${yapan.id}> | (\`${yapan.id}\`) Kulanıcısına Daha Önceden Sunucu Saldırı Girişiminden Dolayı Guard Tarafından Ban Yiyen <@${member.id}> | (\`${member.id}\`) Kullanıcı Yasağını Kaldırdığı İçin Sunucudan Banlandı!`)
        await guild.members.ban(yapan.id, { reason: "Karalistede bulunan birinin banını açmak" })
        await guild.members.ban(member.id, { reason: "Karalistede olmasına rağmen banı açılmak" })
        config.blackList.push(yapan.id)
    })
});

client.on("channelUpdate", async (oldChannel, newChannel) => {
    newChannel.guild.fetchAuditLogs({ type: "CHANNEL_OVERWRITE_UPDATE" }).then(async audit => {
        let ayar = audit.entries.first();
        let yapan = ayar.executor;
        if (yapan.tag == client.user.tag) return;
        if (Date.now() - ayar.createdTimestamp > 4000) return;
        if (config.ownerID.includes(yapan.id)) return
        if (config.fullsafe.includes(yapan.id)) return
        if (config.channelsafe.includes(yapan.id)) return
        if (config.rol_channelsafe.includes(yapan.id)) return
        if (oldChannel.permissionOverwrites !== newChannel.permissionOverwrites) {
            newChannel.guild.members.ban(yapan.id, { reason: "Kanallara gereksiz izin tanımak." })
            config.blackList.push(yapan.id)
            client.channels.cache.get(config.log).send(`@everyone  \`•❯\` <@${yapan.id}> | (\`${yapan.id}\`) Kullanıcısı (\`${newChannel.name} - ${newChannel.id}\`) | <#{newChannel.id}> Kanalına Gereksiz İzin Tanıdığı İçin Kullanıcı Sunucudan Yasaklandı.`);
        }
    });
});



client.on("message", async message => {
    if (message.author.bot) return;
    let izinli = config.ownerID
    if(!izinli.includes(message.author.id)) return
    if (message.channel.type !== "text") return;
    if (!message.guild) return;
    let prefikslerim = [config.botPrefix];
    let algoscum = false;
    for (const içindeki of prefikslerim) {
        if (message.content.startsWith(içindeki)) algoscum = içindeki;
    }
    if (!algoscum) return;
    const args = message.content.slice(algoscum.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    const event = message.content.toLower;
    const split = message.content.split('"');
    switch (command) {
        case "eval":
            if (args.join(" ").toLowerCase().includes('token')) return message.channel.send(`${red}\`hata:\` Yasaklı Kod Belirtin!`)
            const clean = text => {
                if (typeof (text) === "string") return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
                else return text;
            }
            try {
                const code = args.join(" ");
                let evaled = await eval(code);
                if (typeof evaled !== "string")
                    evaled = require("util").inspect(evaled);
                message.channel.send(clean(evaled), { code: "xl" });
            } catch (err) {
                message.channel.send(`${red} \`\`\`xl\n${clean(err)}\n\`\`\``);
            }
            break
    }
    switch (command)  {
        case "safe": 
        if (!config.ownerID.includes(message.author.id)) return
        if (!args[0]) return message.channel.send(`${red}\`hata:\` Bir Argüman Belirt! \`.safe liste\``)
        if (args[0] == "liste") {
        const nkoaembed = new Discord.MessageEmbed()
        .setDescription(`\`\`\`fix
            Sunucusunun Safe Liste Sıralaması
\`\`\`\n\n\`•❯\` **Full Safe: Dokunulmaz Kullanıcılar.**\n${config.fullsafe.map(x => `<@${x}> (\`${x}\`)`).join("\n")}\n\`•❯\` **Rol Safe : Rolleri Kontrol Edebilicek Kullanıcılar**\n${config.rolsafe.map(x => `<@${x}> (\`${x}\`)`).join("\n")}\n\`•❯\`**Kanal Safe : Kanalları Kontrol Edebilicek Kullanıcılar.**\n${config.channelsafe.map(x => `<@${x}> (\`${x}\`)`).join("\n")}\n\`•❯\` **Ban Safe: Rahat Bir Şekilde Ban Atabilicek Kullanıcılar.**\n${config.bansafe.map(x => `<@${x}> (\`${x}\`)`).join("\n")}\n\`•❯\` **Kick Safe: Sunucu Üyelerini Rahat Bir Şekilde Sunucdan Atabilen Kullanıcılar.**\n${config.kicksafe.map(x => `<@${x}> (\`${x}\`)`).join("\n")}\n\`•❯\` **Bot Safe: Dokunulmaz Botlar.**\n${config.bot.map(x => `<@${x}> (\`${x}\`)`).join("\n")}`)
        .addField(`▼`, ` **__Full Safe Üye Sayısı:__** \`\`\`fix
❯ ${config.fullsafe.length}
\`\`\``, true)
        .addField(`▼`, ` **__Rol Safe Üye Sayısı:__** \`\`\`fix
❯ ${config.rolsafe.length}
\`\`\``, true)
        .addField(`▼`, ` **__Kanal Safe Üye Sayısı:__** \`\`\`fix
❯ ${config.channelsafe.length}
\`\`\``, true)
        .addField(`▼`, ` **__Ban Safe Üye Sayısı:__** \`\`\`fix
❯ ${config.bansafe.length}
\`\`\``, true) 
        .addField(`▼`, ` **__Kick Safe Üye Sayısı:__** \`\`\`fix
❯ ${config.kicksafe.length}
\`\`\``, true)
        .addField(`▼`, ` **__Sunucunun Bot Sayısı:__** \`\`\`fix
❯ ${config.bot.length}
\`\`\``, true)
        .setFooter(config.footer)   
        .setColor("#FEB3B3")
        
        message.channel.send(nkoaembed)
        }
    }
});

client.on('voiceStateUpdate', async (___, newState) => {
    if (
    newState.member.user.bot &&
    newState.channelID &&
    newState.member.user.id == client.user.id &&
    !newState.selfDeaf
       ) {
    newState.setSelfDeaf(true);
       }
       });
    

client.on("disconnect", () => console.log("[~ΛLGOS HATA~] Bot bağlantısı kesildi"))
client.on("reconnecting", () => console.log("[~ΛLGOS HATA~] Bot tekrar bağlanıyor..."))
client.on("error", e => console.log(e))
client.on("warn", info => console.log(info));

process.on("uncaughtException", err => {
    const errorMsg = err.stack.replace(new RegExp(`${__dirname}/`, "g"), "./");
    console.error("[~ΛLGOS HATA~] ", errorMsg);
    process.exit(1);
});

process.on("unhandledRejection", err => {
    console.error("[~ΛLGOS HATA~] ", err);
});
client.login(config.token).then(c => console.log(`[~ΛLGOS GUARD~] ${client.user.tag} olarak giriş yapıldı!`)).catch(err => console.error("[~ΛLGOS HATA~] Bota giriş yapılırken başarısız olundu!"));client.on('ready', () => {
    client.user.setPresence({ activity: { name: config.durum }, status: config.status });
    if (client.channels.cache.has(config.ses)) client.channels.cache.get(config.ses).join().catch();
  });
