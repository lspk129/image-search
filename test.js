const GoogleImages = require('google-images');

const CSE_ID = '017773660364527201791:rawc34z4yvy';
const API_KEY = 'AIzaSyAtnOTfITJgwpSrnHPF5laggqz8_NSiSU8';
const client = new GoogleImages(CSE_ID, API_KEY);

client.search('funny cats', { page: 1 })
  .then(images => console.log(images));
