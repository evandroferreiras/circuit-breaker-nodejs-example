const { delayedFunction } = require("./delayedFunction");
const circuitBreaker = require('opossum');
function setupCircuitBreaker() {
    const circuitBreakerOptions = {
        errorThresholdPercentage: 50,
        timeout: 1000,
        resetTimeout: 30000
    };
    const circuit = circuitBreaker(delayedFunction, circuitBreakerOptions);
    circuit.fallback((error) => {
        if (error){
            console.log(error.message)
            return error.message;
        }
        console.log("Fallback")
        return "Fallback";
        
    });

    circuit.on('halfOpen', () => {
        console.log('Circuit breaker is halfOpen');
    });
    circuit.on('open', () => {
        console.log('Circuit breaker is open');
    });
    circuit.on('close', () => {
        console.log('Circuit breaker is closed');
    });
    return circuit;
}
exports.setupCircuitBreaker = setupCircuitBreaker;