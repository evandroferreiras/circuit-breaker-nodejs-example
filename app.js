const { setupCircuitBreaker } = require("./setupCircuitBreaker");


const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// circuit breaker
const circuit = setupCircuitBreaker();

app.use('/', (request, response) => {
    circuit.fire().then(result => {
        response.send(result);
    }).catch(err => {
        response.send(err.message);
    });
});

app.listen(3000, () => console.log("Listening to port 3000 (http://localhost:3000)"));



