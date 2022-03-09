const bcrypt =require('bcrypt');


async function genPassword(password){
    const salt=await bcrypt.genSalt(10);
    return await bcrypt.hash(password,salt);
}

async function Saveurl(Email,token){

    const client=await connection();
    return client.db("users").collection("token").insertOne({Email:Email ,token:token})
}

module.exports={ genPassword,Saveurl }