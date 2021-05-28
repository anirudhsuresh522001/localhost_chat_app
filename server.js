var express=require("express")
var bodyParser=require("body-parser")
var app=express()
var http=require("http").Server(app)
var io=require("socket.io")(http)
var mongoose=require("mongoose")

mongoose.Promise=Promise

let port=process.env.PORT||3000


app.use(express.static(__dirname))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:false}))


var dbUrl="mongodb+srv://AnirudhSuresh:Anirudh989@cluster0.vwdlu.mongodb.net/MESSAGING_APP?retryWrites=true&w=majority"


var Message=mongoose.model("Message",{
    name:String,
    message:String
})


app.get("/messages",(req,res)=>{
    Message.find({},(err,messages)=>{
        res.send(messages)
    })
    
})


app.get("/messages/:user",(req,res)=>{

    var user=req.params.user 

    Message.find({name:user},(err,messages)=>{
        res.send(messages)
    })
    
})

app.post("/messages",async (req,res)=>{
    if(req.body.name!==undefined)
    {
        try {
            var message=new Message(req.body)

            await message.save()

            var censored=await Message.findOne({message:"badword"})
            
            if(censored)
                await Message.deleteOne({_id:censored.id})
            else    
                io.emit("message",req.body)
            
            res.sendStatus(200)
            
        } catch (error) {
            res.sendStatus(500)
            return console.error(error)
        }     
    }
    
})

io.on("connection",(socket)=>{})


mongoose.connect(dbUrl,{ useNewUrlParser: true,useUnifiedTopology: true },(err)=>{
    console.log("MongoDB Connected",err)
})

var server=http.listen(port,()=>{
    console.log("Server listening on port",port)
})