const express=require('express');
const cors=require('cors');
const bodyParser=require('body-parser');
const connection=require('./connection.js')
const help=require('./helper');
const dotenv=require('dotenv');
const nodemailer=require('nodemailer')
const auth=require('./middleware/auth.js');
const req = require('express/lib/request');
const res = require('express/lib/response');
const { response } = require('express');
const bcrypt=require('bcrypt');
const flash = require('connect-flash');


dotenv.config()
const app=express();
app.use(cors());
app.use(bodyParser.json());
app.use(flash());
app.set('view engine','ejs')

 


const port=process.env.PORT ||5000



let users=[];
var count=0;
var emailstore;

var transporter=nodemailer.createTransport({
      
  host: 'smtp.gmail.com', //replace with your Email provider
  port:465,
  secure:true,
  auth:{
     
      user:process.env.EMAIL,
      pass:process.env.PASSWORD
  }
})

transporter.verify(function(error, success) {
  if (error) {
    console.log(error);
  } else {
    console.log("Server is ready to take our messages");
  }
});



app.get('/',function(req,res){
    res.json({
     
      
      output:"hi"})

    
    console.log("hi local");
})

app.get('/users',async function(req,res){
    const client=await connection.Connection();
      const result= await client.db('backshow').collection('Managers').find().toArray();
      console.log(result)
      res.send(result);
})



app.post('/createuser',async(request,response)=>{

   
   const client=await connection.Connection();

   const{Email,firstname,lastname,password}=request.body
   
   const haspass=await help.genPassword(password);

   
   const result=await client.db('backshow').collection('Managers').insertOne({Email:Email,firstname:firstname,lastname:lastname,password:haspass,Status:"inactive"});
   console.log(result)
   
   const check=await client.db('backshow').collection('Managers').find({Email:Email}).count()

    console.log(check)
    
    if(check >1){
      response.status(400).send("user exist")
    
    var d=  await  client.db('backshow').collection('Managers').deleteOne({Email:Email});
       console.log(d)
      console.log(result);    
    }
    
    if(check === 1){
      response.status(200).send(" registration successful");  

      const characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
      let token = '';
      for (let i = 0; i < 25; i++) {
          token += characters[Math.floor(Math.random() * characters.length )];
      }
        help.Saveurl(Email,token)
  
        emailstore=Email;
  
        var mailOptions={
          from:'ticketbook401@gmail.com',
          to:Email,
          subject:'sending Email for authentication of user',
          text:"hi ur verification link is here , ur verificaion code:"+ token,
          html: `<p> Click <a href="https://zealous-lumiere-ff13e7.netlify.app/forgetpass">+${Click}</a> to Activate your account .  </p>`
          
      }
  
     

          transporter.sendMail(mailOptions,function(error,info){
              if(error){
                  console.log(error);
              }else{
                  console.log("Email sent" + info.response);
                  count++;
              }
          })
        
          response.send("success,check ur Email");
      }
      
      
      
      else{
          response.send("error")
      }


    

  
})
 

app.get('/activate',async (request,response)=>{
  const client=await connection.Connection();
   const {Email}=req.body
   Email=emailstore
    const activate=await client.db('backshow').collection('Managers').updateOne({Email:Email},{$set:{Status:"Active"}});
    
    if(activate){
       res.send("Ur account active now")
     }
     



})






app.post("/login",async(request,response)=>{

   const client=await connection.Connection();
   const{Email,password}=request.body
   

   //check status of account with Email if it is active or not
   const check= await client.db('backshow').collection('Managers').findOne({Email:Email});
   
   
   const result= await client.db("backshow").collection("Managers").findOne({Email:Email});
   console.log(result)

   const storepass=result.password;

   const matching=await bcrypt.compare(storepass,password);
   
   if(!result){
     response.status(400).send("user not registered,Please signup ")
    }
    
    if(check.Status!="Active"){
      response.status(401).send("Please verify ur account first");
    }
  
    if(matching){

      const token=jwt.sign({id:result._id},process.env.SECRET_KEY) //jwt token
      const userInfo=Object.assign({},{...result});

 response.status( 200).send({ message:"login sucessful",token:token});
  }
  else{
      response.status( 401).send({message:"inavalid login"});
  }


})



app.post('/verify',async(request,response)=>{

    const client=await connection.Connection();

   const{Email}=request.body;

    const result= await client.db("backshow").collection("Managers").findOne({Email:Email});

    if(!result){
       response.status(401).send("Email is not registerd,please signup");
    }

    if(result){
       
    const characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let token = '';
    for (let i = 0; i < 25; i++) {
        token += characters[Math.floor(Math.random() * characters.length )];
    }
      help.Saveurl(Email,token)

      emailstore=Email;

      var mailOptions={
        from:'ticketbook401@gmail.com',
        to:Email,
        subject:'sending Email for authentication of user',
        text:"hi ur verification link is here , ur verificaion code:"+ token,
        html: `<p>Click <a href="https://zealous-lumiere-ff13e7.netlify.app/forgetpass">+${token}</a> Click here to Change Password .</p>`
    
            
        
    }

        transporter.sendMail(mailOptions,function(error,info){
            if(error){
                console.log(error);
            }else{
                console.log("Email sent" + info.response);
                count++;
            }
        })
      
        response.send("success,check ur Email");
    }else{
        response.send("error")
    }


  }
)


app.put('/newpass', async(request,response)=>{

const Email=emailstore;
const client= await connection.Connection();

const{password}=request.body;

 const result= await client.db("backshow").collection("Managers").updateOne({Email:Email}, {$set:{password:password}});

 if(!result){
    response.status(401).send("Email is not valid,please signup");
 }
  if(result){
    response.status(200).send("Password Changed");
  }




});
 


app.listen(port, (req,res)=>{
    console.log("server is live",port);
})