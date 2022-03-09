async function Connection(){
    
    const client=require('mongodb').MongoClient;

    const url=process.env.url;

  const Client=new client(url)
   await Client.connect();
   console.log("mongodb connected");
   return Client
}


module.exports={
    Connection
}

  
