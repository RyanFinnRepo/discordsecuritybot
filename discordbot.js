const crypto = require('crypto');
const prompt = require('prompt');
const fs = require('fs');
const hashmap = require('hashmap');
const {Client, Intents} = require('discord.js');
const {token, clientId, threadId, threadIdTest, threadIdR, version} = require('./config.json');
const myIntents = new Intents();
myIntents.add(Intents.FLAGS.GUILD_MESSAGES,
   Intents.FLAGS.GUILD_BANS, Intents.FLAGS.GUILDS);
const client = new Client({ intents: myIntents });
const channel = client.channels.cache.get(thread);
const algorithm = 'aes-256-cbc';
var iv = crypto.randomBytes(16);
var {keyvar} = require('./key.json')

var word;
var thread;
var output;
var secure = false;
var map = new hashmap();

function encrypt(text) {
  let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(keyvar, 'hex'), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  iv = crypto.randomBytes(16);
  return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') };

}

function decrypt(text) {
  let iv = Buffer.from(text.iv, 'hex');;
  let encryptedText = Buffer.from(text.encryptedData, 'hex');
  let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(keyvar, 'hex'), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

function rekey(text){
  if (text === '-rk'){
    let text = keyvar;
  }
  var salt1 = 'ldkfvefnv92fritvnfjnpqiduncubvt4kmvirj4[irunfvnfvneofnejfnpihefinwe[finviy'
  var salt2 = 'cjepfjpfbgjenfybowdnfwyhfvr3gnrindcyduyebfvrpiyvydpgpihvrouysodnfpiuecyiwu'
  var salt3 = 'djnoyurpvhwcjdcqmcpijefvjrjnhgbvpudvojrfvbyr3fvo[i3rnyd8jthbjt4gouydvkrbj]'

  var key = text + salt1 + salt2 + salt3
  const hasher =  crypto.createHmac('sha256', key);
  var hash = hasher.update(key);
  var output = hash.digest('hex');
  var output1 = { keyvar: output }
  console.log(output);
  write.writeFile('key.json', JSON.stringify(output1), function(err) {
    if (err) return console.err(err);
  });
  let keyvar = (JSON.stringify(output1.keyvar).slice(1,65));

}


if (process.argv[2] === '-v') {
  console.log(version);
  process.exit();
}
else{
  thread = threadIdTest;
  console.log('test-env');
}


client.once('ready', message =>{
  console.log('Running');
  var recursiveReadline = function () {
  const channel = client.channels.cache.get(thread);
    prompt.start();
    prompt.get(['msg'], (err, result) =>{
      if (err) {
        throw err;
      }

      else {
        if (result.msg === 'exit'){
          return process.exit();
        }
        else if (result.msg === '-general'){
          thread = threadId;
          console.log(thread);
        }
        else if (result.msg === '-test'){
          thread = threadIdTest;
          console.log(thread);
        }
        else if (result.msg === '-root'){
          thread = threadIdR;
          console.log(thread);
        }
        else if (result.msg === '-secure'){
          secure = true;
          console.log('secure: ' + secure);
        }
        else if (result.msg === '-clear'){
          secure = false
          console.log('secure: ' + secure);
        }
        else if (((result.msg).slice(0,4)) === '-key'){
          try{
            console.log(JOSN.stringify(keyvar));
            console.log(rekey((result.msg).slice(4)))
            console.log(keyvar);
          }
          catch{}
        }
        else if (secure == true) {
          channel.send((encrypt(result.msg).iv) + (encrypt(result.msg).encryptedData));
        }
        else {
          if (result.msg != ''){
            channel.send(result.msg);
          }

        }
        recursiveReadline();
      }
    });
  }

  recursiveReadline();

});

function modinit(){
  fs.readFile('wordlist.txt', "utf8", (err, data) => {
    if (err){
      console.error(err);
      return
    }
    word = data.toString().split('\n')
    for (var i = 0; i < word.length - 1; i++){
      map.set(word[i], 'bannedWord');
    }
  });
}

modinit()

function mod(text) {
  for (var i = 0; i < text.length; i++){
    if (map.get(text[i]) === 'bannedWord') {
    return map.get(text[i]);
    }
  }
}


client.on('messageCreate', messageCreate => {
  try{
    output = (decrypt({ iv: messageCreate.content.slice(0, 32),
       encryptedData: messageCreate.content.slice(32) }));

       if(output === '-rk') {
         try{
           rekey(output);
         }
         catch{}
       }
       else if(output.slice(0,4) === '*rk*') {
         try{
           rekey(output.slice(4));
         }
         catch{}
       }

    if (messageCreate.author.id != clientId){
      console.log(output);
    }
  }
  catch {
    console.log(messageCreate.content);
  }

});
client.on("messageCreate", (message) =>{

  var options = ["That word isnt allowed", "You said a banned word", "Don't say that", "Hush"];
  if (mod(message.content.split(' ')) === 'bannedWord'){
    message.delete();
    var response = options[Math.floor(Math.random()*options.length)];
    message.channel.send(response).then().catch(console.error).then(message => {setTimeout(() => message.delete(), 3000)});
  }
});
client.login(token);
