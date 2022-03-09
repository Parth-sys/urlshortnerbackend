const jwt=require('jsonwebtoken');

 const auth=(req,res,next)=>{
    try{
        const token=req.header('x-auth-token');
        console.log(token);
        jwt.verify(token,process.env.SECRET_KEY)
        next();
    }
    catch(err){
        res.status(401);
        res.send({error:err.message})

    }
}
module.exports={
    auth
}