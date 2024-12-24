const { NlpManager } = require('node-nlp');
const fs = require('fs');

async function trainChatbot() {
  const manager = new NlpManager({ languages: ['en'] });
  const intents = JSON.parse(fs.readFileSync('./models/chatbot/intents.json', 'utf8'));

  // Add intents and utterances
  intents.intents.forEach(intent => {
    intent.utterances.forEach(utterance => {
      manager.addDocument('en', utterance, intent.intent);
    });
    intent.answers.forEach(answer => {
      manager.addAnswer('en', intent.intent, answer);
    });
  });

  // Train the model
  await manager.train();
  manager.save('./models/chatbot/model.nlp');
  console.log('Chatbot trained and model saved!');
}

trainChatbot();
