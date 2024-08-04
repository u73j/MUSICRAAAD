const Discord = require('discord.js')
const client = new Discord.Client({
    intents: [
        Discord.GatewayIntentBits.Guilds,
        Discord.GatewayIntentBits.GuildMessages,
        Discord.GatewayIntentBits.GuildVoiceStates,
        Discord.GatewayIntentBits.MessageContent
    ]
})
const { DisTube } = require('distube')
const fs = require('fs')
const config = require('./config.json')
const { SpotifyPlugin } = require('@distube/spotify')
const { SoundCloudPlugin } = require('@distube/soundcloud')
const { YtDlpPlugin } = require('@distube/yt-dlp')

client.distube = new DisTube(client, {
    leaveOnStop: false,
    emitNewSongOnly: true,
    emitAddSongWhenCreatingQueue: false,
    emitAddListWhenCreatingQueue: false,
    plugins: [
        new SpotifyPlugin({
            emitEventsAfterFetching: true
        }),
        new SoundCloudPlugin(),
        new YtDlpPlugin()
    ]
})

const prefix = config.prefix


client.on('ready', async () => {
    console.log(`${client.user.tag} ready ✅`)
    client.user.setPresence({ activities: [{ name: `تمنيتٌ مرور الآيام ، ونسيتُ انهآ من عمري ..`, type: "WATCHING" }], status: 'dnd' });
  
})
const status = queue =>
    `Volume: \`${queue.volume}%\` | Filter: \`${queue.filters.names.join(', ') || 'Off'}\` | Loop: \`${queue.repeatMode ? (queue.repeatMode === 2 ? 'All Queue' : 'This Song') : 'Off'
    }\` | Autoplay: \`${queue.autoplay ? 'On' : 'Off'}\``
client.distube
    .on('playSong', (queue, song) =>
        queue.textChannel.send(`🎵 Started singing **${song.name}** - \`${song.formattedDuration}\``)
    )
    .on('addSong', (queue, song) =>
        queue.textChannel.send(
            `Done Adding **${song.name}** - \`${song.formattedDuration}\` to the queue - ${song.user}`
        )
    )
    .on('addList', (queue, playlist) =>
        queue.textChannel.send(
            `Done adding \`${playlist.name}\` to the playlist (The playlist has \`${playlist.songs.length}\` songs) to queue\n${status(queue)}`
        )
    )
    .on('error', (channel, e) => {
        return console.error(e)
    })
    .on('empty', channel => channel.send('Voice channel is empty! so I will leave the channel...'))
    .on('searchNoResult', (message, query) =>
        message.channel.send(`Couldn't find a result for \`${query}\`!`)
    )
    .on('finish', queue => queue.textChannel.send('No more songs to sing 🥱'))

client.on('messageCreate', async message => {
    if (message.author.bot || !message.guild) return
    if (!message.content.startsWith(prefix)) return
    const args = message.content.slice(prefix.length).trim().split(/ +/g)
    if (message.content.startsWith(prefix + "play")) {
        if (!message.member.voice.channel) return message.reply({ content: `> **عذراً ، يجب ان تكون داخل روم صوتي لتستخدم هذا الأمر**` })
        try {
            const string = args.join(' ')
            if (!string) return message.channel.send(`${client.emotes.error} | Please enter a song url or query to search.`)
            client.distube.play(message.member.voice.channel, string, {
                member: message.member,
                textChannel: message.channel,
                message
            })
        }
        catch (e) {
            console.error(e)
            message.channel.send(`حدث خطا اثناء التشغيل !`)
        }
    }
    if (message.content.startsWith(prefix + "skip")) {
        if (!message.member.voice.channel) return message.reply({ content: `> **عذراً ، يجب ان تكون داخل روم صوتي لتستخدم هذا الأمر**` })
        try {
            const queue = client.distube.getQueue(message)
            if (!queue) return message.channel.send(`I'm not singing now to stop !`)
            const song = await queue.skip()
        }
        catch (e) {
            console.error(e)
            message.channel.send(`حدث خطا اثناء التشغيل !`)
        }
    }
      if (message.content.startsWith(prefix + "pause")) {
         if (!message.member.voice.channel) return message.reply({ content: `> **عذراً ، يجب ان تكون داخل روم صوتي لتستخدم هذا الأمر**` })
        try {
            const queue = client.distube.getQueue(message)
            if (!queue) return message.channel.send(`I'm not singing now to stop !`)
        
    if (queue.paused) {
      return message.reply(`الموسيقى موقفه بالفعل !`)
    }
    queue.pause()
    message.channel.send('تم ايقاف تشغيل الاغاني بنجاح !')
        }
        catch (e) {
            console.error(e)
            message.channel.send(`حدث خطا اثناء التشغيل !`)
        }
      }
    if (message.content.startsWith(prefix + "stop")) {
        if (!message.member.voice.channel) return message.reply({ content: `> **عذراً ، يجب ان تكون داخل روم صوتي لتستخدم هذا الأمر**` })
        try {
            const queue = client.distube.getQueue(message)
            if (!queue) return message.channel.send(`I'm not singing now to stop !`)
            queue.stop()
            message.channel.send(`Done stopping the music !`)
        }
        catch (e) {
            console.error(e)
            message.channel.send(`حدث خطا اثناء التشغيل !`)
        }
    }
    //   if (message.content.startsWith(prefix + "repeat")) {
    //     if (!message.member.voice.channel) return message.reply({ content: `> **عذراً ، يجب ان تكون داخل روم صوتي لتستخدم هذا الأمر**` })
    //     try {
    //         const queue = client.distube.getQueue(message)
    //         if (!queue) return message.channel.send(`I'm not singing now to stop !`)
    //         let mode = null
    // switch (args[0]) {
    //   case 'off':
    //     mode = 0
    //     break
    //   case 'song':
    //     mode = 1
    //     break
    // }
    // mode = queue.setRepeatMode(mode)
    // mode = mode ? (mode === 'Repeat song') : 'Off'
    // message.channel.send(`repeat mode \`${mode}\``)
    //     }
    //     catch (e) {
    //         console.error(e)
    //         message.channel.send(`حدث خطا اثناء التشغيل !`)
    //     }
    // }
    if (message.content.startsWith(prefix + "volume")) {
        if (!message.member.voice.channel) return message.reply({ content: `> **عذراً ، يجب ان تكون داخل روم صوتي لتستخدم هذا الأمر**` })
        try {
            const queue = client.distube.getQueue(message)
            if (!queue) return message.channel.send(`I'm not singing now to stop !`)
            const volume = parseInt(args[1])
            if (isNaN(volume)) return message.channel.send(` Please enter a valid volume!`)
            if (volume > 200) return message.reply({ content: 'Volume must not exceed 200% !' })
            queue.setVolume(volume)
            message.channel.send(`Done setting the volume to \`${volume}\``)
        }
        catch (e) {
            console.error(e)
            message.channel.send(`حدث خطا اثناء التشغيل !`)
        }
    }
    if (message.content.startsWith(prefix + "nowplaying")) {
        if (!message.member.voice.channel) return message.reply({ content: `> **عذراً ، يجب ان تكون داخل روم صوتي لتستخدم هذا الأمر**` })
        try {
            const queue = client.distube.getQueue(message)
            if (!queue) return message.channel.send(`I'm not singing now to stop !`)
            const song = queue.songs[0]
            message.channel.send(`I'm singing **\`${song.name}\`**, by ${song.user}`)
        }
        catch (e) {
            console.error(e)
            message.channel.send(`حدث خطا اثناء التشغيل !`)
        }
    }
    if (message.content.startsWith(prefix + "autoplay")) {
        if (!message.member.voice.channel) return message.reply({ content: `> **عذراً ، يجب ان تكون داخل روم صوتي لتستخدم هذا الأمر**` })
        try {
            const queue = client.distube.getQueue(message)
            if (!queue) return message.channel.send(`I'm not singing now to stop !`)
            const autoplay = queue.toggleAutoplay()
            message.channel.send(`AutoPlay: \`${autoplay ? 'On' : 'Off'}\``)
        }
        catch (e) {
            console.error(e)
            message.channel.send(`حدث خطا اثناء التشغيل !`)
        }
    }
    if (message.content.startsWith(prefix + "forward")) {
        if (!message.member.voice.channel) return message.reply({ content: `> **عذراً ، يجب ان تكون داخل روم صوتي لتستخدم هذا الأمر**` })
        try {
            const queue = client.distube.getQueue(message)
            if (!queue) return message.channel.send(`I'm not singing now to stop !`)
            if (!args[0]) {
                return message.channel.send(`Please enter the time (in seconds) !`)
            }
            const time = Number(args[0])
            if (isNaN(time)) return message.channel.send(`Please enter a valid number!`)
            queue.seek((queue.currentTime + time))
            message.channel.send(`Forwarded the song for ${time}!`)
        }
        catch (e) {
            console.error(e)
            message.channel.send(`حدث خطا اثناء التشغيل !`)
        }
    }
    if (message.content.startsWith(prefix + "queue")) {
        if (!message.member.voice.channel) return message.reply({ content: `> **عذراً ، يجب ان تكون داخل روم صوتي لتستخدم هذا الأمر**` })
        try {
            const queue = client.distube.getQueue(message)
            if (!queue) return message.channel.send(`I'm not singing now to stop !`)
            const q = queue.songs
                .map((song, i) => `${i === 0 ? 'Playing:' : `${i}.`} ${song.name} - \`${song.formattedDuration}\``)
                .join('\n')
            message.channel.send(`**The Queue**\n${q}`)
        }
        catch (e) {
            console.error(e)
            message.channel.send(`حدث خطا اثناء التشغيل !`)
        }
    }
    if (message.content.startsWith(prefix + "help")) {
        try {
            message.channel.send({
                content: `
🎶 قائمة الأوامر\n
\`Play\` [p] : لتشغيل الأغنية او اضافتها للقائمة
\`Pause\` : إيقاف مؤقت للاغاني
\`Resume\` : لاكمال تشغيل الأغاني
\`Stop\` [s] : لإيقاف الاغاني بشكل كامل
\`Skip\` : لتخطي الاغنيه الحالية
\`Forward\` : لتشغيل الاغنيه عند وقت معين (بالثواني)
\`Autoplay\` : لتفعيل التشغيل التلقائي
\`Repeat\` : لتفعيل تكرار الاغنية
\`Nowplaying\` [np] : لعرض ما يتم تشغيله الأن
\`Queue\` : لعرض قائمه التشغيل
\`Volume\` [vol] : لتغير مستوى الصوت
\`Help\` : لعرض قائمه الأوامر
\n\n🛡 قائمة الأوامر الإدارية \n
\`Setname\` : لتغير اسم البوت
\`Setavatar\` : لتغير صوره البوت 
`
            })
        }
        catch (e) {
            console.error(e)
            message.channel.send(`حدث خطا اثناء التشغيل !`)
        }
    }
})

client.login(process.env.token)
