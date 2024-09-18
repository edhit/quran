const { Telegraf } = require("telegraf");
const { message } = require("telegraf/filters");
const axios = require("axios");

const bot = new Telegraf("7334361333:AAH9f0tf96gkg81M4MjxT48kQmiZDFu1OlM");

bot.start((ctx) => ctx.reply("Welcome"));
bot.help((ctx) => ctx.reply("Send me a sticker"));
bot.on(message("sticker"), (ctx) => ctx.reply("👍"));
bot.hears("hi", (ctx) => ctx.reply("Hey there"));

bot.on(message("text"), async (ctx) => {
  const data = ctx.message.text;

  if (data.indexOf(":") === -1) {
    await ctx.reply("Ошибка! Пиши так: 2:262,263,264");
    return;
  }

  const surah = data.split(":")[0];
  const ayats = data.split(":")[1];

  const ayat = ayats.split(",");

  for (let index = 0; index < ayat.length; index++) {
    if (Number(ayat[index])) {
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
            `https://tanzil.net/res/audio/husary/${bbb}${aaa}.mp3`,
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
