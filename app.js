const express = require('express');
const bodyParser = require('body-parser');

const app = express();

const circuitBreaker = require('opossum');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const baseline = 20;
let delay = baseline;
let timeErrorOcurred = null;
function flakeFunction() {
    return new Promise((resolve, reject) => {

        if (timeErrorOcurred) {
            var millisecondsPassed = new Date().getTime() - timeErrorOcurred;
            console.log(millisecondsPassed);
            if (millisecondsPassed > 5000) {
                delay = baseline;
                timeErrorOcurred = null;
            }
        }
        if (delay > 1000) {
            console.log(delay);
            timeErrorOcurred = new Date().getTime();
            return reject(new Error('Service failing'));
        }

        setTimeout(() => {
            msg = `Service is responding in ${delay} secs`;
            console.log(msg);
            resolve(msg);
            delay = delay * 2;
        }, delay);

    });
}


// circuit breaker
const circuitBreakerOptions = {
    errorThresholdPercentage: 50,
    timeout: 1000,
    resetTimeout: 30000
};

const circuit = circuitBreaker(flakeFunction, circuitBreakerOptions);
circuit.fallback((error) => error.message);
circuit.on('halfOpen', () => {
    console.log('Circuit breaker is halfOpen')
})
circuit.on('open', () => {
    console.log('Circuit breaker is open')
})
circuit.on('close', () => {
    console.log('Circuit breaker is closed')
})

app.use('/', (request, response) => {
    circuit.fire().then(result => {
        response.send(result);
    }).catch(err => {
        response.send(err.message);
    });
});

app.listen(3000, () => console.log("Listing to the port 3000"));