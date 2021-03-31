const axios = require("axios")
const express = require("express")
const compression = require("compression")

const app = express()
app.use(compression())

app.get("/getTimeStories", async (req, res) => { // get stories
 date = new Date()
 stories = []
 while (stories.length < 5) {
  try {
   let response = await axios.get(`https://time.com/sitemap.xml?yyyy=${
       date.getFullYear()
   }&mm=${
       date.getMonth() + 1
   }&dd=${
       date.getDate()
   }`)
   let data = response.data
   let pattern = new RegExp('(?<=\<loc\>).*?(?=\<\/loc\>)', 'gm')
   let matches = data.matchAll(pattern)
   for (let match of matches) {
    stories.push({link: match[0]})
    if (stories.length == 5) 
     break
   }
  } catch (err) {
   res.status(500).send({message: "fetch failed from time.com"})
   return
  }
  // decrement date
  date.setDate(date.getDate() - 1)
 }
 for (let story of stories) {
     try {
      let response = await axios.get(story.link)
      let data = response.data
      let pattern = new RegExp('(?<=\<meta property="og:title" content=")(.*?)(?="\/?\>)', 'gm')
      let match = data.match(pattern)
      story.title = match[0]
     } catch (err) {
      res.status(500).json({message: "fetch failed from time.com"})
     }
 }
 res.status(200).json(stories)
})

app.listen(80, () => {
 console.log(`Server started on ${new Date().toLocaleString()}.`)
 console.log(`Go to http://127.0.0.1/getTimeStories to fetch the latest 5 stories from time.com`)
})
