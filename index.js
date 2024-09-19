require('dotenv').config()

const { Telegraf, Markup, session } = require("telegraf");
const { message } = require("telegraf/filters");

const bot = new Telegraf(process.env.BOT_TOKEN);

const reader = ["husary", "muaiqly"]

const buttons = Markup.keyboard([
  reader
]).resize()

bot.use(session())
bot.start((ctx) => ctx.reply("Welcome", buttons));
bot.on(message("text"), async (ctx) => {
  const data = ctx.message.text;

  if (reader.includes(data)) {
    ctx.session = data
    await ctx.reply('👍')
    return
  } else if (!ctx.session) {
    ctx.session = reader[0]
  }

  console.log(ctx.session);
  if (data.indexOf(":") === -1) {
    await ctx.reply("Ошибка! Пиши так: 2:262,263,264");
    return;
  }

  const surah = data.split(":")[0];
  const ayats = data.split(":")[1];

  const ayat = ayats.split(",");

  for (let index = 0; index < ayat.length; index++) {
    if (Number(ayat[index]) && Number(surah)) {
      let bbb
      let aaa;

      if (surah.length === 1) bbb = `00${surah}`;
      else if (surah.length === 2) bbb = `0${surah}`;
      else bbb = `${surah}`;

      if (ayat[index].length === 1) aaa = `00${ayat[index]}`;
      else if (ayat[index].length === 2) aaa = `0${ayat[index]}`;
      else aaa = `${ayat[index]}`;

      try {
        await ctx.replyWithPhoto(
          `https://cdn.islamic.network/quran/images/high-resolution/${surah}_${ayat[index]}.png`,
        );
        await ctx.replyWithAudio(
            `https://tanzil.net/res/audio/${ctx.session}/${bbb}${aaa}.mp3`,
          );
      } catch (error) {
        await ctx.reply(`Ошибка в поиске этого аята: ${ayat[index]}. Исправь!!!`);
        return 
      }
    } else{
        await ctx.reply(`Ошибка в поиске этого аята: ${ayat[index]}. Исправь!!!`);
        return
    }
  }

  //   for (let index = 0; index < ayat.length; index++) {
  //     // if (Number(ayat[index])) {
  //     //     let config = {
  //     //         method: "get",
  //     //         maxBodyLength: Infinity,
  //     //         url: `https://api.alquran.cloud/v1/ayah/${surah}:${ayat[index]}/en.asad`,
  //     //         headers: {
  //     //           Accept: "application/json",
  //     //         },
  //     //       };

  //     //       axios(config)
  //     //         .then(async (response) => {
  //     //           const result = response.data;
  //     //           // console.log(result.data.number);

  //     //           await this.delay(10000)
  //     //         })
  //     //         .catch(async (error) => {
  //     //           await ctx.reply(`Ошибка в поиске этого аята: ${ayat[index]}`);
  //     //           return;
  //     //         });
  //     // }
  //   }
});

bot.launch();

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
