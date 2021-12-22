const router = require("express").Router();
const notif = require("../constants/newsData")
const news =require('../models/notif')

router.get('/',async(req,res)=>{
    try{
      await news.deleteMany({})
     await news.insertMany(notif)
     const News=await news.find({})
     res.status(200).send(News)
    }catch(err){
      res.status(500).json(err);
    }
})
  
module.exports = router;