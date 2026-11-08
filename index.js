 const express = require('express')

 const app = express()

 app.get('/', (req,res) => { 
    res.send("<h1>Sanju</h1>")
  })

  const Port = 3000;
  app.listen(Port,() => { 
    console.log('ksfklsdhflksj');
    
   })