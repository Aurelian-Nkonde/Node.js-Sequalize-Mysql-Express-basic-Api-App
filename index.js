var createError = require('http-errors');
var express = require('express');
var path = require('path');
var logger = require('morgan');
const bodyParser = require("body-parser")
const Sequalize = require("sequelize");
const DataType = require("sequelize")



var app = express();

// middlewares
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));


// database
const sequelize = new Sequalize(
    'crud',
    'root',
    'Thousand@90',
    {
        host: 'localhost',
        dialect: 'mysql'
    }
)


try
{
    sequelize.authenticate().then(() => {
        console.log("database created")
    })
}catch(error){
    console.log("database was not created");
}


// model
const hacker = sequelize.define('hackers', {
    name: {
        type: DataType.STRING,
        allowNull: false
    },
    city: {
        type: DataType.STRING,
        allowNull: false
    },
    age: {
        type: DataType.STRING,
        allowNull: false
    }
})

try
{
    hacker.sync({force: true}).then(() => {
        console.log("model hacker was created");
    })
}catch(error){
    console.log("model was not created, error: ", error)
}



// routes
app.get("/status", (req, res) => {
    if(req.url == "/status"){
        res.status(200).send(`<h1>the api is working=</h1>`)
    }else{
        res.status(400).send("Not the status endpoint")
    }
})


app.get("/", (req, res) => {
    hacker.findAll()
        .then(data => {
            res.status(200).json(data)
        }).catch(error => {
            console.log("the list of hackers is not found")
        })
})


app.get("/:id", (req, res) => {
    const id = req.params.id;
    hacker.findByPk(id)
        .then(data => {
            if(!data){
                res.status(400).send("hacker not found")
            }else{
                res.status(200).send(data);
            }
        }).catch(error => {
            console.log("can't retrieve a single hacker ", error)
        })
})

app.post("/", (req, res) => {
    const newhacker = {
        name: req.body.name,
        city: req.body.city,
        age: req.body.age
    }
        hacker.create(newhacker).then(data => {
            console.log(data);
            res.status(200).send({
                message: "hacker created",
                hackerInfo: data
            })
        }).catch(error => {
            console.log("hacker cant be created", error)
        })
})

app.put("/:id", (req, res) => {
    if(req.params.id == 0 || req.params.id == null){
        res.status(400).send("Bad request params")
    }
    const id = req.params.id;
    hacker.findByPk(id).then(data => {
        if(!data){
            res.status(400).send("hacker not found");
        }
        data.name = req.body.name;
        data.city = req.body.city;
        data.age = req.body.age;
        data.save();
        res.status(200).send("hacker updated")
    }).catch(error => {
        console.log("cant find the hacker to update: ", error)
    })
})

app.delete("/:id", (req, res) => {
    if(req.params.id == 0){
        res.status(400).send("bad request")
    }
    hacker.destroy({
        where: {
            id: req.params.id
        }
    }).then(data => {
        res.status(200).send({
            message: `hacker deleted with this id ${data.id}`
        })
    }).catch(error => {
        console.log("cant find a hacker to delete!: ", error)
    })
})



app.listen(3000, () => {
    console.log("server running on port:3000")
})