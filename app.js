//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");

const app = express();
const mongoose=require("mongoose")
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const items = ["Buy Food", "Cook Food", "Eat Food"];
const workItems = [];

mongoose.connect("mongodb://127.0.0.1:27017/todolistDBNewVersion",{useNewUrlParser: true});

const ToDoListSchema={
    name:{
        type:String
    }
}

const item=mongoose.model("item",ToDoListSchema)

const itemOne=new item(
    {
        name:"Jogging"
    }
)
const itemTwo=new item(
    {
        name:"Swimming"
    }
)
const itemThree=new item(
    {
        name:"Archery"
    }
)
const defaultItems=[itemOne,itemTwo,itemThree]




app.get("/", function(req, res) {

const day = date.getDate();
item.find(function(error,result){
  if(error){
    console.log(error+"issues")
  }else{
    if(result.length === 0){
      item.insertMany(defaultItems,function(error){
        if(error){
            console.log(error)
        }else{
            console.log("Sucess")
        }
    })
      console.log(result+"\n Sucessfully added data")
      res.redirect("/")
      
    }else{
      res.render("list", {listTitle: "Today", newListItems: result});
      console.log("Sucessfully displayed data")
    }
    
  }
  })
  

});



app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});



const listSchema={
  name:String,
  items:[ToDoListSchema]
}

const List= mongoose.model("list", listSchema)


app.get("/:customListName",function(req,res){
  console.log(req.params.customListName)
  List.findOne({name:req.params.customListName},function(erro,succ){
    if(erro){
      console.log(erro)
    }else{
      if(!succ){
        console.log("Did not find one")
        const list=new List(
          {
            name:req.params.customListName,
            items:defaultItems
          })
          list.save();
          res.redirect("/"+req.params.customListName);
      }else{
        console.log("found one")
        res.render("list", {listTitle:succ.name, newListItems: succ.items});

      }
    }
  })
  
})

app.post("/", function(req, res){
  const itemToAdd = req.body.newItem;
  const listname=req.body.list;
  const i=new item({
    name:itemToAdd
  })
  console.log(listname)
  if(listname==="Today"){
    item.create({name:itemToAdd},function(error,sucess){
      if(error){
      console.log("Unsucessfully added to the system")
      }else{
        console.log("Sucessfully added to the table")
      }
    })
    res.redirect("/")
  }else{
    console.log("reached here")
    List.findOne({name:listname},function(err,foundlist){
      foundlist.items.push(i)
      // foundlist.items.create({name:itemToAdd},function(err,respon){
      //   if(err){
      //     console.log("Not cretaed")
      //   }else{
      //     console.log("successfullly created")
      //   }
      // })
      foundlist.save()
      res.redirect("/"+listname);
    })
  }
  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  // }
});

app.post("/delete",function(req,res){
  console.log(req.body.checkbox)
  const listname=req.body.listName;
  const todelete=req.body.checkbox;
  if(listname==="Today"){
    item.findByIdAndRemove(todelete,function(err){
      if(err){
        console.log("could not delete")
      }else{
        console.log("Deleted the row")
        res.redirect("/");
      }
    })
  }else{
    List.findOneAndUpdate({name:listname},{$pull:{items:{_id:todelete}}},function(err,foundlist){
      console.log(foundlist)
      if(!err){
          res.redirect("/"+listname)
      }else{
        console.log("galati hui hai")
      }
    })  
  }
  
  
})
app.listen(3000, function() {
  console.log("Server started on port 3000");
});
